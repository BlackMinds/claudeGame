import Vue from 'vue'
import { realms, xianRealms, moRealms, maps, equipSlots, generateEquipment, getRandomSkills, skills, getSkillById, getSkillDamage, getPassiveSkillStats, getSkillExpForLevel, rollSkillBookDrop, skillRarityConfig, getEnhanceSuccessRate, getEnhanceCost, getEnhanceDropLevels, getEnhancedStatValue, MAX_ENHANCE_LEVEL, towerConfig, generateTowerFloorMonsters, getPetStats, getPetExpForLevel, generatePetEgg, hatchPetEgg, generateAptitudePill, calculatePetStats, getAptitudeMultiplier, generatePetSkillBook, shouldDropPetSkillBook, openPetSkillBook, equipmentSets, artifactMaterials, materialDropRates, getMapDroppableMaterials, getTowerDroppableMaterials, craftArtifact, getArtifactExpForLevel, getCraftedArtifactStats, getMaterialById, talentConfig, talentTree, getTalentEffects, getBranchPoints, getTotalUsedPoints, canAddTalentPoint } from '../data/gameData'
import { calculateChecksum, verifyChecksum, validatePlayerData } from '../utils/security'

// 获取网络时间（返回日期字符串 YYYY-MM-DD）
async function getNetworkDate() {
  try {
    const response = await fetch('https://worldtimeapi.org/api/ip', { timeout: 5000 })
    const data = await response.json()
    // datetime格式: "2024-01-15T10:30:00.123456+08:00"
    return data.datetime.split('T')[0]
  } catch (e) {
    console.warn('获取网络时间失败，使用本地时间', e)
    // 降级使用本地时间
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }
}

// 缓存当天日期（避免频繁请求）
let cachedDate = null
let cachedDateTimestamp = 0
const DATE_CACHE_DURATION = 60000 // 缓存1分钟

async function getTodayDate() {
  const now = Date.now()
  if (cachedDate && (now - cachedDateTimestamp) < DATE_CACHE_DURATION) {
    return cachedDate
  }
  cachedDate = await getNetworkDate()
  cachedDateTimestamp = now
  return cachedDate
}

// 加密密钥
const ENCRYPT_KEY = 'xiuxian2024secret'

// 简单加密函数
function encrypt(data) {
  try {
    const jsonStr = JSON.stringify(data)
    // XOR加密 + Base64编码
    let encrypted = ''
    for (let i = 0; i < jsonStr.length; i++) {
      encrypted += String.fromCharCode(jsonStr.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length))
    }
    return btoa(encodeURIComponent(encrypted))
  } catch (e) {
    console.error('加密失败', e)
    return null
  }
}

// 简单解密函数
function decrypt(encryptedData) {
  try {
    const encrypted = decodeURIComponent(atob(encryptedData))
    let decrypted = ''
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length))
    }
    return JSON.parse(decrypted)
  } catch (e) {
    console.error('解密失败', e)
    return null
  }
}

// 计算升级所需经验（大幅提升难度）
function getExpForLevel(level) {
  return Math.floor(120 * level * (1 + level * 0.15))
}

// 生成新手装备（法宝已移至打造系统）
function generateStarterEquipment() {
  return {
    weapon: generateEquipment(1, 'weapon', 'white'),
    armor: generateEquipment(1, 'armor', 'white'),
    helmet: generateEquipment(1, 'helmet', 'white'),
    ring: generateEquipment(1, 'ring', 'white'),
    necklace: generateEquipment(1, 'necklace', 'white'),
    boots: generateEquipment(1, 'boots', 'white')
  }
}

// 创建响应式游戏状态
export const gameState = Vue.observable({
  player: {
    name: '无名修士',
    level: 1,
    exp: 0,
    realmId: 1,
    realmExp: 0,
    cultivationType: 'none', // 'none' | 'xian' | 'mo' 修炼类型
    gold: 100,
    // 技能系统
    learnedSkills: {},       // { skillId: { level: 1, exp: 0 } }
    equippedActiveSkills: [],   // [skillId, ...] 最多4个主动技能
    equippedPassiveSkills: [],  // [skillId, ...] 最多2个被动技能
    // 基础属性
    baseHp: 150,
    baseAttack: 15,
    baseDefense: 8,
    // 战斗属性
    critRate: 5,
    critResist: 0,
    critDamage: 50,
    dodge: 3,
    hit: 95,
    penetration: 0,
    skillDamage: 0,
    // 装备栏（开局赠送新手装备）
    equipment: generateStarterEquipment(),
    // 背包 (装备和技能书)
    inventory: [],
    // 宠物系统
    pets: [],           // 拥有的宠物列表
    activePetId: null,  // 当前出战的宠物ID
    petEggs: [],        // 宠物蛋存储
    aptitudePills: [],  // 资质丹存储
    // 宠物蛋每日领取记录 { 10: '2024-01-15', 100: '2024-01-15', 200: '2024-01-15' }
    petEggClaimedDates: {},
    // 资质丹每日领取记录 { 50: '2024-01-15', 150: '2024-01-15' }
    aptitudePillClaimedDates: {},
    // 额外被动技能栏位（锁妖塔50层奖励）
    bonusPassiveSlots: 0,
    // 额外背包格子（锁妖塔20/30/40层奖励）
    bonusInventorySlots: 0,
    // 法宝打造系统
    artifactMaterials: {},  // 材料背包 { materialId: count }
    craftedArtifacts: [],   // 打造的法宝列表
    equippedCraftedArtifact: null,  // 当前装备的打造法宝
    // 天赋系统
    talents: {},  // 天赋分配 { branchId: { talentId: points } }
    talentsVersion: 0  // 天赋版本号，用于触发Vue响应式更新
  },
  // 拾取筛选设置
  lootFilter: {
    enabled: false,           // 是否启用筛选
    minQuality: 'white',      // 最低拾取品质: white/green/blue/purple/orange
    autoSellFiltered: false,  // 过滤的装备是否自动卖出（获得金币）
    pickupSkillBooks: true    // 是否拾取技能书
  },
  // 战斗状态
  battle: {
    isAutoBattle: false,
    isInBattle: false,
    currentMonsters: [], // 多个怪物
    currentMonsterIndex: 0, // 当前攻击的怪物索引
    playerCurrentHp: 100,
    playerBuffs: {}, // 玩家增益效果
    skillCooldowns: {}, // 技能冷却
    petSkillCooldowns: {}, // 宠物技能冷却
    roundCount: 0, // 回合计数
    battleLog: [],
    selectedMapId: 1,
    battleTimer: null,
    killCount: 0,
    // 战斗统计
    battleStats: {
      startTime: null,
      totalExp: 0,
      totalGold: 0,
      totalKills: 0,
      drops: {
        white: 0,
        green: 0,
        blue: 0,
        purple: 0,
        orange: 0,
        skillBooks: 0
      }
    },
    // 锁妖塔状态
    isTowerMode: false,
    towerFloor: 1,
    towerHighestFloor: 1,
    towerStartFloor: 1
  },
  logs: [],
  // 开发用：经验/掉落/金币倍率
  devExpMultiplier: 1,
  devDropMultiplier: 1,
  devGoldMultiplier: 1
})

// 获取当前使用的境界表
export function getCurrentRealmTable() {
  const type = gameState.player.cultivationType
  if (type === 'mo') return moRealms
  if (type === 'xian') return xianRealms
  // 未选择时默认使用仙修表（凡人境界是一样的）
  return xianRealms
}

// 获取当前境界
export function getCurrentRealm() {
  const realmTable = getCurrentRealmTable()
  return realmTable.find(r => r.id === gameState.player.realmId) || realmTable[0]
}

// 获取下一个境界
export function getNextRealm() {
  const realmTable = getCurrentRealmTable()
  return realmTable.find(r => r.id === gameState.player.realmId + 1)
}

// 获取修炼类型
export function getCultivationType() {
  return gameState.player.cultivationType
}

// 设置修炼类型（只能设置一次）
export function setCultivationType(type) {
  if (gameState.player.cultivationType !== 'none') {
    return false // 已经选择过了
  }
  if (type !== 'xian' && type !== 'mo') {
    return false // 无效类型
  }
  gameState.player.cultivationType = type
  autoSave()
  return true
}

// 获取升级所需经验
export function getExpToNextLevel() {
  return getExpForLevel(gameState.player.level)
}

// 检查是否满级
export function isMaxLevel() {
  return gameState.player.level >= MAX_LEVEL
}

// 获取最高等级
export function getMaxLevel() {
  return MAX_LEVEL
}

// 计算装备提供的属性加成（包含强化加成）
export function getEquipmentStats() {
  const stats = {
    hp: 0,
    attack: 0,
    defense: 0,
    critRate: 0,
    critResist: 0,
    critDamage: 0,
    dodge: 0,
    hit: 0,
    penetration: 0,
    skillDamage: 0,
    dropRate: 0,
    damageReduction: 0,
    thorns: 0,
    lifesteal: 0
  }

  // 只有这三个属性参与强化加成
  const enhanceableStats = ['hp', 'attack', 'defense']

  for (const equip of Object.values(gameState.player.equipment)) {
    if (equip && equip.stats) {
      const enhanceLevel = equip.enhanceLevel || 0
      for (const [stat, value] of Object.entries(equip.stats)) {
        if (stats.hasOwnProperty(stat)) {
          // 只对 hp, attack, defense 应用强化加成，其他属性使用原始值
          if (enhanceableStats.includes(stat)) {
            stats[stat] += getEnhancedStatValue(value, enhanceLevel)
          } else {
            stats[stat] += value
          }
        }
      }
    }
  }

  return stats
}

// 计算被动技能提供的属性加成（只计算已装备的被动技能）
export function getPassiveSkillBonus() {
  const stats = {
    hp: 0,
    attack: 0,
    defense: 0,
    critRate: 0,
    critResist: 0,
    critDamage: 0,
    dodge: 0,
    hit: 0,
    penetration: 0,
    skillDamage: 0,
    lifesteal: 0,
    damageReduction: 0,
    hpRegen: 0,
    hpPercent: 0,
    attackPercent: 0,
    defensePercent: 0,
    thorns: 0,
    lowHpDefenseBonus: 0,
    fatalReflect: 0
  }

  for (const skillId of gameState.player.equippedPassiveSkills) {
    const skill = getSkillById(skillId)
    const skillData = gameState.player.learnedSkills[skillId]
    if (skill && skill.type === 'passive' && skillData) {
      const skillStats = getPassiveSkillStats(skill, skillData.level)
      for (const [stat, value] of Object.entries(skillStats)) {
        if (stats.hasOwnProperty(stat)) {
          stats[stat] += value
        }
      }
    }
  }

  return stats
}

// 计算套装加成
export function getSetBonuses() {
  const bonuses = {
    hp: 0,
    attack: 0,
    defense: 0,
    critRate: 0,
    critDamage: 0,
    penetration: 0,
    dodge: 0,
    damageReduction: 0,
    thorns: 0,
    lifesteal: 0
  }

  // 统计每个套装装备的数量
  const setCounts = {}
  for (const equip of Object.values(gameState.player.equipment)) {
    if (equip && equip.setId) {
      setCounts[equip.setId] = (setCounts[equip.setId] || 0) + 1
    }
  }

  // 计算套装加成
  const activeSets = []
  for (const [setId, count] of Object.entries(setCounts)) {
    const setConfig = equipmentSets[setId]
    if (!setConfig) continue

    // 找到满足的最高阶套装效果
    const thresholds = Object.keys(setConfig.bonuses).map(Number).sort((a, b) => b - a)
    for (const threshold of thresholds) {
      if (count >= threshold) {
        const setBonus = setConfig.bonuses[threshold]
        for (const [stat, value] of Object.entries(setBonus)) {
          if (stat !== 'description' && bonuses.hasOwnProperty(stat)) {
            bonuses[stat] += value
          }
        }
        activeSets.push({
          name: setConfig.name,
          count,
          threshold,
          description: setBonus.description
        })
        break // 只取最高阶效果
      }
    }
  }

  return { bonuses, activeSets }
}

// 计算最终属性
export function getPlayerStats() {
  const realm = getCurrentRealm()
  const p = gameState.player
  const equipStats = getEquipmentStats()
  const passiveStats = getPassiveSkillBonus()
  const { bonuses: setBonuses } = getSetBonuses()

  // 获取打造法宝属性
  const craftedArtifact = getEquippedCraftedArtifact()
  const craftedArtStats = craftedArtifact ? getCraftedArtifactStats(craftedArtifact) : null
  const artStats = craftedArtStats?.stats || { attack: 0, defense: 0, hp: 0 }
  const artPassive = craftedArtStats?.passiveEffects || {}

  // 获取天赋加成
  const talentEffects = getTalentEffects(p.talents)

  // 境界百分比加成 + 套装百分比加成 + 被动技能百分比加成 + 打造法宝百分比加成 + 天赋百分比加成
  const hpBonus = 1 + (realm.hpBonus || 0) / 100 + (setBonuses.hp || 0) / 100 + (passiveStats.hpPercent || 0) / 100 + (artPassive.hpPercent || 0) / 100 + (artPassive.allPercent || 0) / 100 + (talentEffects.hpPercent || 0) / 100
  const attackBonus = 1 + (realm.attackBonus || 0) / 100 + (setBonuses.attack || 0) / 100 + (passiveStats.attackPercent || 0) / 100 + (artPassive.attackPercent || 0) / 100 + (artPassive.allPercent || 0) / 100 + (talentEffects.attackPercent || 0) / 100
  const defenseBonus = 1 + (realm.defenseBonus || 0) / 100 + (setBonuses.defense || 0) / 100 + (passiveStats.defensePercent || 0) / 100 + (artPassive.defensePercent || 0) / 100 + (artPassive.allPercent || 0) / 100 + (talentEffects.defensePercent || 0) / 100

  // 获取临时buff加成
  const buffs = gameState.battle.playerBuffs || {}
  const attackBuffPercent = buffs.attackBuff?.value || 0
  const defenseBuffPercent = buffs.defenseBuff?.value || 0
  const critBuffValue = buffs.critBuff?.value || 0

  const baseAttack = Math.floor((p.baseAttack + equipStats.attack + passiveStats.attack + artStats.attack) * attackBonus)
  const baseDefense = Math.floor((p.baseDefense + equipStats.defense + passiveStats.defense + artStats.defense) * defenseBonus)

  // 吸血 = 装备吸血 + 被动技能吸血 + 境界吸血加成 + 套装吸血 + 打造法宝吸血 + 天赋吸血
  const totalLifesteal = (equipStats.lifesteal || 0) + (passiveStats.lifesteal || 0) + (realm.lifestealBonus || 0) + (setBonuses.lifesteal || 0) + (artPassive.lifesteal || 0) + (talentEffects.lifesteal || 0)

  // 伤害减免 = 装备减伤 + 被动技能减伤 + 套装减伤 + 打造法宝减伤 + 天赋减伤
  const totalDamageReduction = (equipStats.damageReduction || 0) + (passiveStats.damageReduction || 0) + (setBonuses.damageReduction || 0) + (artPassive.damageReduction || 0) + (talentEffects.damageReduction || 0)

  // 反伤 = 装备反伤 + 被动技能反伤 + 套装反伤 + 打造法宝反伤 + 天赋反伤
  const totalThorns = (equipStats.thorns || 0) + (passiveStats.thorns || 0) + (setBonuses.thorns || 0) + (artPassive.thorns || 0) + (talentEffects.thorns || 0)

  return {
    maxHp: Math.floor((p.baseHp + equipStats.hp + passiveStats.hp + artStats.hp) * hpBonus),
    attack: Math.floor(baseAttack * (1 + attackBuffPercent / 100)),
    defense: Math.floor(baseDefense * (1 + defenseBuffPercent / 100)),
    critRate: p.critRate + equipStats.critRate + passiveStats.critRate + critBuffValue + (setBonuses.critRate || 0) + (artPassive.critRate || 0) + (realm.critRate || 0) + (talentEffects.critRate || 0),
    critResist: p.critResist + equipStats.critResist + passiveStats.critResist + (realm.critResist || 0) + (talentEffects.critResist || 0),
    critDamage: p.critDamage + equipStats.critDamage + passiveStats.critDamage + (setBonuses.critDamage || 0) + (artPassive.critDamage || 0) + (realm.critDamage || 0) + (talentEffects.critDamage || 0),
    dodge: p.dodge + equipStats.dodge + passiveStats.dodge + (setBonuses.dodge || 0) + (artPassive.dodge || 0) + (realm.dodge || 0) + (talentEffects.dodge || 0),
    hit: p.hit + equipStats.hit + passiveStats.hit + (realm.hit || 0) + (talentEffects.hit || 0),
    penetration: p.penetration + equipStats.penetration + passiveStats.penetration + (setBonuses.penetration || 0) + (artPassive.penetration || 0) + (talentEffects.penetration || 0),
    skillDamage: equipStats.skillDamage + passiveStats.skillDamage + (talentEffects.skillDamage || 0),
    dropRate: equipStats.dropRate + (realm.dropRate || 0),
    lifesteal: totalLifesteal,
    damageReduction: totalDamageReduction,
    hpRegen: (passiveStats.hpRegen || 0) + (talentEffects.hpRegen || 0),
    healBonus: (realm.healBonus || 0) + (artPassive.healBonus || 0),
    healReceivedBonus: (realm.healReceivedBonus || 0) + (artPassive.healReceivedBonus || 0),
    thorns: totalThorns,
    lowHpDefenseBonus: (passiveStats.lowHpDefenseBonus || 0) + (artPassive.lowHpReduction || 0),
    fatalReflect: passiveStats.fatalReflect || 0,
    // 打造法宝特殊效果
    debuffDamageBonus: artPassive.debuffDamageBonus || 0,
    killHealPercent: artPassive.killHealPercent || 0,
    revivePercent: artPassive.revive || 0,
    // 天赋特殊效果
    blockRate: talentEffects.blockRate || 0,
    executeDamage: talentEffects.executeDamage || 0,
    talentReviveChance: talentEffects.reviveChance || 0,
    shadowStrikeDamage: talentEffects.shadowStrikeDamage || 0
  }
}

// 伤害计算公式
export function calculateDamage(attack, defense, penetration, skillDamage, isCrit, critDamage) {
  const baseDamage = attack * (1 + skillDamage / 100)
  const effectiveDefense = defense * (1 - Math.min(penetration, 80) / 100)
  const damageReduction = Math.min(0.8, effectiveDefense / (effectiveDefense + 100))
  let finalDamage = baseDamage * (1 - damageReduction)

  if (isCrit) {
    finalDamage = finalDamage * (1.5 + critDamage / 100)
  }

  return Math.max(1, Math.floor(finalDamage))
}

// 计算实际治疗量（考虑重伤debuff）
export function calculateEffectiveHeal(healAmount) {
  const debuffs = gameState.battle.playerDebuffs || {}

  // 重伤：减少治疗效果
  if (debuffs.healReduce && debuffs.healReduce.duration > 0) {
    const reduction = debuffs.healReduce.value || 60
    return Math.floor(healAmount * (1 - reduction / 100))
  }

  return healAmount
}

// 最高等级
const MAX_LEVEL = 1000

// 检查并升级
export function checkLevelUp() {
  // 已达到最高等级
  if (gameState.player.level >= MAX_LEVEL) {
    gameState.player.exp = getExpToNextLevel() // 经验条保持满
    return false
  }

  let expNeeded = getExpToNextLevel()
  let leveledUp = false

  while (gameState.player.exp >= expNeeded && gameState.player.level < MAX_LEVEL) {
    gameState.player.exp -= expNeeded
    gameState.player.level++

    // 每级属性提升（随等级增加而增强）
    const levelBonus = 1 + Math.floor(gameState.player.level / 20) * 0.2  // 每20级额外+20%成长
    gameState.player.baseHp += Math.floor(15 * levelBonus)
    gameState.player.baseAttack += Math.floor(5 * levelBonus)
    gameState.player.baseDefense += Math.floor(3 * levelBonus)

    // 每10级增加暴击率
    if (gameState.player.level % 10 === 0) {
      gameState.player.critRate += 1
    }
    // 每20级增加穿透
    if (gameState.player.level % 20 === 0) {
      gameState.player.penetration += 1
    }

    addLog(`升级了！当前等级 ${gameState.player.level}`, 'success')
    leveledUp = true

    // 检查是否达到最高等级
    if (gameState.player.level >= MAX_LEVEL) {
      gameState.player.exp = getExpToNextLevel() // 经验条满
      addLog(`恭喜达到最高等级 ${MAX_LEVEL} 级！`, 'success')
      break
    }

    expNeeded = getExpToNextLevel()
  }

  if (leveledUp) autoSave()
  return leveledUp
}

// 检查境界经验是否足够突破（不再自动突破，需要通过打坐晋升）
export function checkRealmBreakthrough() {
  // 不再自动突破，只返回是否可以突破
  const nextRealm = getNextRealm()
  if (!nextRealm) return false
  return gameState.player.realmExp >= nextRealm.minExp
}

// 检查打坐功能是否解锁（锁妖塔10层）
export function isMeditationUnlocked() {
  return gameState.battle.towerHighestFloor >= 10
}

// 获取晋升成功率（基础60%，修为越多成功率越高，最高90%）
export function getBreakthroughSuccessRate() {
  const nextRealm = getNextRealm()
  if (!nextRealm) return 0

  const currentExp = gameState.player.realmExp
  const requiredExp = nextRealm.minExp

  if (currentExp < requiredExp) return 0

  // 基础成功率60%
  let successRate = 60

  // 超出所需经验的部分，每超出10%增加3%成功率，最高+30%
  const excessRatio = (currentExp - requiredExp) / requiredExp
  successRate += Math.min(30, Math.floor(excessRatio * 10) * 3)

  return Math.min(90, successRate)
}

// 尝试晋升境界
// 检查是否需要选择修炼类型（第一次晋升时）
export function needsChooseCultivationType() {
  return gameState.player.realmId === 1 && gameState.player.cultivationType === 'none'
}

export function attemptBreakthrough() {
  const nextRealm = getNextRealm()
  if (!nextRealm) {
    return { success: false, message: '已达最高境界' }
  }

  if (gameState.player.realmExp < nextRealm.minExp) {
    return { success: false, message: '修为不足，无法晋升' }
  }

  // 第一次晋升需要先选择修炼类型
  if (needsChooseCultivationType()) {
    return { success: false, needChoose: true, message: '请先选择修炼道路' }
  }

  const successRate = getBreakthroughSuccessRate()
  const roll = Math.random() * 100

  if (roll < successRate) {
    // 晋升成功
    gameState.player.realmId = nextRealm.id
    gameState.player.baseHp += 200
    gameState.player.baseAttack += 30
    gameState.player.baseDefense += 10
    gameState.player.critDamage += 5

    const typeText = gameState.player.cultivationType === 'mo' ? '魔修' : '仙修'
    addLog(`${typeText}晋升成功！进入【${nextRealm.name}】！`, 'success')
    autoSave()
    return { success: true, message: `晋升成功！进入【${nextRealm.name}】！` }
  } else {
    // 晋升失败，损失20%修为
    const lostExp = Math.floor(gameState.player.realmExp * 0.2)
    gameState.player.realmExp -= lostExp

    addLog(`晋升失败！损失了 ${lostExp} 点修为`, 'danger')
    autoSave()
    return { success: false, message: `晋升失败！损失了 ${lostExp} 点修为` }
  }
}

// 添加日志
export function addLog(message, type = 'normal') {
  const time = new Date().toLocaleTimeString()
  gameState.logs.unshift({ message, type, time })
  if (gameState.logs.length > 50) {
    gameState.logs.pop()
  }
}

// 添加战斗日志
export function addBattleLog(message, type = 'normal') {
  gameState.battle.battleLog.push({ message, type })
  if (gameState.battle.battleLog.length > 50) {
    gameState.battle.battleLog.shift()
  }
}

// 清空战斗日志
export function clearBattleLog() {
  gameState.battle.battleLog = []
}

// 处理玩家死亡惩罚（扣除1%修为经验）
function applyDeathPenalty() {
  const currentRealmExp = gameState.player.realmExp
  const penalty = Math.floor(currentRealmExp * 0.01)
  if (penalty > 0) {
    gameState.player.realmExp -= penalty
    addBattleLog(`💀 死亡惩罚：损失 ${penalty} 点修为经验`, 'danger')
  }
}

// 背包容量上限
const BASE_INVENTORY_LIMIT = 50

// 获取背包容量上限（包含额外格子）
export function getInventoryLimit() {
  return BASE_INVENTORY_LIMIT + (gameState.player.bonusInventorySlots || 0)
}

// 品质等级映射
const qualityLevel = {
  white: 1,
  green: 2,
  blue: 3,
  purple: 4,
  orange: 5
}

// 检查物品是否应该被拾取
export function shouldPickupItem(item) {
  const filter = gameState.lootFilter

  // 筛选未启用，全部拾取
  if (!filter.enabled) return { pickup: true }

  // 技能书单独判断
  if (item.type === 'skillBook') {
    return { pickup: filter.pickupSkillBooks }
  }

  // 检查品质
  const itemQualityLevel = qualityLevel[item.quality] || 1
  const minQualityLevel = qualityLevel[filter.minQuality] || 1

  if (itemQualityLevel < minQualityLevel) {
    // 品质不够，判断是否自动卖出
    if (filter.autoSellFiltered) {
      // 计算卖出价格：装备等级 * 品质系数
      const qualityMultiplier = { white: 1, green: 2, blue: 4, purple: 8, orange: 15 }
      const sellPrice = Math.floor(item.level * (qualityMultiplier[item.quality] || 1))
      return { pickup: false, autoSell: true, sellPrice }
    }
    return { pickup: false }
  }

  return { pickup: true }
}

// 添加物品到背包（超出上限自动丢弃）
export function addToInventory(item) {
  const limit = getInventoryLimit()
  if (gameState.player.inventory.length >= limit) {
    addLog(`背包已满（${limit}格），【${item.name}】已自动丢弃`, 'warning')
    return false
  }
  gameState.player.inventory.push(item)
  return true
}

// 获取拾取筛选设置
export function getLootFilter() {
  return gameState.lootFilter
}

// 更新拾取筛选设置
export function updateLootFilter(settings) {
  Object.assign(gameState.lootFilter, settings)
  autoSave()
}

// 装备物品
export function equipItem(item) {
  // 检查等级要求
  if (item.requiredLevel && gameState.player.level < item.requiredLevel) {
    addLog(`等级不足！需要 ${item.requiredLevel} 级才能装备【${item.name}】`, 'danger')
    return false
  }

  const currentEquip = gameState.player.equipment[item.slotType]

  // 如果已有装备，放回背包（这里不检查上限，因为是替换操作）
  if (currentEquip) {
    gameState.player.inventory.push(currentEquip)
  }

  // 装备新物品
  gameState.player.equipment[item.slotType] = item

  // 从背包移除
  const index = gameState.player.inventory.findIndex(i => i.id === item.id)
  if (index > -1) {
    gameState.player.inventory.splice(index, 1)
  }

  addLog(`装备了【${item.name}】`, 'success')
  autoSave()
  return true
}

// 卸下装备
export function unequipItem(slotType) {
  const item = gameState.player.equipment[slotType]
  if (item) {
    // 打造法宝特殊处理：不放入背包，只清除装备槽和标记
    if (slotType === 'artifact' && item.type === 'craftedArtifact') {
      gameState.player.equipment[slotType] = null
      gameState.player.equippedCraftedArtifact = null
      addLog(`卸下了【${item.name}】`, 'normal')
      autoSave()
      return true
    }

    // 普通装备放入背包
    if (gameState.player.inventory.length >= getInventoryLimit()) {
      addLog(`背包已满，无法卸下【${item.name}】`, 'danger')
      return false
    }
    gameState.player.inventory.push(item)
    gameState.player.equipment[slotType] = null
    addLog(`卸下了【${item.name}】`, 'normal')
    return true
  }
  return false
}

// 丢弃物品
export function discardItem(item) {
  const index = gameState.player.inventory.findIndex(i => i.id === item.id)
  if (index > -1) {
    gameState.player.inventory.splice(index, 1)
    addLog(`丢弃了【${item.name}】`, 'normal')
  }
}

// ==================== 装备强化系统 ====================

// 强化装备
export function enhanceEquipment(slotType) {
  const item = gameState.player.equipment[slotType]
  if (!item) {
    addLog('请先装备物品', 'danger')
    return { success: false, message: '请先装备物品' }
  }

  // 初始化强化等级
  if (item.enhanceLevel === undefined) {
    item.enhanceLevel = 0
  }

  // 检查是否已满级
  if (item.enhanceLevel >= MAX_ENHANCE_LEVEL) {
    addLog(`【${item.name}】已达到最高强化等级(+${MAX_ENHANCE_LEVEL})`, 'warning')
    return { success: false, message: `已达到最高强化等级(+${MAX_ENHANCE_LEVEL})` }
  }

  // 计算费用
  const cost = getEnhanceCost(item.level, item.enhanceLevel)
  if (gameState.player.gold < cost) {
    addLog(`灵石不足！强化需要 ${cost} 灵石`, 'danger')
    return { success: false, message: `灵石不足，需要 ${cost} 灵石` }
  }

  // 扣除费用
  gameState.player.gold -= cost

  // 计算成功率
  const successRate = getEnhanceSuccessRate(item.enhanceLevel)
  const roll = Math.random() * 100

  if (roll < successRate) {
    // 强化成功
    item.enhanceLevel++
    addLog(`【${item.name}】强化成功！+${item.enhanceLevel}`, 'success')
    autoSave()
    return {
      success: true,
      message: `强化成功！+${item.enhanceLevel}`,
      newLevel: item.enhanceLevel
    }
  } else {
    // 强化失败
    const dropLevels = getEnhanceDropLevels(item.enhanceLevel)
    const oldLevel = item.enhanceLevel
    item.enhanceLevel = Math.max(0, item.enhanceLevel - dropLevels)

    if (dropLevels > 0) {
      addLog(`【${item.name}】强化失败！-${dropLevels}级 (${oldLevel} → ${item.enhanceLevel})`, 'danger')
    } else {
      addLog(`【${item.name}】强化失败！`, 'warning')
    }
    autoSave()
    return {
      success: false,
      message: dropLevels > 0 ? `强化失败！-${dropLevels}级` : '强化失败！',
      newLevel: item.enhanceLevel,
      dropped: dropLevels
    }
  }
}

// 强化任意装备（包括背包中的）
export function enhanceItem(item) {
  if (!item) {
    addLog('无效的物品', 'danger')
    return { success: false, message: '无效的物品' }
  }

  // 初始化强化等级
  if (item.enhanceLevel === undefined) {
    item.enhanceLevel = 0
  }

  // 检查是否已满级
  if (item.enhanceLevel >= MAX_ENHANCE_LEVEL) {
    addLog(`【${item.name}】已达到最高强化等级(+${MAX_ENHANCE_LEVEL})`, 'warning')
    return { success: false, message: `已达到最高强化等级(+${MAX_ENHANCE_LEVEL})` }
  }

  // 计算费用
  const cost = getEnhanceCost(item.level, item.enhanceLevel)
  if (gameState.player.gold < cost) {
    addLog(`灵石不足！强化需要 ${cost} 灵石`, 'danger')
    return { success: false, message: `灵石不足，需要 ${cost} 灵石` }
  }

  // 扣除费用
  gameState.player.gold -= cost

  // 计算成功率
  const successRate = getEnhanceSuccessRate(item.enhanceLevel)
  const roll = Math.random() * 100

  if (roll < successRate) {
    // 强化成功
    item.enhanceLevel++
    addLog(`【${item.name}】强化成功！+${item.enhanceLevel}`, 'success')
    autoSave()
    return {
      success: true,
      message: `强化成功！+${item.enhanceLevel}`,
      newLevel: item.enhanceLevel
    }
  } else {
    // 强化失败
    const dropLevels = getEnhanceDropLevels(item.enhanceLevel)
    const oldLevel = item.enhanceLevel
    item.enhanceLevel = Math.max(0, item.enhanceLevel - dropLevels)

    if (dropLevels > 0) {
      addLog(`【${item.name}】强化失败！-${dropLevels}级 (${oldLevel} → ${item.enhanceLevel})`, 'danger')
    } else {
      addLog(`【${item.name}】强化失败！`, 'warning')
    }
    autoSave()
    return {
      success: false,
      message: dropLevels > 0 ? `强化失败！-${dropLevels}级` : '强化失败！',
      newLevel: item.enhanceLevel,
      dropped: dropLevels
    }
  }
}

// 获取装备强化后的属性
export function getEnhancedStats(item) {
  if (!item || !item.stats) return {}

  const enhanceLevel = item.enhanceLevel || 0
  const enhancedStats = {}
  // 只有这三个属性参与强化加成
  const enhanceableStats = ['hp', 'attack', 'defense']

  for (const [stat, value] of Object.entries(item.stats)) {
    if (enhanceableStats.includes(stat)) {
      // hp, attack, defense 应用强化加成
      enhancedStats[stat] = {
        base: value,
        enhanced: getEnhancedStatValue(value, enhanceLevel),
        bonus: enhanceLevel > 0 ? getEnhancedStatValue(value, enhanceLevel) - value : 0
      }
    } else {
      // 其他属性不参与强化，保持原值
      enhancedStats[stat] = {
        base: value,
        enhanced: value,
        bonus: 0
      }
    }
  }

  return enhancedStats
}

// ==================== 技能系统函数 ====================

// 学习技能
export function learnSkill(skillId) {
  const skill = getSkillById(skillId)
  if (!skill) return false

  if (gameState.player.learnedSkills[skillId]) {
    addLog(`你已经学会了【${skill.name}】`, 'warning')
    return false
  }

  gameState.player.learnedSkills[skillId] = { level: 1, exp: 0 }
  addLog(`学会了【${skill.name}】！`, 'success')
  autoSave()
  return true
}


// 使用技能书
export function useSkillBook(inventoryIndex) {
  const item = gameState.player.inventory[inventoryIndex]
  if (!item || item.type !== 'skillBook') {
    addLog('无效的物品', 'danger')
    return false
  }

  const skill = getSkillById(item.skillId)
  if (!skill) return false

  // 检查是否已学会
  if (gameState.player.learnedSkills[item.skillId]) {
    addLog(`你已经学会了【${skill.name}】，无法再次使用`, 'warning')
    return false
  }

  // 学习技能
  gameState.player.learnedSkills[item.skillId] = { level: 1, exp: 0 }

  // 移除技能书
  gameState.player.inventory.splice(inventoryIndex, 1)

  addLog(`使用【${skill.name}技能书】，学会了【${skill.name}】！`, 'success')
  autoSave()
  return true
}

// 获取被动技能栏位上限
export function getMaxPassiveSlots() {
  return 2 + (gameState.player.bonusPassiveSlots || 0)
}

// 装备技能（主动技能最多4个，被动技能最多2个+额外栏位）
export function equipSkill(skillId) {
  const skill = getSkillById(skillId)
  if (!skill) return false

  if (!gameState.player.learnedSkills[skillId]) {
    addLog(`你还没有学会【${skill.name}】`, 'danger')
    return false
  }

  if (skill.type === 'active') {
    if (gameState.player.equippedActiveSkills.includes(skillId)) {
      addLog(`【${skill.name}】已经装备了`, 'warning')
      return false
    }

    if (gameState.player.equippedActiveSkills.length >= 4) {
      addLog('最多只能装备4个主动技能', 'warning')
      return false
    }

    gameState.player.equippedActiveSkills.push(skillId)
  } else {
    if (gameState.player.equippedPassiveSkills.includes(skillId)) {
      addLog(`【${skill.name}】已经装备了`, 'warning')
      return false
    }

    const maxPassive = getMaxPassiveSlots()
    if (gameState.player.equippedPassiveSkills.length >= maxPassive) {
      addLog(`最多只能装备${maxPassive}个被动技能`, 'warning')
      return false
    }

    gameState.player.equippedPassiveSkills.push(skillId)
  }

  addLog(`装备了技能【${skill.name}】`, 'success')
  autoSave()
  return true
}

// 卸下技能
export function unequipSkill(skillId) {
  const skill = getSkillById(skillId)
  if (!skill) {
    addLog('技能不存在', 'warning')
    return false
  }

  let index = -1
  if (skill.type === 'active') {
    index = gameState.player.equippedActiveSkills.indexOf(skillId)
    if (index === -1) {
      addLog('该技能未装备', 'warning')
      return false
    }
    gameState.player.equippedActiveSkills.splice(index, 1)
  } else {
    index = gameState.player.equippedPassiveSkills.indexOf(skillId)
    if (index === -1) {
      addLog('该技能未装备', 'warning')
      return false
    }
    gameState.player.equippedPassiveSkills.splice(index, 1)
  }

  addLog(`卸下了技能【${skill.name}】`, 'normal')
  autoSave()
  return true
}

// 增加技能经验
export function addSkillExp(skillId, amount) {
  const skillData = gameState.player.learnedSkills[skillId]
  if (!skillData) return

  const skill = getSkillById(skillId)
  if (!skill) return

  skillData.exp += amount

  // 检查升级（根据稀有度调整经验需求）
  let expNeeded = getSkillExpForLevel(skillData.level, skill.rarity)
  while (skillData.exp >= expNeeded && skillData.level < skill.maxLevel) {
    skillData.exp -= expNeeded
    skillData.level++
    addLog(`【${skill.name}】升级到 ${skillData.level} 级！`, 'success')
    expNeeded = getSkillExpForLevel(skillData.level, skill.rarity)
  }

  // 如果已满级，经验不再增加
  if (skillData.level >= skill.maxLevel) {
    skillData.exp = 0
  }
}

// 获取已学习的技能列表（带详情）
export function getLearnedSkillsWithDetails() {
  const result = []
  for (const [skillId, skillData] of Object.entries(gameState.player.learnedSkills)) {
    const id = parseInt(skillId)
    const skill = getSkillById(id)
    if (skill) {
      const isEquipped = skill.type === 'active'
        ? gameState.player.equippedActiveSkills.includes(id)
        : gameState.player.equippedPassiveSkills.includes(id)
      result.push({
        ...skill,
        currentLevel: skillData.level,
        currentExp: skillData.exp,
        expToNextLevel: getSkillExpForLevel(skillData.level, skill.rarity),
        isEquipped,
        damageMultiplier: skill.type === 'active' ? getSkillDamage(skill, skillData.level) : 0
      })
    }
  }
  return result
}

// 获取已装备的主动技能列表（带详情）
export function getEquippedActiveSkillsWithDetails() {
  return gameState.player.equippedActiveSkills.map(skillId => {
    const skill = getSkillById(skillId)
    const skillData = gameState.player.learnedSkills[skillId]
    if (skill && skillData) {
      return {
        ...skill,
        currentLevel: skillData.level,
        damageMultiplier: getSkillDamage(skill, skillData.level)
      }
    }
    return null
  }).filter(Boolean)
}

// 获取已装备的被动技能列表（带详情）
export function getEquippedPassiveSkillsWithDetails() {
  return gameState.player.equippedPassiveSkills.map(skillId => {
    const skill = getSkillById(skillId)
    const skillData = gameState.player.learnedSkills[skillId]
    if (skill && skillData) {
      return {
        ...skill,
        currentLevel: skillData.level,
        bonusStats: getPassiveSkillStats(skill, skillData.level)
      }
    }
    return null
  }).filter(Boolean)
}

// 获取可用的主动技能（冷却完毕的）
export function getAvailableSkills() {
  const equipped = getEquippedActiveSkillsWithDetails()
  return equipped.filter(skill => {
    const cd = gameState.battle.skillCooldowns[skill.id] || 0
    return cd <= 0
  })
}

// 使用技能（设置冷却）
export function useSkill(skill) {
  if (skill.cooldown > 0) {
    gameState.battle.skillCooldowns[skill.id] = skill.cooldown
  }
}

// 更新技能冷却
export function updateCooldowns() {
  for (const skillId in gameState.battle.skillCooldowns) {
    if (gameState.battle.skillCooldowns[skillId] > 0) {
      gameState.battle.skillCooldowns[skillId]--
    }
  }
}

// ==================== 宠物系统函数 ====================

// 宠物数量上限
const PET_LIMIT = 10

// 获取当前出战的宠物
export function getActivePet() {
  if (!gameState.player.activePetId) return null
  const pet = gameState.player.pets.find(p => p.id === gameState.player.activePetId)
  if (pet) {
    // 确保宠物属性正确
    if (!pet.baseHp || pet.baseHp <= 0) {
      const aptitude = pet.aptitude || 5
      const stats = calculatePetStats(pet.level, pet.quality, aptitude)
      pet.baseHp = stats.baseHp
      pet.baseAttack = stats.baseAttack
      pet.baseDefense = stats.baseDefense
    }
    // 只在 currentHp 未定义时初始化，不自动复活死亡的宠物
    if (pet.currentHp === undefined || pet.currentHp === null) {
      pet.currentHp = pet.baseHp
    }
  }
  return pet
}

// 获取宠物被动技能效果
export function getPetPassiveEffects(pet) {
  const effects = {
    multiHit: null,       // 连击
    lifesteal: 0,         // 吸血百分比
    castMastery: null,    // 熟练施法
    regen: 0,             // 再生百分比
    battleInstinct: null  // 战场嗅觉
  }

  if (!pet || !pet.skills) return effects

  for (const skillId of pet.skills) {
    const skill = getSkillById(skillId)
    if (!skill) continue
    if (skill.type !== 'petLearnablePassive' && !(skill.type === 'petSkill' && skill.cooldown === 0)) continue

    const skillLevel = pet.skillLevels?.[skillId] || 1
    const levelMult = 1 + (skillLevel - 1) * 0.1

    if (skill.effect === 'multiHit') {
      effects.multiHit = {
        chance: Math.floor((skill.hitChance || 30) * levelMult),
        minHits: skill.minHits || 2,
        maxHits: skill.maxHits || 2
      }
    }
    if (skill.effect === 'lifesteal') {
      effects.lifesteal += Math.floor((skill.lifestealPercent || 20) * levelMult)
    }
    if (skill.effect === 'castMastery') {
      effects.castMastery = {
        castChanceBonus: Math.floor((skill.castChanceBonus || 15) * levelMult),
        cooldownReduction: skill.cooldownReduction || 1
      }
    }
    if (skill.effect === 'regen') {
      effects.regen += Math.floor((skill.regenPercent || 15) * levelMult)
    }
    if (skill.effect === 'battleInstinct') {
      effects.battleInstinct = {
        dodgeBonus: Math.floor((skill.dodgeBonus || 10) * levelMult),
        critRateBonus: Math.floor((skill.critRateBonus || 10) * levelMult),
        lowHpDamageBonus: Math.floor((skill.lowHpDamageBonus || 20) * levelMult)
      }
    }
  }

  return effects
}

// 添加宠物
export function addPet(pet) {
  if (gameState.player.pets.length >= PET_LIMIT) {
    addLog(`宠物栏已满（${PET_LIMIT}只），【${pet.name}】逃跑了`, 'warning')
    return false
  }
  gameState.player.pets.push(pet)
  addLog(`捕获了【${pet.qualityName}】${pet.name}！`, 'success')
  autoSave()
  return true
}

// 放生宠物
export function releasePet(petId) {
  const index = gameState.player.pets.findIndex(p => p.id === petId)
  if (index === -1) return false

  const pet = gameState.player.pets[index]

  // 如果是出战宠物，先收回
  if (gameState.player.activePetId === petId) {
    gameState.player.activePetId = null
  }

  gameState.player.pets.splice(index, 1)
  addLog(`放生了【${pet.name}】`, 'normal')
  autoSave()
  return true
}

// 出战宠物
export function deployPet(petId) {
  const pet = gameState.player.pets.find(p => p.id === petId)
  if (!pet) return false

  gameState.player.activePetId = petId
  // 恢复宠物血量
  pet.currentHp = pet.baseHp
  addLog(`【${pet.name}】出战！`, 'success')
  autoSave()
  return true
}

// 收回宠物
export function recallPet() {
  const pet = getActivePet()
  if (!pet) return false

  gameState.player.activePetId = null
  addLog(`收回了【${pet.name}】`, 'normal')
  autoSave()
  return true
}

// 宠物最高等级
const PET_MAX_LEVEL = 500

// 宠物获得经验
export function addPetExp(petId, amount) {
  const pet = gameState.player.pets.find(p => p.id === petId)
  if (!pet) return

  // 已满级不获取经验
  if (pet.level >= PET_MAX_LEVEL) return

  pet.exp += amount

  // 检查升级
  let expNeeded = getPetExpForLevel(pet.level)
  while (pet.exp >= expNeeded && pet.level < PET_MAX_LEVEL) {
    pet.exp -= expNeeded
    pet.level++

    // 使用新的属性计算公式（基于资质和品质）
    const aptitude = pet.aptitude || 5 // 兼容旧宠物
    const newStats = calculatePetStats(pet.level, pet.quality, aptitude)
    pet.baseHp = newStats.baseHp
    pet.baseAttack = newStats.baseAttack
    pet.baseDefense = newStats.baseDefense
    pet.critRate = newStats.critRate || pet.critRate
    pet.dodge = newStats.dodge || pet.dodge
    pet.critDamage = 50 + Math.floor(pet.level / 5)
    pet.hit = 95 + Math.floor(pet.level / 10)

    addLog(`宠物【${pet.name}】升级到 ${pet.level} 级！`, 'success')

    // 检查是否达到最高等级
    if (pet.level >= PET_MAX_LEVEL) {
      addLog(`宠物【${pet.name}】已达到最高等级 ${PET_MAX_LEVEL} 级！`, 'success')
      pet.exp = 0
      break
    }

    expNeeded = getPetExpForLevel(pet.level)
  }
}

// 获取宠物列表（带详细信息）
export function getPetsWithDetails() {
  return gameState.player.pets.map(pet => {
    const isActive = pet.id === gameState.player.activePetId
    const stats = getPetStats(pet)
    const expToNext = getPetExpForLevel(pet.level)
    return {
      ...pet,
      isActive,
      stats,
      expToNext
    }
  })
}

// 使用宠物蛋孵化宠物
export function usePetEgg(eggIndex) {
  if (!gameState.player.petEggs) {
    gameState.player.petEggs = []
  }
  const item = gameState.player.petEggs[eggIndex]
  if (!item || item.type !== 'petEgg') {
    addLog('无效的物品', 'danger')
    return false
  }

  // 检查宠物栏是否已满
  if (gameState.player.pets.length >= PET_LIMIT) {
    addLog(`宠物栏已满（${PET_LIMIT}只），请先放生一些宠物`, 'danger')
    return false
  }

  // 孵化宠物
  const pet = hatchPetEgg(item)
  if (!pet) {
    addLog('孵化失败', 'danger')
    return false
  }

  // 移除宠物蛋
  gameState.player.petEggs.splice(eggIndex, 1)

  // 添加宠物
  gameState.player.pets.push(pet)
  if (pet.hasHiddenSkill) {
    addLog(`孵化出【${pet.qualityName}】${pet.name}（资质${pet.aptitude}）！觉醒了隐藏技能！`, 'success')
  } else {
    addLog(`孵化出【${pet.qualityName}】${pet.name}（资质${pet.aptitude}）！`, 'success')
  }
  autoSave()
  return true
}

// 使用资质丹提升宠物资质
export function useAptitudePill(pillIndex, petId) {
  if (!gameState.player.aptitudePills) {
    gameState.player.aptitudePills = []
  }
  const item = gameState.player.aptitudePills[pillIndex]
  if (!item || item.type !== 'aptitudePill') {
    addLog('无效的物品', 'danger')
    return false
  }

  const pet = gameState.player.pets.find(p => p.id === petId)
  if (!pet) {
    addLog('请选择要培养的宠物', 'danger')
    return false
  }

  // 根据资质丹类型检查上限
  // 普通资质丹(tier 1)最高培养到9，高级资质丹(tier 2)最高培养到10
  const maxAptitude = item.maxAptitude || (item.tier === 1 ? 9 : 10)

  // 检查资质是否已达该丹药的上限
  if (pet.aptitude >= maxAptitude) {
    if (item.tier === 1 && pet.aptitude < 10) {
      addLog(`【${pet.name}】资质已达${maxAptitude}，需要高级资质丹才能继续培养`, 'warning')
    } else {
      addLog(`【${pet.name}】资质已达上限`, 'warning')
    }
    return false
  }

  // 计算提升值
  const boost = item.minBoost + Math.random() * (item.maxBoost - item.minBoost)
  const oldAptitude = pet.aptitude
  pet.aptitude = Math.min(maxAptitude, pet.aptitude + boost)
  const actualBoost = pet.aptitude - oldAptitude

  // 重新计算属性
  const newStats = calculatePetStats(pet.level, pet.quality, pet.aptitude)
  pet.baseHp = newStats.baseHp
  pet.baseAttack = newStats.baseAttack
  pet.baseDefense = newStats.baseDefense

  // 移除资质丹
  gameState.player.aptitudePills.splice(pillIndex, 1)

  addLog(`【${pet.name}】资质提升 +${actualBoost.toFixed(2)}（${oldAptitude.toFixed(2)} → ${pet.aptitude.toFixed(2)}）`, 'success')
  autoSave()
  return true
}

// 获取宠物蛋列表
export function getPetEggs() {
  return gameState.player.petEggs || []
}

// 获取资质丹列表
export function getAptitudePills() {
  return gameState.player.aptitudePills || []
}

// 获取宠物技能书列表
export function getPetSkillBooks() {
  return gameState.player.petSkillBooks || []
}

// 预览开启宠物技能书（只返回结果，不消耗技能书）
export function previewOpenPetSkillBook(bookIndex) {
  if (!gameState.player.petSkillBooks) {
    gameState.player.petSkillBooks = []
  }
  const book = gameState.player.petSkillBooks[bookIndex]
  if (!book || book.type !== 'petSkillBook') {
    addLog('无效的物品', 'danger')
    return null
  }

  // 开书获得技能
  const result = openPetSkillBook(book)
  if (!result) {
    addLog('开启技能书失败', 'danger')
    return null
  }

  return result
}

// 让宠物学习已开出的技能
export function learnPetSkill(bookIndex, petId, skillId) {
  if (!gameState.player.petSkillBooks) {
    gameState.player.petSkillBooks = []
  }
  const book = gameState.player.petSkillBooks[bookIndex]
  if (!book || book.type !== 'petSkillBook') {
    addLog('无效的物品', 'danger')
    return false
  }

  const pet = gameState.player.pets.find(p => p.id === petId)
  if (!pet) {
    addLog('请选择要学习技能的宠物', 'danger')
    return false
  }

  // 检查宠物技能栏是否已满（最多6个技能：1固定+1隐藏+4可学习）
  const maxSkills = 6
  if (pet.skills.length >= maxSkills) {
    addLog(`【${pet.name}】技能栏已满（${maxSkills}个）`, 'warning')
    return false
  }

  // 检查宠物是否已学过该技能
  if (pet.skills.includes(skillId)) {
    addLog(`【${pet.name}】已学会该技能`, 'warning')
    return false
  }

  // 获取技能信息
  const skill = getSkillById(skillId)
  if (!skill) {
    addLog('无效的技能', 'danger')
    return false
  }

  // 学习技能
  pet.skills.push(skillId)
  if (!pet.skillLevels) pet.skillLevels = {}
  pet.skillLevels[skillId] = 1

  // 移除技能书
  gameState.player.petSkillBooks.splice(bookIndex, 1)

  const tierNames = { 1: '初级', 2: '中级', 3: '高级' }
  addLog(`【${pet.name}】学会了${tierNames[skill.tier]}技能【${skill.name}】！`, 'success')
  autoSave()
  return true
}

// 丢弃技能书
export function discardPetSkillBook(bookIndex) {
  if (!gameState.player.petSkillBooks) {
    gameState.player.petSkillBooks = []
  }
  if (bookIndex >= 0 && bookIndex < gameState.player.petSkillBooks.length) {
    gameState.player.petSkillBooks.splice(bookIndex, 1)
    addLog('丢弃了技能书', 'normal')
    autoSave()
    return true
  }
  return false
}

// 兼容旧函数（保留但不推荐使用）
export function usePetSkillBook(bookIndex, petId) {
  const result = previewOpenPetSkillBook(bookIndex)
  if (!result) return false
  return learnPetSkill(bookIndex, petId, result.skillId)
}

// ========== 兑换码系统 ==========
// 预设兑换码（可以随时添加新的）
const redeemCodes = {
  'XIUXIAN2024': {
    name: '修仙大礼包',
    rewards: [
      { type: 'petSkillBook', tier: 'advanced', count: 5 },
      { type: 'petEgg', tier: 'advanced', count: 5 }
    ]
  },
  'NEWPLAYER': {
    name: '新手礼包',
    rewards: [
      { type: 'petSkillBook', tier: 'advanced', count: 5 },
      { type: 'petEgg', tier: 'advanced', count: 5 }
    ]
  },
  'VIP666': {
    name: 'VIP礼包',
    rewards: [
      { type: 'petSkillBook', tier: 'advanced', count: 5 },
      { type: 'petEgg', tier: 'advanced', count: 5 }
    ]
  },
  // 法宝材料兑换码
  'FABAO2024': {
    name: '超级材料礼包',
    rewards: [
      { type: 'material', id: 'mat_chaos_essence', count: 5 },
      { type: 'material', id: 'mat_hongmeng_qi', count: 5 }
    ]
  },
  'ALLMAT888': {
    name: '全材料豪华礼包',
    rewards: [
      { type: 'material', id: 'mat_spirit_stone', count: 20 },
      { type: 'material', id: 'mat_iron_essence', count: 20 },
      { type: 'material', id: 'mat_wood_spirit', count: 20 },
      { type: 'material', id: 'mat_dark_iron', count: 15 },
      { type: 'material', id: 'mat_spirit_jade', count: 15 },
      { type: 'material', id: 'mat_fire_crystal', count: 15 },
      { type: 'material', id: 'mat_meteor_iron', count: 10 },
      { type: 'material', id: 'mat_dragon_crystal', count: 10 },
      { type: 'material', id: 'mat_phoenix_feather', count: 10 },
      { type: 'material', id: 'mat_chaos_essence', count: 5 },
      { type: 'material', id: 'mat_hongmeng_qi', count: 5 }
    ]
  },
  'SUPERMAT': {
    name: '超级材料测试包',
    oneTime: false,  // 可多次使用
    rewards: [
      { type: 'material', id: 'mat_chaos_essence', count: 10 },
      { type: 'material', id: 'mat_hongmeng_qi', count: 10 }
    ]
  }
}

// 使用兑换码
export function useRedeemCode(code) {
  if (!code) {
    addLog('请输入兑换码', 'danger')
    return { success: false, message: '请输入兑换码' }
  }

  const upperCode = code.toUpperCase().trim()
  const codeData = redeemCodes[upperCode]

  if (!codeData) {
    addLog('无效的兑换码', 'danger')
    return { success: false, message: '无效的兑换码' }
  }

  // 检查是否已使用过
  if (!gameState.player.usedRedeemCodes) {
    gameState.player.usedRedeemCodes = []
  }

  if (gameState.player.usedRedeemCodes.includes(upperCode)) {
    addLog('该兑换码已使用过', 'warning')
    return { success: false, message: '该兑换码已使用过' }
  }

  // 发放奖励
  const rewardTexts = []

  for (const reward of codeData.rewards) {
    if (reward.type === 'petSkillBook') {
      // 生成高级宠物技能书
      if (!gameState.player.petSkillBooks) {
        gameState.player.petSkillBooks = []
      }
      for (let i = 0; i < reward.count; i++) {
        const skillBook = {
          id: `petskillbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
          type: 'petSkillBook',
          name: '高级宠物技能书',
          quality: 'epic',
          availableTiers: [1, 2, 3],
          towerFloor: 0 // 兑换获得
        }
        gameState.player.petSkillBooks.push(skillBook)
      }
      rewardTexts.push(`高级宠物技能书 x${reward.count}`)
    } else if (reward.type === 'petEgg') {
      // 生成高级宠物蛋（至尊宠物蛋）
      if (!gameState.player.petEggs) {
        gameState.player.petEggs = []
      }
      for (let i = 0; i < reward.count; i++) {
        const qualityPool = ['blue', 'purple', 'purple', 'orange']
        const quality = qualityPool[Math.floor(Math.random() * qualityPool.length)]
        const qualityNames = { white: '普通', green: '精良', blue: '稀有', purple: '史诗', orange: '传说' }
        const qualityColors = { white: '#ffffff', green: '#2ecc71', blue: '#3498db', purple: '#9b59b6', orange: '#e67e22' }

        // 预先决定宠物类型和隐藏技能
        const petTypeId = Math.floor(Math.random() * 16) + 1
        const hasHiddenSkill = Math.random() < 0.1

        const petEgg = {
          id: `petegg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
          type: 'petEgg',
          name: '至尊宠物蛋',
          quality,
          qualityName: qualityNames[quality],
          qualityColor: qualityColors[quality],
          towerFloor: 200, // 等同200层品质
          maxAptitude: 8,
          petTypeId,
          hasHiddenSkill
        }
        gameState.player.petEggs.push(petEgg)
      }
      rewardTexts.push(`至尊宠物蛋 x${reward.count}`)
    } else if (reward.type === 'material') {
      // 添加法宝材料
      addMaterial(reward.id, reward.count)
      const matData = getMaterialById(reward.id)
      const matName = matData ? matData.name : reward.id
      rewardTexts.push(`${matName} x${reward.count}`)
    }
  }

  // 记录已使用（除非设置了 oneTime: false）
  if (codeData.oneTime !== false) {
    gameState.player.usedRedeemCodes.push(upperCode)
  }

  const message = `兑换成功！获得：${rewardTexts.join('、')}`
  addLog(message, 'success')
  autoSave()

  return { success: true, message, rewardTexts }
}

// 获取已使用的兑换码列表
export function getUsedRedeemCodes() {
  return gameState.player.usedRedeemCodes || []
}

// 开始战斗
export function startBattle() {
  // 锁妖塔模式
  if (gameState.battle.isTowerMode) {
    return startTowerBattle()
  }

  const map = maps.find(m => m.id === gameState.battle.selectedMapId)
  if (!map) return false

  if (gameState.player.level < map.requiredLevel) {
    addLog(`等级不足，需要 ${map.requiredLevel} 级才能进入`, 'danger')
    return false
  }

  // 测试人偶地图特殊处理
  if (map.id === 'dummy') {
    const dummyMonster = map.monsters[0]
    const monsters = [{
      ...dummyMonster,
      currentHp: dummyMonster.hp,
      skills: [],
      buffs: {},
      debuffs: {},
      reviveUsed: false
    }]

    const stats = getPlayerStats()
    gameState.battle.isInBattle = true
    gameState.battle.currentMonsters = monsters
    gameState.battle.currentMonsterIndex = 0
    gameState.battle.playerCurrentHp = stats.maxHp
    gameState.battle.skillCooldowns = {}
    gameState.battle.petSkillCooldowns = {}
    gameState.battle.petBuffs = {}
    gameState.battle.playerBuffs = {}
    gameState.battle.playerDebuffs = {}  // 玩家负面效果
    gameState.battle.roundCount = 0
    gameState.battle.fatalReflectUsed = false
    gameState.battle.chaosStrikeActive = false
    gameState.battle.artifactReviveUsed = false
    gameState.battle.artifactSkillCooldowns = {}
    gameState.battle.talentReviveUsed = false  // 不死战神天赋
    gameState.battle.shadowStrikeReady = false  // 暗影突袭天赋

    const activePet = getActivePet()
    if (activePet) {
      activePet.currentHp = activePet.baseHp
    }

    addBattleLog(`【测试人偶】HP:${dummyMonster.hp} 攻:${dummyMonster.attack} 防:${dummyMonster.defense}`, 'warning')
    if (activePet) {
      addBattleLog(`宠物【${activePet.name}】参战！`, 'success')
    }
    return true
  }

  // 根据地图决定怪物数量：新手村1个，青云山脚和幽暗森林1-3个，其他1-5个
  let monsterCount
  if (map.id === 1) {
    monsterCount = 1
  } else if (map.id === 2 || map.id === 3) {
    monsterCount = Math.floor(Math.random() * 3) + 1
  } else {
    monsterCount = Math.floor(Math.random() * 5) + 1
  }
  const monsters = []

  for (let i = 0; i < monsterCount; i++) {
    const baseMonster = map.monsters[Math.floor(Math.random() * map.monsters.length)]
    const monster = {
      ...baseMonster,
      currentHp: baseMonster.hp,
      skills: getRandomSkills(baseMonster.level),
      buffs: {}, // 存储激活的buff
      debuffs: {}, // 存储debuff（如易伤）
      reviveUsed: false // 不屈意志是否已使用
    }
    monsters.push(monster)
  }

  const stats = getPlayerStats()

  gameState.battle.isInBattle = true
  gameState.battle.currentMonsters = monsters
  gameState.battle.currentMonsterIndex = 0
  gameState.battle.playerCurrentHp = stats.maxHp
  gameState.battle.skillCooldowns = {}
  gameState.battle.petSkillCooldowns = {}
  gameState.battle.petBuffs = {}
  gameState.battle.playerBuffs = {}
  gameState.battle.playerDebuffs = {}  // 玩家负面效果
  gameState.battle.roundCount = 0
  gameState.battle.fatalReflectUsed = false
  gameState.battle.chaosStrikeActive = false
  gameState.battle.artifactReviveUsed = false  // 法宝涅槃重生
  gameState.battle.artifactSkillCooldowns = {}  // 法宝主动技能冷却
  gameState.battle.talentReviveUsed = false  // 不死战神天赋
  gameState.battle.shadowStrikeReady = false  // 暗影突袭天赋

  // 重置宠物血量
  const activePet = getActivePet()
  if (activePet) {
    activePet.currentHp = activePet.baseHp
  }

  if (monsterCount === 1) {
    const m = monsters[0]
    addBattleLog(`遭遇 Lv.${m.level} ${m.name}！`, 'warning')
  } else {
    addBattleLog(`遭遇 ${monsterCount} 只怪物！`, 'warning')
    monsters.forEach((m, i) => {
      const skillNames = m.skills.map(s => s.name).join('、')
      addBattleLog(`  ${i + 1}. Lv.${m.level} ${m.name} [${skillNames || '无技能'}]`, 'normal')
    })
  }

  // 显示出战宠物
  if (activePet) {
    addBattleLog(`宠物【${activePet.name}】参战！`, 'success')
  }

  return true
}

// 开始锁妖塔战斗
export function startTowerBattle() {
  if (gameState.player.level < towerConfig.requiredLevel) {
    addLog(`等级不足，需要 ${towerConfig.requiredLevel} 级才能进入锁妖塔`, 'danger')
    return false
  }

  const floor = gameState.battle.towerFloor
  const monsters = generateTowerFloorMonsters(floor)

  const stats = getPlayerStats()

  gameState.battle.isInBattle = true
  gameState.battle.currentMonsters = monsters
  gameState.battle.currentMonsterIndex = 0
  gameState.battle.playerCurrentHp = stats.maxHp
  gameState.battle.skillCooldowns = {}
  gameState.battle.petSkillCooldowns = {}
  gameState.battle.petBuffs = {}
  gameState.battle.playerBuffs = {}
  gameState.battle.playerDebuffs = {}  // 玩家负面效果
  gameState.battle.roundCount = 0
  gameState.battle.fatalReflectUsed = false
  gameState.battle.chaosStrikeActive = false
  gameState.battle.artifactReviveUsed = false  // 法宝涅槃重生
  gameState.battle.artifactSkillCooldowns = {}  // 法宝主动技能冷却
  gameState.battle.talentReviveUsed = false  // 不死战神天赋
  gameState.battle.shadowStrikeReady = false  // 暗影突袭天赋

  // 重置宠物血量
  const activePet = getActivePet()
  if (activePet) {
    activePet.currentHp = activePet.baseHp
  }

  addBattleLog(`【锁妖塔 第${floor}层】`, 'warning')
  addBattleLog(`遭遇 ${monsters.length} 只妖物！`, 'warning')
  monsters.forEach((m, i) => {
    addBattleLog(`  ${i + 1}. Lv.${m.level} ${m.name}`, 'normal')
  })

  // 显示出战宠物
  if (activePet) {
    addBattleLog(`宠物【${activePet.name}】参战！`, 'success')
  }

  return true
}

// 锁妖塔通关当前层
export async function towerFloorCleared() {
  const floor = gameState.battle.towerFloor
  addBattleLog(`恭喜通过第 ${floor} 层！`, 'success')

  const today = await getTodayDate()

  // 只有10/100/200层掉落宠物蛋，且每天只能领取一次
  if (floor === 10 || floor === 100 || floor === 200) {
    const lastClaimed = gameState.player.petEggClaimedDates[floor]

    if (lastClaimed === today) {
      addBattleLog(`今日已领取过第${floor}层宠物蛋`, 'normal')
    } else {
      const petEgg = generatePetEgg(floor)
      if (petEgg) {
        // 直接添加到宠物蛋存储
        if (!gameState.player.petEggs) {
          gameState.player.petEggs = []
        }
        gameState.player.petEggs.push(petEgg)
        gameState.player.petEggClaimedDates[floor] = today
        addBattleLog(`获得【${petEgg.name}】(${petEgg.qualityName})！`, 'success')
        addLog(`锁妖塔第${floor}层奖励：【${petEgg.name}】(${petEgg.qualityName})`, 'success')
      }
    }
  }

  // 90/190层掉落资质丹，每天只能领取一次
  if (floor === 90 || floor === 190) {
    if (!gameState.player.aptitudePillClaimedDates) {
      gameState.player.aptitudePillClaimedDates = {}
    }
    const lastClaimed = gameState.player.aptitudePillClaimedDates[floor]

    if (lastClaimed === today) {
      addBattleLog(`今日已领取过第${floor}层资质丹`, 'normal')
    } else {
      const pill = generateAptitudePill(floor)
      if (pill) {
        // 直接添加到资质丹存储
        if (!gameState.player.aptitudePills) {
          gameState.player.aptitudePills = []
        }
        gameState.player.aptitudePills.push(pill)
        gameState.player.aptitudePillClaimedDates[floor] = today
        addBattleLog(`获得【${pill.name}】！`, 'success')
        addLog(`锁妖塔第${floor}层奖励：【${pill.name}】`, 'success')
      }
    }
  }

  // 宠物技能书掉落（指定层数：110-170初级，180-190中级，300/400高级）
  if (shouldDropPetSkillBook(floor)) {
    if (!gameState.player.petSkillBookClaimedDates) {
      gameState.player.petSkillBookClaimedDates = {}
    }
    const lastClaimed = gameState.player.petSkillBookClaimedDates[floor]

    if (lastClaimed === today) {
      addBattleLog(`今日已领取过第${floor}层宠物技能书`, 'normal')
    } else {
      const skillBook = generatePetSkillBook(floor)
      if (skillBook) {
        // 添加到宠物技能书存储
        if (!gameState.player.petSkillBooks) {
          gameState.player.petSkillBooks = []
        }
        gameState.player.petSkillBooks.push(skillBook)
        gameState.player.petSkillBookClaimedDates[floor] = today
        addBattleLog(`获得【${skillBook.name}】！`, 'success')
        addLog(`锁妖塔第${floor}层奖励：【${skillBook.name}】`, 'success')
      }
    }
  }

  // 20/30/40层奖励：永久额外背包格子（一次性奖励，每层+10格）
  if (floor === 20 || floor === 30 || floor === 40) {
    const expectedSlots = floor === 20 ? 10 : (floor === 30 ? 20 : 30)
    const currentSlots = gameState.player.bonusInventorySlots || 0
    if (currentSlots < expectedSlots) {
      gameState.player.bonusInventorySlots = expectedSlots
      const gained = expectedSlots - currentSlots
      addBattleLog(`🎉 获得永久奖励：背包格子+${gained}！`, 'success')
      addLog(`锁妖塔第${floor}层奖励：背包格子+${gained}（现有${getInventoryLimit()}格）`, 'success')
    } else {
      addBattleLog(`已拥有第${floor}层背包扩容奖励`, 'normal')
    }
  }

  // 50层奖励：永久额外被动技能栏位（一次性奖励）
  if (floor === 50) {
    if (!gameState.player.bonusPassiveSlots || gameState.player.bonusPassiveSlots === 0) {
      gameState.player.bonusPassiveSlots = 1
      addBattleLog(`🎉 获得永久奖励：额外被动技能栏位+1！`, 'success')
      addLog(`锁妖塔第50层奖励：额外被动技能栏位+1（现可装备3个被动技能）`, 'success')
    } else {
      addBattleLog(`已拥有额外被动栏位奖励`, 'normal')
    }
  }

  // 400层以上掉落超级材料（法宝打造系统）
  if (floor >= 400) {
    const droppedMaterial = checkTowerMaterialDrop(floor)
    if (droppedMaterial) {
      addBattleLog(`掉落稀有材料【${droppedMaterial.name}】${droppedMaterial.icon}！`, 'success')
      addLog(`锁妖塔第${floor}层掉落：【${droppedMaterial.name}】`, 'success')
    }
  }

  // 更新最高层数
  if (floor >= gameState.battle.towerHighestFloor) {
    gameState.battle.towerHighestFloor = floor + 1
  }

  // 进入下一层
  gameState.battle.towerFloor = floor + 1
  autoSave()
}

// 检查并补发锁妖塔永久奖励（用于老存档补发）
function checkAndGrantTowerRewards() {
  const highestFloor = gameState.battle.towerHighestFloor || 1
  let rewarded = false

  // 20/30/40层背包奖励
  if (highestFloor > 20) {
    const expectedSlots = highestFloor > 40 ? 30 : (highestFloor > 30 ? 20 : 10)
    const currentSlots = gameState.player.bonusInventorySlots || 0
    if (currentSlots < expectedSlots) {
      gameState.player.bonusInventorySlots = expectedSlots
      addLog(`补发锁妖塔奖励：背包格子+${expectedSlots - currentSlots}（现有${getInventoryLimit()}格）`, 'success')
      rewarded = true
    }
  }

  // 50层被动栏位奖励（到达50层即可）
  if (highestFloor >= 50) {
    if (!gameState.player.bonusPassiveSlots || gameState.player.bonusPassiveSlots === 0) {
      gameState.player.bonusPassiveSlots = 1
      addLog(`补发锁妖塔奖励：额外被动技能栏位+1（现可装备3个被动技能）`, 'success')
      rewarded = true
    }
  }

  if (rewarded) {
    autoSave()
  }
}

// 显示当前生效的buff状态
function showActiveBuffs() {
  const buffs = gameState.battle.playerBuffs
  const activeBuffs = []
  for (const buffName of Object.keys(buffs)) {
    if (buffName === 'shield') {
      activeBuffs.push(`护盾${buffs[buffName].value}`)
    } else if (buffs[buffName].duration > 0) {
      activeBuffs.push(`${getBuffName(buffName)}(${buffs[buffName].duration})`)
    }
  }
  if (activeBuffs.length > 0) {
    addBattleLog(`📊 当前增益: ${activeBuffs.join(' | ')}`, 'info')
  }
}

// 显示当前怪物的debuff状态
function showActiveDebuffs() {
  const monsters = gameState.battle.currentMonsters
  for (const monster of monsters) {
    if (!monster.debuffs || monster.currentHp <= 0) continue
    const activeDebuffs = []
    for (const debuffName of Object.keys(monster.debuffs)) {
      if (monster.debuffs[debuffName].duration > 0) {
        activeDebuffs.push(`${getDebuffName(debuffName)}(${monster.debuffs[debuffName].duration})`)
      }
    }
    if (activeDebuffs.length > 0) {
      addBattleLog(`📊 ${getMonsterNameWithStatus(monster)} 减益: ${activeDebuffs.join(' | ')}`, 'debuff')
    }
  }
}

// 更新玩家buff持续时间
function updatePlayerBuffs() {
  const buffs = gameState.battle.playerBuffs
  for (const buffName of Object.keys(buffs)) {
    if (buffs[buffName].duration > 0) {
      buffs[buffName].duration--
      if (buffs[buffName].duration <= 0) {
        Vue.delete(buffs, buffName)
        addBattleLog(`⏱️ 【${getBuffName(buffName)}】效果结束`, 'info')
      }
    }
  }
}

function getBuffName(buffType) {
  const names = {
    attackBuff: '战意激发',
    critBuff: '致命本能',
    defenseBuff: '铁甲术',
    shield: '金钟罩',
    charge: '蓄力',
    regen: '生命回复',
    absoluteDefense: '绝对防御',
    reflect: '以牙还牙',
    critDamageBuff: '暴击强化',
    dodgeBuff: '闪避强化'
  }
  return names[buffType] || buffType
}

// 更新玩家debuff持续时间
function updatePlayerDebuffs() {
  const debuffs = gameState.battle.playerDebuffs
  if (!debuffs) return

  for (const debuffName of Object.keys(debuffs)) {
    if (debuffs[debuffName].duration > 0) {
      debuffs[debuffName].duration--
      if (debuffs[debuffName].duration <= 0) {
        Vue.delete(debuffs, debuffName)
        addBattleLog(`⏱️ 【${getPlayerDebuffName(debuffName)}】效果结束`, 'info')
      }
    }
  }
}

function getPlayerDebuffName(debuffType) {
  const names = {
    healReduce: '重伤'
  }
  return names[debuffType] || debuffType
}

// 更新怪物debuff持续时间
function updateMonsterDebuffs() {
  const monsters = gameState.battle.currentMonsters
  for (const monster of monsters) {
    if (!monster.debuffs) continue
    for (const debuffName of Object.keys(monster.debuffs)) {
      if (monster.debuffs[debuffName].duration > 0) {
        monster.debuffs[debuffName].duration--
        if (monster.debuffs[debuffName].duration <= 0) {
          Vue.delete(monster.debuffs, debuffName)
          addBattleLog(`⏱️ ${getMonsterNameWithStatus(monster)} 的【${getDebuffName(debuffName)}】效果结束`, 'info')
        }
      }
    }
  }
}

function getDebuffName(debuffType) {
  const names = {
    vulnerable: '易伤',
    bleed: '流血',
    poison: '中毒',
    burn: '灼烧',
    stun: '眩晕',
    weaken: '虚弱',
    curse: '诅咒',
    freeze: '冰冻'
  }
  return names[debuffType] || debuffType
}

// 获取状态效果图标
function getStatusIcon(statusType) {
  const icons = {
    bleed: '🩸',
    poison: '☠️',
    burn: '🔥',
    stun: '💫',
    weaken: '💔',
    curse: '💀',
    freeze: '❄️',
    vulnerable: '💢'
  }
  return icons[statusType] || ''
}

// 获取怪物名称（带状态图标）
function getMonsterNameWithStatus(monster) {
  if (!monster) return ''
  let name = monster.name
  if (monster.debuffs) {
    const icons = []
    for (const debuffType of Object.keys(monster.debuffs)) {
      if (monster.debuffs[debuffType].duration > 0) {
        const icon = getStatusIcon(debuffType)
        if (icon) icons.push(icon)
      }
    }
    if (icons.length > 0) {
      name = `${name}${icons.join('')}`
    }
  }
  return name
}

// 获取玩家状态图标
function getPlayerStatusIcons() {
  const icons = []
  const buffs = gameState.battle.playerBuffs || {}

  if (buffs.dodgeBuff) icons.push('🛡️')
  if (buffs.shield) icons.push('🔰')
  if (buffs.critBuff) icons.push('⚡')
  if (buffs.attackBuff) icons.push('⚔️')
  if (buffs.defenseBuff) icons.push('🛡️')

  return icons.join('')
}

// 获取宠物状态图标
function getPetStatusIcons() {
  const icons = []
  const buffs = gameState.battle.petBuffs || {}

  if (buffs.rageBonus) icons.push('🔥')

  return icons.join('')
}

// 检查是否应该判定战斗失败（玩家死亡且宠物也死亡或不存在）
function shouldLoseBattle() {
  if (gameState.battle.playerCurrentHp > 0) return false
  const activePet = getActivePet()
  if (!activePet || activePet.currentHp <= 0) return true
  return false
}

// 执行一回合战斗
export function battleRound() {
  if (!gameState.battle.isInBattle) return null

  // 检查是否应该判定失败（玩家死亡且宠物也死亡）
  if (shouldLoseBattle()) {
    gameState.battle.playerCurrentHp = 0
    gameState.battle.isInBattle = false
    stopAutoBattle()
    return 'lose'
  }

  gameState.battle.roundCount++

  // 每5回合显示一次当前增益/减益状态
  if (gameState.battle.roundCount % 5 === 1) {
    showActiveBuffs()
    showActiveDebuffs()
  }

  updateCooldowns()
  updatePlayerBuffs()
  updatePlayerDebuffs()  // 更新玩家负面效果
  updateMonsterDebuffs()

  const stats = getPlayerStats()
  const maxHp = stats.maxHp
  const monsters = gameState.battle.currentMonsters
  const aliveMonsters = monsters.filter(m => m.currentHp > 0)

  if (aliveMonsters.length === 0) {
    gameState.battle.isInBattle = false
    return 'win'
  }

  // 玩家存活时才进行生命回复
  const playerAlive = gameState.battle.playerCurrentHp > 0

  // 生命回复（每回合 - 被动技能）
  if (playerAlive && stats.hpRegen > 0 && gameState.battle.playerCurrentHp < maxHp) {
    const baseHeal = Math.floor(maxHp * stats.hpRegen / 100)
    const healAmount = calculateEffectiveHeal(baseHeal)
    if (healAmount > 0) {
      gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
      addBattleLog(`💚 生命之源 恢复 ${healAmount} 点生命`, 'heal')
    }
  }

  // 回复buff（圣光治愈等技能）
  const regenBuff = gameState.battle.playerBuffs.regen
  if (playerAlive && regenBuff && regenBuff.duration > 0 && gameState.battle.playerCurrentHp < maxHp) {
    const baseHeal = Math.floor(maxHp * regenBuff.value / 100)
    const healAmount = calculateEffectiveHeal(baseHeal)
    if (healAmount > 0) {
      gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
      addBattleLog(`💚 持续回复 ${healAmount} 点生命`, 'heal')
    }
  }

  let result = null
  let skipAttack = !playerAlive  // 玩家死亡时跳过攻击

  // 检查蓄力状态
  const chargeState = gameState.battle.playerBuffs.charge
  let chargeBonus = 1
  if (chargeState) {
    chargeBonus = chargeState.value
    Vue.delete(gameState.battle.playerBuffs, 'charge')
    addBattleLog(`⚡ 蓄力完成，释放强力攻击！`, 'warning')
  }

  // 选择要使用的技能
  const availableSkills = getAvailableSkills()
  let selectedSkill = null
  let skillMultiplier = 1
  let extraPenetration = 0
  let extraCritBoost = 0
  let isGuaranteedHit = false
  let lifestealPercent = stats.lifesteal || 0
  let hitCount = 1
  let isAoe = false

  // 优先使用冷却好的高级技能
  if (availableSkills.length > 0) {
    // 选择倍率最高的可用技能
    selectedSkill = availableSkills.reduce((best, skill) =>
      skill.damageMultiplier > best.damageMultiplier ? skill : best
    )
    skillMultiplier = selectedSkill.damageMultiplier
    useSkill(selectedSkill)

    // 给已装备的技能增加经验（降低获取量）
    addSkillExp(selectedSkill.id, 8)

    // 处理技能特效
    if (selectedSkill.effect === 'pen') extraPenetration = selectedSkill.effectValue
    if (selectedSkill.effect === 'critBoost') extraCritBoost = selectedSkill.effectValue
    if (selectedSkill.effect === 'guaranteed') isGuaranteedHit = true
    if (selectedSkill.effect === 'lifesteal') lifestealPercent += selectedSkill.effectValue
    if (selectedSkill.effect === 'multiHit') hitCount = selectedSkill.effectValue

    // AOE技能：攻击多个目标
    if (selectedSkill.hitCount) {
      hitCount = selectedSkill.hitCount
      isAoe = true
    }

    // 蓄力技能：本回合不攻击，下回合伤害翻倍
    if (selectedSkill.effect === 'charge') {
      gameState.battle.playerBuffs.charge = {
        value: skillMultiplier,
        hitCount: selectedSkill.hitCount || 2,
        debuff: selectedSkill.debuff,
        debuffValue: selectedSkill.debuffValue,
        debuffDuration: selectedSkill.debuffDuration,
        duration: 1
      }
      addBattleLog(`⚡ 【${selectedSkill.name}】开始蓄力...`, 'buff')
      skipAttack = true
    }

    // 治愈技能（基于攻击力）
    if (selectedSkill.effect === 'heal') {
      const baseHeal = Math.floor(stats.attack * skillMultiplier)
      const healAmount = calculateEffectiveHeal(baseHeal)
      if (healAmount > 0) {
        gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
        addBattleLog(`💚 【${selectedSkill.name}】恢复 ${healAmount} 点生命`, 'heal')
      }
      skipAttack = true
    }

    // 攻击增益
    if (selectedSkill.effect === 'attackBuff') {
      gameState.battle.playerBuffs.attackBuff = {
        value: selectedSkill.effectValue,
        duration: selectedSkill.effectDuration
      }
      addBattleLog(`⚔️ 【${selectedSkill.name}】攻击力+${selectedSkill.effectValue}% (${selectedSkill.effectDuration}回合)`, 'buff')
      skipAttack = true
    }

    // 暴击增益
    if (selectedSkill.effect === 'critBuff') {
      gameState.battle.playerBuffs.critBuff = {
        value: selectedSkill.effectValue,
        duration: selectedSkill.effectDuration
      }
      addBattleLog(`🎯 【${selectedSkill.name}】暴击率+${selectedSkill.effectValue}% (${selectedSkill.effectDuration}回合)`, 'buff')
      skipAttack = true
    }

    // 防御增益
    if (selectedSkill.effect === 'defenseBuff') {
      gameState.battle.playerBuffs.defenseBuff = {
        value: selectedSkill.effectValue,
        duration: selectedSkill.effectDuration
      }
      addBattleLog(`🛡️ 【${selectedSkill.name}】防御力+${selectedSkill.effectValue}% (${selectedSkill.effectDuration}回合)`, 'buff')
      skipAttack = true
    }

    // 护盾
    if (selectedSkill.effect === 'shield') {
      const shieldAmount = Math.floor(maxHp * selectedSkill.effectValue / 100)
      gameState.battle.playerBuffs.shield = { value: shieldAmount, duration: 99 }
      addBattleLog(`🔰 【${selectedSkill.name}】获得 ${shieldAmount} 点护盾`, 'buff')
      skipAttack = true
    }

    // 圣光治愈（治疗+持续回复）
    if (selectedSkill.effect === 'healAndRegen') {
      const baseHeal = Math.floor(stats.attack * skillMultiplier)
      const healAmount = calculateEffectiveHeal(baseHeal)
      gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
      gameState.battle.playerBuffs.regen = { value: selectedSkill.effectValue, duration: selectedSkill.effectDuration }
      addBattleLog(`💚 【${selectedSkill.name}】恢复 ${healAmount} 生命，获得${selectedSkill.effectDuration}回合回复效果`, 'heal')
      skipAttack = true
    }

    // 生命绽放（牺牲当前生命换最大生命百分比恢复）
    if (selectedSkill.effect === 'lifeBloom') {
      const sacrificeHp = Math.floor(gameState.battle.playerCurrentHp * selectedSkill.sacrificePercent / 100)
      const baseHeal = Math.floor(maxHp * selectedSkill.healPercent / 100)
      const healAmount = calculateEffectiveHeal(baseHeal)
      gameState.battle.playerCurrentHp -= sacrificeHp  // 消耗生命仍会执行
      gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
      addBattleLog(`🌸 【${selectedSkill.name}】消耗 ${sacrificeHp} 生命，恢复 ${healAmount} 生命`, 'heal')
      skipAttack = true
    }

    // 绝对防御（超高减伤buff）
    if (selectedSkill.effect === 'absoluteDefense') {
      gameState.battle.playerBuffs.absoluteDefense = { value: selectedSkill.effectValue, duration: selectedSkill.effectDuration }
      addBattleLog(`🛡️ 【${selectedSkill.name}】${selectedSkill.effectDuration}回合内受伤-${selectedSkill.effectValue}%`, 'buff')
      skipAttack = true
    }

    // 以牙还牙（反伤buff）
    if (selectedSkill.effect === 'reflectBuff') {
      gameState.battle.playerBuffs.reflect = { value: selectedSkill.effectValue, duration: selectedSkill.effectDuration }
      addBattleLog(`🔄 【${selectedSkill.name}】${selectedSkill.effectDuration}回合内反弹${selectedSkill.effectValue}%伤害`, 'buff')
      skipAttack = true
    }

    // 混沌之力（伤害+随机debuff）
    if (selectedSkill.effect === 'chaosStrike') {
      // 不跳过攻击，正常造成伤害，在伤害逻辑中处理随机debuff
      gameState.battle.chaosStrikeActive = true
    }

    // 牺牲技能（消耗生命换伤害）
    if (selectedSkill.effect === 'sacrifice') {
      const sacrificeHp = Math.floor(gameState.battle.playerCurrentHp * selectedSkill.effectValue / 100)
      gameState.battle.playerCurrentHp -= sacrificeHp
      addBattleLog(`使用【${selectedSkill.name}】消耗 ${sacrificeHp} 点生命！`, 'danger')

      // 检查是否因牺牲技能死亡
      if (gameState.battle.playerCurrentHp <= 0) {
        gameState.battle.playerCurrentHp = 0
        addBattleLog(`你因透支生命而倒下...`, 'danger')
        applyDeathPenalty()
        // 检查宠物是否还能继续战斗
        if (shouldLoseBattle()) {
          gameState.battle.isInBattle = false
          stopAutoBattle()
          return 'lose'
        } else {
          addBattleLog(`宠物继续为你战斗！`, 'warning')
        }
      }
    }
  }

  // ========== 法宝主动技能 ==========
  const equippedArtifact = getEquippedCraftedArtifact()
  if (equippedArtifact && equippedArtifact.activeSkills && equippedArtifact.activeSkills.length > 0) {
    for (const artSkill of equippedArtifact.activeSkills) {
      const cooldown = gameState.battle.artifactSkillCooldowns[artSkill.id] || 0
      if (cooldown <= 0) {
        // 计算技能数值（含等级成长）
        const artLevel = equippedArtifact.level || 1
        const baseValue = artSkill.baseValue || 0
        const levelBonus = (artLevel - 1) * (artSkill.growthPerLevel || 0)
        const skillValue = baseValue + levelBonus

        // 设置冷却
        gameState.battle.artifactSkillCooldowns[artSkill.id] = artSkill.cooldown || 5

        // 根据技能效果执行
        if (artSkill.effect === 'shield') {
          // 灵光护体：获得护盾
          const shieldAmount = Math.floor(skillValue)
          gameState.battle.playerBuffs.shield = { value: shieldAmount, duration: 99 }
          addBattleLog(`🔮 法宝【${artSkill.name}】：获得 ${shieldAmount} 点护盾`, 'buff')
        }
        else if (artSkill.effect === 'heal') {
          // 灵气疗伤：回复生命
          const baseHeal = Math.floor(stats.maxHp * skillValue / 100)
          const healAmount = calculateEffectiveHeal(baseHeal)
          if (healAmount > 0) {
            gameState.battle.playerCurrentHp = Math.min(stats.maxHp, gameState.battle.playerCurrentHp + healAmount)
            addBattleLog(`🔮 法宝【${artSkill.name}】：回复 ${healAmount} 点生命`, 'heal')
          }
        }
        else if (artSkill.effect === 'damageStun') {
          // 雷霆一击：对第一个敌人造成伤害并眩晕
          const target = aliveMonsters[0]
          if (target) {
            const damage = Math.floor(skillValue)
            target.currentHp -= damage
            if (!target.debuffs) target.debuffs = {}
            target.debuffs.stun = { duration: artSkill.stunDuration || 1 }
            addBattleLog(`🔮 法宝【${artSkill.name}】：对 ${getMonsterNameWithStatus(target)} 造成 ${damage} 伤害并眩晕！`, 'success')
          }
        }
        else if (artSkill.effect === 'aoeDamage') {
          // 烈焰爆发：对所有敌人造成伤害
          const damage = Math.floor(skillValue)
          for (const target of aliveMonsters) {
            target.currentHp -= damage
          }
          addBattleLog(`🔮 法宝【${artSkill.name}】：对全体敌人造成 ${damage} 伤害！`, 'success')
        }
        else if (artSkill.effect === 'attackDebuff') {
          // 虚弱诅咒：降低敌人攻击力
          for (const target of aliveMonsters) {
            if (!target.debuffs) target.debuffs = {}
            target.debuffs.weaken = { value: skillValue, duration: artSkill.duration || 3 }
          }
          addBattleLog(`🔮 法宝【${artSkill.name}】：降低全体敌人 ${skillValue.toFixed(1)}% 攻击力`, 'debuff')
        }
        else if (artSkill.effect === 'skipTurn') {
          // 时间静止：敌人跳过回合
          for (const target of aliveMonsters) {
            if (!target.debuffs) target.debuffs = {}
            target.debuffs.stun = { duration: artSkill.duration || 1 }
          }
          addBattleLog(`🔮 法宝【${artSkill.name}】：全体敌人被定身 ${artSkill.duration || 1} 回合！`, 'debuff')
        }
        else if (artSkill.effect === 'attackBuff') {
          // 狂暴之力：提升攻击力
          gameState.battle.playerBuffs.attackBuff = {
            value: skillValue,
            duration: artSkill.duration || 3
          }
          addBattleLog(`🔮 法宝【${artSkill.name}】：攻击力 +${skillValue.toFixed(1)}% (${artSkill.duration || 3}回合)`, 'buff')
        }

        break // 每回合只使用一个法宝技能
      }
    }

    // 更新法宝技能冷却
    for (const skillId in gameState.battle.artifactSkillCooldowns) {
      if (gameState.battle.artifactSkillCooldowns[skillId] > 0) {
        gameState.battle.artifactSkillCooldowns[skillId]--
      }
    }
  }

  // 应用蓄力加成
  let chargeDebuff = null
  if (chargeBonus > 1) {
    skillMultiplier = chargeBonus
    isAoe = true
    hitCount = chargeState.hitCount || 2
    // 保存蓄力技能的debuff信息
    if (chargeState.debuff) {
      chargeDebuff = {
        type: chargeState.debuff,
        value: chargeState.debuffValue,
        duration: chargeState.debuffDuration
      }
    }
  }

  // 确定攻击目标列表
  let targetList = []
  if (!skipAttack) {
    if (isAoe) {
      // AOE技能：攻击最多hitCount个不同的敌人
      targetList = aliveMonsters.slice(0, hitCount)
    } else {
      // 单体技能：攻击同一目标hitCount次
      const targetMonster = aliveMonsters[0]
      for (let i = 0; i < hitCount; i++) {
        targetList.push(targetMonster)
      }
    }
  }

  // 执行攻击
  for (const targetMonster of targetList) {
    if (targetMonster.currentHp <= 0) continue

    const playerHitRoll = Math.random() * 100
    // 使用怪物自身的闪避属性
    const baseDodge = targetMonster.dodge || 0
    const monsterDodge = targetMonster.buffs.dodge ? baseDodge + targetMonster.buffs.dodge : baseDodge

    if (isGuaranteedHit || playerHitRoll < stats.hit - monsterDodge) {
      const critRoll = Math.random() * 100
      const effectiveCritRate = stats.critRate + extraCritBoost
      // 暗影突袭天赋：闪避后必暴击
      const shadowStrikeActive = gameState.battle.shadowStrikeReady && stats.shadowStrikeDamage > 0
      const isCrit = shadowStrikeActive || critRoll < effectiveCritRate

      // 计算怪物有效防御（考虑buff和defenseDown debuff）
      let monsterEffectiveDefense = targetMonster.buffs.defense ? targetMonster.defense * (1 + targetMonster.buffs.defense / 100) : targetMonster.defense
      if (targetMonster.debuffs && targetMonster.debuffs.defenseDown) {
        monsterEffectiveDefense = Math.floor(monsterEffectiveDefense * (1 - targetMonster.debuffs.defenseDown.value / 100))
      }

      let damage = calculateDamage(
        stats.attack,
        monsterEffectiveDefense,
        stats.penetration + extraPenetration,
        stats.skillDamage,
        isCrit,
        stats.critDamage
      )

      // 应用技能倍率
      damage = Math.floor(damage * skillMultiplier)

      // 暗影突袭伤害加成
      if (shadowStrikeActive) {
        damage = Math.floor(damage * (1 + stats.shadowStrikeDamage / 100))
        addBattleLog(`🗡️ 暗影突袭！伤害+${stats.shadowStrikeDamage}%`, 'critical')
        gameState.battle.shadowStrikeReady = false
      }

      // 检查敌人易伤debuff
      if (targetMonster.debuffs && targetMonster.debuffs.vulnerable) {
        const vulnerableBonus = targetMonster.debuffs.vulnerable.value / 100
        damage = Math.floor(damage * (1 + vulnerableBonus))
      }

      // 检查诅咒debuff（增加受到的伤害）
      if (targetMonster.debuffs && targetMonster.debuffs.curse) {
        const curseBonus = targetMonster.debuffs.curse.value / 100
        damage = Math.floor(damage * (1 + curseBonus))
      }

      // 审判之力：对有负面状态的敌人额外伤害（法宝被动技能）
      if (stats.debuffDamageBonus > 0 && targetMonster.debuffs) {
        const hasDebuff = Object.keys(targetMonster.debuffs).some(key =>
          targetMonster.debuffs[key] && (targetMonster.debuffs[key].duration > 0 || targetMonster.debuffs[key].value > 0)
        )
        if (hasDebuff) {
          const judgmentBonus = stats.debuffDamageBonus / 100
          damage = Math.floor(damage * (1 + judgmentBonus))
        }
      }

      // 处刑者天赋：对低于30%血量的敌人伤害加成
      if (stats.executeDamage > 0 && targetMonster.currentHp < targetMonster.hp * 0.3) {
        const executeBonus = stats.executeDamage / 100
        damage = Math.floor(damage * (1 + executeBonus))
        addBattleLog(`💀 处刑者！对低血量敌人伤害+${stats.executeDamage}%`, 'critical')
      }

      // 反伤护盾（真实伤害）
      const reflectSkill = targetMonster.skills.find(s => s.effect === 'reflect')
      if (reflectSkill) {
        const reflectDamage = Math.floor(damage * reflectSkill.value / 100)
        gameState.battle.playerCurrentHp -= reflectDamage
        addBattleLog(`🔄 反伤护盾 反弹 ${reflectDamage} 伤害`, 'success')

        // 检查是否因反伤死亡
        if (gameState.battle.playerCurrentHp <= 0) {
          gameState.battle.playerCurrentHp = 0
          addBattleLog(`你被反伤击败了...`, 'danger')
          applyDeathPenalty()
          // 检查宠物是否还能继续战斗
          if (shouldLoseBattle()) {
            gameState.battle.isInBattle = false
            stopAutoBattle()
            return 'lose'
          } else {
            addBattleLog(`宠物继续为你战斗！`, 'warning')
          }
        }
      }

      targetMonster.currentHp -= damage

      // 应用蓄力技能的debuff（易伤等）
      if (chargeDebuff && chargeDebuff.type === 'vulnerable') {
        if (!targetMonster.debuffs) targetMonster.debuffs = {}
        targetMonster.debuffs.vulnerable = {
          value: chargeDebuff.value,
          duration: chargeDebuff.duration
        }
        addBattleLog(`💔 ${getMonsterNameWithStatus(targetMonster)}【易伤】受伤+${chargeDebuff.value}% (${chargeDebuff.duration}回合)`, 'debuff')
      }

      // 混沌之力随机debuff
      if (gameState.battle.chaosStrikeActive) {
        if (!targetMonster.debuffs) targetMonster.debuffs = {}
        const chaosEffects = ['bleed', 'poison', 'burn', 'weaken', 'curse']
        const randomEffect = chaosEffects[Math.floor(Math.random() * chaosEffects.length)]
        targetMonster.debuffs[randomEffect] = { value: 15, duration: 3 }
        const effectNames = { bleed: '流血', poison: '中毒', burn: '灼烧', weaken: '虚弱', curse: '诅咒' }
        addBattleLog(`🌀 混沌之力附加【${effectNames[randomEffect]}】效果！`, 'debuff')
        gameState.battle.chaosStrikeActive = false
      }

      // 技能附加效果：冰冻
      if (selectedSkill && selectedSkill.effect === 'freeze') {
        const freezeChance = selectedSkill.effectValue || 30
        if (Math.random() * 100 < freezeChance) {
          if (!targetMonster.debuffs) targetMonster.debuffs = {}
          targetMonster.debuffs.freeze = { duration: selectedSkill.effectDuration || 1 }
          addBattleLog(`❄️ ${getMonsterNameWithStatus(targetMonster)} 被冰冻了 ${selectedSkill.effectDuration || 1} 回合！`, 'debuff')
        }
      }

      // 技能附加效果：灼烧
      if (selectedSkill && selectedSkill.effect === 'burn') {
        if (!targetMonster.debuffs) targetMonster.debuffs = {}
        targetMonster.debuffs.burn = { value: selectedSkill.effectValue || 5, duration: 3 }
        addBattleLog(`🔥 ${getMonsterNameWithStatus(targetMonster)} 被灼烧了！`, 'debuff')
      }

      // 吸血效果
      if (lifestealPercent > 0) {
        const baseHeal = Math.floor(damage * lifestealPercent / 100)
        const healAmount = calculateEffectiveHeal(baseHeal)
        if (healAmount > 0) {
          gameState.battle.playerCurrentHp = Math.min(stats.maxHp, gameState.battle.playerCurrentHp + healAmount)
          addBattleLog(`🩸 吸血 恢复 ${healAmount} 点生命`, 'heal')
        }
      }

      if (selectedSkill) {
        if (isCrit) {
          addBattleLog(`💥 【${selectedSkill.name}】暴击！对 ${getMonsterNameWithStatus(targetMonster)} 造成 ${damage} 伤害`, 'critical')
        } else {
          addBattleLog(`【${selectedSkill.name}】对 ${getMonsterNameWithStatus(targetMonster)} 造成 ${damage} 伤害`, 'success')
        }
      } else {
        if (isCrit) {
          addBattleLog(`💥 暴击！对 ${getMonsterNameWithStatus(targetMonster)} 造成 ${damage} 伤害`, 'critical')
        } else {
          addBattleLog(`对 ${getMonsterNameWithStatus(targetMonster)} 造成 ${damage} 伤害`, 'success')
        }
      }

      // 检查怪物死亡
      if (targetMonster.currentHp <= 0) {
        // 检查不屈意志
        const reviveSkill = targetMonster.skills.find(s => s.effect === 'revive')
        if (reviveSkill && !targetMonster.reviveUsed) {
          targetMonster.reviveUsed = true
          targetMonster.currentHp = Math.floor(targetMonster.hp * reviveSkill.value / 100)
          addBattleLog(`${getMonsterNameWithStatus(targetMonster)} 发动【不屈意志】复活，恢复 ${reviveSkill.value}% 血量！`, 'warning')
        } else {
          targetMonster.currentHp = 0
          gameState.battle.killCount++

          // 死神低语：击杀回血（法宝被动技能）
          if (stats.killHealPercent > 0) {
            const baseHeal = Math.floor(stats.maxHp * stats.killHealPercent / 100)
            const killHeal = calculateEffectiveHeal(baseHeal)
            if (killHeal > 0) {
              gameState.battle.playerCurrentHp = Math.min(stats.maxHp, gameState.battle.playerCurrentHp + killHeal)
              addBattleLog(`💀 【死神低语】击杀回复 ${killHeal} 生命`, 'heal')
            }
          }

          // 奖励（应用经验和金币倍率）
          const expGain = targetMonster.exp * gameState.devExpMultiplier
          const goldGain = targetMonster.gold * gameState.devGoldMultiplier
          gameState.player.exp += expGain
          gameState.player.realmExp += Math.floor(expGain / 4) // 修为获取降低
          gameState.player.gold += goldGain

          // 更新战斗统计
          if (gameState.battle.battleStats) {
            gameState.battle.battleStats.totalExp += expGain
            gameState.battle.battleStats.totalGold += goldGain
            gameState.battle.battleStats.totalKills++
          }

          // 给所有已装备的主动技能增加经验（降低获取量，应用倍率）
          const skillExpGain = Math.floor(expGain / 8)
          for (const skillId of gameState.player.equippedActiveSkills) {
            addSkillExp(skillId, skillExpGain)
          }
          // 给所有已装备的被动技能增加经验（降低获取量，应用倍率）
          for (const skillId of gameState.player.equippedPassiveSkills) {
            addSkillExp(skillId, skillExpGain)
          }
          // 给出战宠物增加经验
          const activePetForExp = getActivePet()
          if (activePetForExp) {
            addPetExp(activePetForExp.id, Math.floor(expGain / 4))
          }

          addBattleLog(`击败 ${getMonsterNameWithStatus(targetMonster)}！+${expGain}经验 +${goldGain}灵石`, 'success')

          // 装备掉落（加上dropRate属性加成和开发倍率）- 法宝只能通过打造获得
          const effectiveDropRate = (targetMonster.dropRate + stats.dropRate) * gameState.devDropMultiplier
          if (Math.random() * 100 < effectiveDropRate) {
            const slots = Object.keys(equipSlots).filter(s => s !== 'artifact')
            const randomSlot = slots[Math.floor(Math.random() * slots.length)]
            const dropLevel = Math.max(1, targetMonster.level + Math.floor(Math.random() * 5) - 2)
            const newEquip = generateEquipment(dropLevel, randomSlot)

            // 统计掉落
            if (gameState.battle.battleStats && gameState.battle.battleStats.drops) {
              const quality = newEquip.quality
              if (gameState.battle.battleStats.drops[quality] !== undefined) {
                gameState.battle.battleStats.drops[quality]++
              }
            }

            // 检查拾取筛选
            const pickupResult = shouldPickupItem(newEquip)
            if (pickupResult.pickup) {
              if (addToInventory(newEquip)) {
                addBattleLog(`掉落【${newEquip.qualityName}】${newEquip.name}`, 'success')
              } else {
                addBattleLog(`掉落【${newEquip.qualityName}】${newEquip.name}，但背包已满！`, 'warning')
              }
            } else if (pickupResult.autoSell) {
              // 自动卖出
              gameState.player.gold += pickupResult.sellPrice
              addBattleLog(`自动卖出【${newEquip.qualityName}】${newEquip.name} +${pickupResult.sellPrice}灵石`, 'normal')
            } else {
              // 不拾取
              addBattleLog(`过滤【${newEquip.qualityName}】${newEquip.name}`, 'normal')
            }
          }

          // 技能书掉落
          const skillBookDrop = rollSkillBookDrop(gameState.battle.selectedMapId)
          if (skillBookDrop) {
            const droppedSkill = getSkillById(skillBookDrop.skillId)
            // 检查是否已学习该技能
            const isLearned = !!gameState.player.learnedSkills[skillBookDrop.skillId]
            // 检查背包中是否已有该技能书
            const hasInInventory = gameState.player.inventory.some(
              item => item.type === 'skillBook' && item.skillId === skillBookDrop.skillId
            )

            if (!isLearned && !hasInInventory) {
              const skillBook = {
                id: `skillbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'skillBook',
                skillId: skillBookDrop.skillId,
                name: `${droppedSkill.name}技能书`,
                rarity: droppedSkill.rarity
              }

              // 统计技能书掉落
              if (gameState.battle.battleStats && gameState.battle.battleStats.drops) {
                gameState.battle.battleStats.drops.skillBooks++
              }

              // 检查拾取筛选
              const pickupResult = shouldPickupItem(skillBook)
              if (pickupResult.pickup) {
                const rarityName = skillRarityConfig[droppedSkill.rarity].name
                if (addToInventory(skillBook)) {
                  addBattleLog(`掉落【${rarityName}】${skillBook.name}！`, 'success')
                } else {
                  addBattleLog(`掉落【${rarityName}】${skillBook.name}，但背包已满！`, 'warning')
                }
              } else {
                addBattleLog(`过滤技能书【${droppedSkill.name}】`, 'normal')
              }
            }
          }

          // 材料掉落（法宝打造系统）
          if (!gameState.battle.isTowerMode) {
            const droppedMaterial = checkMaterialDrop(gameState.battle.selectedMapId)
            if (droppedMaterial) {
              addBattleLog(`掉落材料【${droppedMaterial.name}】${droppedMaterial.icon}`, 'success')
            }
          }

          // 给装备的打造法宝增加经验
          const equippedCraftedArt = getEquippedCraftedArtifact()
          if (equippedCraftedArt) {
            addCraftedArtifactExp(equippedCraftedArt.id, Math.floor(expGain / 10))
          }

          checkLevelUp()
          checkRealmBreakthrough()

          // 检查是否全部怪物都死亡
          const remainingMonsters = monsters.filter(m => m.currentHp > 0)
          if (remainingMonsters.length === 0) {
            gameState.battle.isInBattle = false
            // 锁妖塔模式：通关当前层
            if (gameState.battle.isTowerMode) {
              towerFloorCleared()
            }
            return 'win'
          }
        }
      }
    } else {
      addBattleLog(`💨 ${getMonsterNameWithStatus(targetMonster)} 闪避了攻击！`, 'normal')
    }
  } // end of hit loop

  // ========== 宠物攻击 ==========
  const activePet = getActivePet()
  if (activePet && activePet.currentHp > 0) {
    const petStats = getPetStats(activePet)
    const aliveForPet = monsters.filter(m => m.currentHp > 0)
    const petPassive = getPetPassiveEffects(activePet)

    // 初始化宠物技能冷却
    if (!gameState.battle.petSkillCooldowns) {
      gameState.battle.petSkillCooldowns = {}
    }
    // 初始化宠物buff
    if (!gameState.battle.petBuffs) {
      gameState.battle.petBuffs = {}
    }

    // 再生效果：每回合回复生命
    if (petPassive.regen > 0) {
      const regenAmount = Math.floor(petStats.maxHp * petPassive.regen / 100)
      const oldHp = activePet.currentHp
      activePet.currentHp = Math.min(petStats.maxHp, activePet.currentHp + regenAmount)
      if (activePet.currentHp > oldHp) {
        addBattleLog(`💚 宠物【${activePet.name}】再生恢复 ${activePet.currentHp - oldHp} 生命`, 'heal')
      }
    }

    // 检查条件触发技能（如暴怒临界）
    if (activePet.skills && activePet.skills.length > 0) {
      const hpPercent = (activePet.currentHp / petStats.maxHp) * 100
      for (const skillId of activePet.skills) {
        const skill = getSkillById(skillId)
        if (!skill) continue

        // 暴怒临界类技能：生命低于阈值时触发
        if (skill.effect === 'rageThreshold' && skill.triggerThreshold) {
          const currentCd = gameState.battle.petSkillCooldowns[skillId] || 0
          if (currentCd <= 0 && hpPercent < skill.triggerThreshold) {
            // 触发技能
            const healToHp = Math.floor(petStats.maxHp * skill.healTo / 100)
            activePet.currentHp = Math.min(petStats.maxHp, Math.max(activePet.currentHp, healToHp))

            // 添加攻防buff
            if (skill.statBonus) {
              gameState.battle.petBuffs.rageBonus = {
                attack: skill.statBonus,
                defense: skill.statBonus,
                duration: skill.effectDuration
              }
            }

            // 设置冷却
            gameState.battle.petSkillCooldowns[skillId] = skill.cooldown

            addBattleLog(`🔥 宠物【${activePet.name}】触发【${skill.name}】！生命恢复至${skill.healTo}%，攻防+${skill.statBonus}%`, 'buff')
          }
        }
      }
    }

    if (aliveForPet.length > 0) {
      const petTarget = aliveForPet[0]

      // 检查宠物是否有可用技能
      let petUseSkill = null
      let petSkillDamageMultiplier = 1

      if (activePet.skills && activePet.skills.length > 0) {

        // 查找可用的主动技能（有冷却且不是被动的）
        for (const skillId of activePet.skills) {
          const skill = getSkillById(skillId)
          if (!skill) continue

          // 跳过被动技能（cooldown为0或type为petLearnablePassive）
          if (skill.cooldown === 0 || skill.type === 'petLearnablePassive') continue

          const currentCd = gameState.battle.petSkillCooldowns[skillId] || 0
          if (currentCd <= 0) {
            petUseSkill = skill
            if (skill.baseDamageMultiplier) {
              petSkillDamageMultiplier = skill.baseDamageMultiplier
            }
            // 设置冷却（应用熟练施法的冷却减少）
            let finalCooldown = skill.cooldown
            if (petPassive.castMastery) {
              finalCooldown = Math.max(1, finalCooldown - petPassive.castMastery.cooldownReduction)
            }
            gameState.battle.petSkillCooldowns[skillId] = finalCooldown
            break
          }
        }
      }

      // 使用怪物自身的闪避属性
      const petTargetDodge = petTarget.dodge || 0

      const petHitRoll = Math.random() * 100
      if (petHitRoll < petStats.hit - petTargetDodge) {
        // 计算赛亚人buff的暴击加成
        let petCritBonus = 0
        let petAttackBonus = 0
        if (gameState.battle.petBuffs && gameState.battle.petBuffs.saiyan && gameState.battle.petBuffs.saiyan.duration > 0) {
          petCritBonus = gameState.battle.petBuffs.saiyan.critRateBonus || 0
          petAttackBonus = gameState.battle.petBuffs.saiyan.attackBonus || 0
        }

        // 战场嗅觉暴击加成
        if (petPassive.battleInstinct) {
          petCritBonus += petPassive.battleInstinct.critRateBonus
        }

        const petCritRoll = Math.random() * 100
        const petCrit = petCritRoll < (petStats.critRate + petCritBonus)

        // 计算敌人有效防御（考虑defenseDown debuff）
        let targetEffectiveDefense = petTarget.defense
        if (petTarget.debuffs && petTarget.debuffs.defenseDown) {
          targetEffectiveDefense = Math.floor(targetEffectiveDefense * (1 - petTarget.debuffs.defenseDown.value / 100))
        }

        let petDamage = calculateDamage(
          petStats.attack,
          targetEffectiveDefense,
          petStats.penetration || 0,
          0,
          petCrit,
          petStats.critDamage
        )

        // 应用技能伤害倍率
        petDamage = Math.floor(petDamage * petSkillDamageMultiplier)

        // 应用宠物buff（如暴怒临界的攻击加成）
        if (gameState.battle.petBuffs && gameState.battle.petBuffs.rageBonus) {
          const rageBonus = gameState.battle.petBuffs.rageBonus
          petDamage = Math.floor(petDamage * (1 + rageBonus.attack / 100))
        }

        // 应用赛亚人buff的攻击加成
        if (petAttackBonus > 0) {
          petDamage = Math.floor(petDamage * (1 + petAttackBonus / 100))
        }

        // 应用血之狂欢buff的攻击加成
        let bloodFrenzyLifesteal = 0
        if (gameState.battle.petBuffs && gameState.battle.petBuffs.bloodFrenzy && gameState.battle.petBuffs.bloodFrenzy.duration > 0) {
          petDamage = Math.floor(petDamage * (1 + gameState.battle.petBuffs.bloodFrenzy.attackBonus / 100))
          bloodFrenzyLifesteal = gameState.battle.petBuffs.bloodFrenzy.lifestealBonus
        }

        // 应用诅咒效果（增加怪物受到的伤害）
        if (petTarget.debuffs && petTarget.debuffs.curse) {
          const curseBonus = petTarget.debuffs.curse.value / 100
          petDamage = Math.floor(petDamage * (1 + curseBonus))
        }

        // 战场嗅觉：对50%血以下敌人额外伤害
        if (petPassive.battleInstinct && petTarget.currentHp < petTarget.hp * 0.5) {
          petDamage = Math.floor(petDamage * (1 + petPassive.battleInstinct.lowHpDamageBonus / 100))
        }

        // 计算被动吸血总量（被动技能+血之狂欢buff）
        let totalPetLifesteal = petPassive.lifesteal + bloodFrenzyLifesteal

        // 处理技能效果
        if (petUseSkill) {
          const skillEffect = petUseSkill.effect
          let skillHandled = false

          // 治疗主人
          if (skillEffect === 'healOwner') {
            const baseHeal = Math.floor(stats.maxHp * petUseSkill.effectValue / 100)
            const healAmount = calculateEffectiveHeal(baseHeal)
            if (healAmount > 0) {
              gameState.battle.playerCurrentHp = Math.min(stats.maxHp, gameState.battle.playerCurrentHp + healAmount)
              addBattleLog(`💚 宠物【${activePet.name}】使用【${petUseSkill.name}】，治疗主人 ${healAmount} 点生命`, 'heal')
            }
            skillHandled = true
          }
          // 主人闪避buff
          else if (skillEffect === 'ownerDodgeBuff') {
            gameState.battle.playerBuffs.dodgeBuff = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`🛡️ 宠物【${activePet.name}】使用【${petUseSkill.name}】，主人闪避+${petUseSkill.effectValue}%`, 'buff')
            skillHandled = true
          }
          // 主人护盾
          else if (skillEffect === 'ownerShield') {
            const shieldAmount = Math.floor(petStats.maxHp * petUseSkill.effectValue / 100)
            gameState.battle.playerBuffs.shield = { value: shieldAmount, duration: 3 }
            addBattleLog(`🛡️ 宠物【${activePet.name}】使用【${petUseSkill.name}】，为主人生成 ${shieldAmount} 点护盾`, 'buff')
            skillHandled = true
          }
          // 主人暴击buff
          else if (skillEffect === 'ownerCritBuff') {
            gameState.battle.playerBuffs.critBuff = { value: petUseSkill.critRateBonus, duration: petUseSkill.effectDuration }
            gameState.battle.playerBuffs.critDamageBuff = { value: petUseSkill.critDamageBonus, duration: petUseSkill.effectDuration }
            addBattleLog(`✨ 宠物【${activePet.name}】使用【${petUseSkill.name}】，主人暴击+${petUseSkill.critRateBonus}%，暴伤+${petUseSkill.critDamageBonus}%`, 'buff')
            skillHandled = true
          }
          // 超级赛亚人（宠物自身buff）
          else if (skillEffect === 'superSaiyan') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.saiyan = {
              attackBonus: petUseSkill.attackBonus,
              critRateBonus: petUseSkill.critRateBonus,
              defensePenalty: petUseSkill.defensePenalty,
              duration: petUseSkill.effectDuration
            }
            addBattleLog(`⚡ 宠物【${activePet.name}】使用【${petUseSkill.name}】，攻击+${petUseSkill.attackBonus}%，暴击+${petUseSkill.critRateBonus}%，防御-${petUseSkill.defensePenalty}%`, 'buff')
            skillHandled = true
          }
          // 神·超级赛亚人（宠物自身强化buff）
          else if (skillEffect === 'godSaiyan') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.saiyan = {
              attackBonus: petUseSkill.attackBonus,
              critRateBonus: petUseSkill.critRateBonus,
              defensePenalty: petUseSkill.defensePenalty,
              duration: petUseSkill.effectDuration
            }
            addBattleLog(`💥 宠物【${activePet.name}】使用【${petUseSkill.name}】，攻击+${petUseSkill.attackBonus}%，暴击+${petUseSkill.critRateBonus}%，防御-${petUseSkill.defensePenalty}%`, 'buff')
            skillHandled = true
          }
          // 虚弱debuff（减少敌人攻击）
          else if (skillEffect === 'weaken') {
            if (!petTarget.debuffs) petTarget.debuffs = {}
            petTarget.debuffs.weaken = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`💫 宠物【${activePet.name}】使用【${petUseSkill.name}】，${getMonsterNameWithStatus(petTarget)} 攻击力-${petUseSkill.effectValue}%`, 'debuff')
            skillHandled = true
          }
          // 诅咒（增加敌人受到的伤害）
          else if (skillEffect === 'curse') {
            if (!petTarget.debuffs) petTarget.debuffs = {}
            petTarget.debuffs.curse = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`💀 宠物【${activePet.name}】使用【${petUseSkill.name}】，${getMonsterNameWithStatus(petTarget)} 受伤增加${petUseSkill.effectValue}%`, 'debuff')
            skillHandled = true
          }
          // AOE攻击（攻击所有敌人）
          else if (skillEffect === 'aoe') {
            const aoeTargets = aliveForPet
            for (const target of aoeTargets) {
              let aoeDamage = calculateDamage(petStats.attack, target.defense, 0, 0, petCrit, petStats.critDamage)
              aoeDamage = Math.floor(aoeDamage * petSkillDamageMultiplier)
              target.currentHp -= aoeDamage
              // 地狱业火的灼烧效果
              if (petUseSkill.burn) {
                if (!target.debuffs) target.debuffs = {}
                target.debuffs.burn = { value: 5, duration: petUseSkill.burnDuration || 3 }
              }
            }
            addBattleLog(`🔥 宠物【${activePet.name}】使用【${petUseSkill.name}】，对全体敌人造成伤害！`, 'success')
            skillHandled = true
          }
          // 真实伤害（无视防御）
          else if (skillEffect === 'trueDamage') {
            const trueDmg = Math.floor(petStats.attack * petSkillDamageMultiplier * (petCrit ? 1.5 + petStats.critDamage / 100 : 1))
            petTarget.currentHp -= trueDmg
            if (petCrit) {
              addBattleLog(`💥 宠物【${activePet.name}】使用【${petUseSkill.name}】暴击！无视防御造成 ${trueDmg} 真实伤害`, 'critical')
            } else {
              addBattleLog(`⚡ 宠物【${activePet.name}】使用【${petUseSkill.name}】无视防御造成 ${trueDmg} 真实伤害`, 'success')
            }
            skillHandled = true
          }
          // 吸血攻击
          else if (skillEffect === 'lifesteal') {
            petTarget.currentHp -= petDamage
            const healAmt = Math.floor(petDamage * petUseSkill.effectValue / 100)
            activePet.currentHp = Math.min(petStats.maxHp, activePet.currentHp + healAmt)
            if (petCrit) {
              addBattleLog(`💥 宠物【${activePet.name}】使用【${petUseSkill.name}】暴击！造成 ${petDamage} 伤害，回复 ${healAmt} 生命`, 'critical')
            } else {
              addBattleLog(`🩸 宠物【${activePet.name}】使用【${petUseSkill.name}】造成 ${petDamage} 伤害，回复 ${healAmt} 生命`, 'success')
            }
            skillHandled = true
          }
          // 眩晕攻击
          else if (skillEffect === 'stun') {
            petTarget.currentHp -= petDamage
            if (Math.random() * 100 < petUseSkill.effectValue) {
              if (!petTarget.debuffs) petTarget.debuffs = {}
              petTarget.debuffs.stun = { duration: petUseSkill.effectDuration }
              addBattleLog(`⚡ 宠物【${activePet.name}】使用【${petUseSkill.name}】造成 ${petDamage} 伤害，${getMonsterNameWithStatus(petTarget)} 被眩晕！`, 'success')
            } else {
              addBattleLog(`✨ 宠物【${activePet.name}】使用【${petUseSkill.name}】造成 ${petDamage} 伤害`, 'success')
            }
            skillHandled = true
          }
          // 混沌攻击（随机负面效果）
          else if (skillEffect === 'chaos') {
            petTarget.currentHp -= petDamage
            if (!petTarget.debuffs) petTarget.debuffs = {}
            const chaosEffects = ['bleed', 'poison', 'burn', 'weaken']
            const randomEffect = chaosEffects[Math.floor(Math.random() * chaosEffects.length)]
            petTarget.debuffs[randomEffect] = { value: 10, duration: 3 }
            addBattleLog(`🌀 宠物【${activePet.name}】使用【${petUseSkill.name}】造成 ${petDamage} 伤害，附加${randomEffect === 'bleed' ? '流血' : randomEffect === 'poison' ? '中毒' : randomEffect === 'burn' ? '灼烧' : '虚弱'}效果！`, 'success')
            skillHandled = true
          }
          // 魅惑（眩晕效果）
          else if (skillEffect === 'charm') {
            if (Math.random() * 100 < petUseSkill.effectValue) {
              if (!petTarget.debuffs) petTarget.debuffs = {}
              petTarget.debuffs.stun = { duration: petUseSkill.effectDuration }
              addBattleLog(`💕 宠物【${activePet.name}】使用【${petUseSkill.name}】，${getMonsterNameWithStatus(petTarget)} 被魅惑了 ${petUseSkill.effectDuration} 回合！`, 'debuff')
            } else {
              addBattleLog(`💕 宠物【${activePet.name}】使用【${petUseSkill.name}】，但魅惑失败了`, 'info')
            }
            skillHandled = true
          }
          // 幻影分身（宠物闪避buff）
          else if (skillEffect === 'superDodge') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.superDodge = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`👻 宠物【${activePet.name}】使用【${petUseSkill.name}】，闪避率+${petUseSkill.effectValue}%`, 'buff')
            skillHandled = true
          }
          // 狼嚎（主人攻击buff）
          else if (skillEffect === 'ownerAttackBuff') {
            gameState.battle.playerBuffs.attackBuff = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`🐺 宠物【${activePet.name}】使用【${petUseSkill.name}】，主人攻击力+${petUseSkill.effectValue}%`, 'buff')
            skillHandled = true
          }
          // 致命剧毒
          else if (skillEffect === 'deadlyPoison') {
            if (!petTarget.debuffs) petTarget.debuffs = {}
            petTarget.debuffs.poison = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration, isDeadly: true }
            addBattleLog(`☠️ 宠物【${activePet.name}】使用【${petUseSkill.name}】，${getMonsterNameWithStatus(petTarget)} 中了剧毒！`, 'debuff')
            skillHandled = true
          }
          // 嘲讽（敌人只能攻击宠物）
          else if (skillEffect === 'taunt') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.taunt = { duration: petUseSkill.effectDuration }
            addBattleLog(`😤 宠物【${activePet.name}】使用【${petUseSkill.name}】，嘲讽敌人 ${petUseSkill.effectDuration} 回合！`, 'buff')
            skillHandled = true
          }
          // 血之狂欢（攻击+吸血buff）
          else if (skillEffect === 'bloodFrenzy') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.bloodFrenzy = {
              attackBonus: petUseSkill.attackBonus,
              lifestealBonus: petUseSkill.lifestealBonus,
              duration: petUseSkill.effectDuration
            }
            addBattleLog(`🩸 宠物【${activePet.name}】使用【${petUseSkill.name}】，进入狂暴状态！攻击+${petUseSkill.attackBonus}%，吸血${petUseSkill.lifestealBonus}%`, 'buff')
            skillHandled = true
          }
          // 龙威（敌人攻击降低）
          else if (skillEffect === 'dragonMight') {
            for (const target of aliveForPet) {
              if (!target.debuffs) target.debuffs = {}
              target.debuffs.weaken = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            }
            addBattleLog(`🐲 宠物【${activePet.name}】使用【${petUseSkill.name}】，所有敌人攻击力-${petUseSkill.effectValue}%`, 'debuff')
            skillHandled = true
          }
          // 闪电链（AOE+眩晕几率）
          else if (skillEffect === 'chainLightning') {
            for (const target of aliveForPet) {
              let aoeDamage = calculateDamage(petStats.attack, target.defense, 0, 0, petCrit, petStats.critDamage)
              aoeDamage = Math.floor(aoeDamage * petSkillDamageMultiplier)
              target.currentHp -= aoeDamage
              if (Math.random() * 100 < petUseSkill.stunChance) {
                if (!target.debuffs) target.debuffs = {}
                target.debuffs.stun = { duration: 1 }
              }
            }
            addBattleLog(`⚡ 宠物【${activePet.name}】使用【${petUseSkill.name}】，闪电链击中所有敌人！`, 'success')
            skillHandled = true
          }
          // 灵魂吞噬（真实伤害+回复）
          else if (skillEffect === 'soulDevour') {
            const trueDmg = Math.floor(petStats.attack * petSkillDamageMultiplier * (petCrit ? 1.5 + petStats.critDamage / 100 : 1))
            petTarget.currentHp -= trueDmg
            activePet.currentHp = Math.min(petStats.maxHp, activePet.currentHp + trueDmg)
            addBattleLog(`👻 宠物【${activePet.name}】使用【${petUseSkill.name}】，造成 ${trueDmg} 真实伤害并回复等量生命`, 'success')
            skillHandled = true
          }
          // 烈焰之躯（反伤buff）
          else if (skillEffect === 'flameBody') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.flameBody = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`🔥 宠物【${activePet.name}】使用【${petUseSkill.name}】，${petUseSkill.effectDuration}回合内反弹${petUseSkill.effectValue}%伤害`, 'buff')
            skillHandled = true
          }
          // 虚空黑洞（AOE+降防）
          else if (skillEffect === 'voidBlackHole') {
            for (const target of aliveForPet) {
              let aoeDamage = calculateDamage(petStats.attack, target.defense, 0, 0, petCrit, petStats.critDamage)
              aoeDamage = Math.floor(aoeDamage * petSkillDamageMultiplier)
              target.currentHp -= aoeDamage
              if (!target.debuffs) target.debuffs = {}
              target.debuffs.defenseDown = { value: petUseSkill.defenseReduction, duration: petUseSkill.effectDuration }
            }
            addBattleLog(`🌀 宠物【${activePet.name}】使用【${petUseSkill.name}】，黑洞吞噬所有敌人，防御-${petUseSkill.defenseReduction}%`, 'success')
            skillHandled = true
          }
          // 星陨（纯AOE伤害）
          else if (skillEffect === 'starfall') {
            for (const target of aliveForPet) {
              let aoeDamage = calculateDamage(petStats.attack, target.defense, 0, 0, petCrit, petStats.critDamage)
              aoeDamage = Math.floor(aoeDamage * petSkillDamageMultiplier)
              target.currentHp -= aoeDamage
            }
            addBattleLog(`⭐ 宠物【${activePet.name}】使用【${petUseSkill.name}】，星辰坠落！`, 'success')
            skillHandled = true
          }
          // 多段打击（惊虎吞狗掌等）
          else if (skillEffect === 'multiStrike') {
            const minHit = petUseSkill.minHitCount || 1
            const maxHit = petUseSkill.maxHitCount || 3
            const hitCount = Math.floor(Math.random() * (maxHit - minHit + 1)) + minHit
            addBattleLog(`👊 宠物【${activePet.name}】使用【${petUseSkill.name}】，发动 ${hitCount} 连击！`, 'success')
            let totalDamage = 0
            for (let i = 0; i < hitCount; i++) {
              const hitCrit = Math.random() * 100 < petStats.critRate
              let hitDamage = calculateDamage(petStats.attack, petTarget.defense, 0, 0, hitCrit, petStats.critDamage)
              hitDamage = Math.floor(hitDamage * petSkillDamageMultiplier)
              petTarget.currentHp -= hitDamage
              totalDamage += hitDamage
              if (hitCrit) {
                addBattleLog(`  💥 第${i + 1}击暴击！造成 ${hitDamage} 伤害`, 'critical')
              } else {
                addBattleLog(`  ✊ 第${i + 1}击造成 ${hitDamage} 伤害`, 'normal')
              }
            }
            addBattleLog(`👊 连击结束，共造成 ${totalDamage} 伤害！`, 'success')
            skillHandled = true
          }
          // 混沌领域（群体随机debuff）
          else if (skillEffect === 'chaosDomain') {
            const chaosDebuffs = ['weaken', 'defenseDown', 'poison', 'bleed']
            for (const target of aliveForPet) {
              if (!target.debuffs) target.debuffs = {}
              const randomDebuff = chaosDebuffs[Math.floor(Math.random() * chaosDebuffs.length)]
              target.debuffs[randomDebuff] = { value: 30, duration: petUseSkill.effectDuration }
            }
            addBattleLog(`🌀 宠物【${activePet.name}】使用【${petUseSkill.name}】，展开混沌领域！`, 'debuff')
            skillHandled = true
          }
          // 末日审判（AOE+所有debuff）
          else if (skillEffect === 'doomsday') {
            for (const target of aliveForPet) {
              let aoeDamage = calculateDamage(petStats.attack, target.defense, 0, 0, petCrit, petStats.critDamage)
              aoeDamage = Math.floor(aoeDamage * petSkillDamageMultiplier)
              target.currentHp -= aoeDamage
              if (!target.debuffs) target.debuffs = {}
              target.debuffs.bleed = { value: 10, duration: 3 }
              target.debuffs.poison = { value: 10, duration: 3 }
              target.debuffs.burn = { value: 10, duration: 3 }
              target.debuffs.weaken = { value: 30, duration: 3 }
              target.debuffs.curse = { value: 30, duration: 3 }
            }
            addBattleLog(`💀 宠物【${activePet.name}】使用【${petUseSkill.name}】，末日降临！`, 'success')
            skillHandled = true
          }
          // 战魂冲击（血越低伤害越高）
          else if (skillEffect === 'berserker') {
            const hpPercent = activePet.currentHp / petStats.maxHp
            const berserkBonus = 1 + (1 - hpPercent)
            const berserkDamage = Math.floor(petDamage * berserkBonus)
            petTarget.currentHp -= berserkDamage
            addBattleLog(`💢 宠物【${activePet.name}】使用【${petUseSkill.name}】，狂暴造成 ${berserkDamage} 伤害`, 'success')
            skillHandled = true
          }
          // 破甲攻击（无视部分防御）
          else if (skillEffect === 'armorPierce') {
            const pierceDmg = calculateDamage(petStats.attack, petTarget.defense, petUseSkill.penetration || 50, 0, petCrit, petStats.critDamage)
            const finalDmg = Math.floor(pierceDmg * petSkillDamageMultiplier)
            petTarget.currentHp -= finalDmg
            addBattleLog(`🗡️ 宠物【${activePet.name}】使用【${petUseSkill.name}】，无视${petUseSkill.penetration || 50}%防御造成 ${finalDmg} 伤害`, 'success')
            skillHandled = true
          }
          // 阎罗审判（敌人受伤增加）
          else if (skillEffect === 'judgement') {
            if (!petTarget.debuffs) petTarget.debuffs = {}
            petTarget.debuffs.curse = { value: petUseSkill.effectValue, duration: petUseSkill.effectDuration }
            addBattleLog(`⚖️ 宠物【${activePet.name}】使用【${petUseSkill.name}】，${getMonsterNameWithStatus(petTarget)} 受到的伤害+${petUseSkill.effectValue}%`, 'debuff')
            skillHandled = true
          }
          // 治疗净化（清除debuff+治疗主人）
          else if (skillEffect === 'healAndPurify') {
            // 先清除负面效果
            gameState.battle.playerDebuffs = {}
            // 然后治疗（因为debuff已清除，所以可以正常治疗）
            const healAmount = Math.floor(stats.maxHp * petUseSkill.healValue / 100)
            gameState.battle.playerCurrentHp = Math.min(stats.maxHp, gameState.battle.playerCurrentHp + healAmount)
            addBattleLog(`✨ 宠物【${activePet.name}】使用【${petUseSkill.name}】，净化负面效果并治疗主人 ${healAmount}`, 'heal')
            skillHandled = true
          }
          // 群体魅惑
          else if (skillEffect === 'massCharm') {
            let charmedCount = 0
            for (const target of aliveForPet) {
              if (Math.random() * 100 < petUseSkill.effectValue) {
                if (!target.debuffs) target.debuffs = {}
                target.debuffs.stun = { duration: petUseSkill.effectDuration }
                charmedCount++
              }
            }
            addBattleLog(`💕 宠物【${activePet.name}】使用【${petUseSkill.name}】，魅惑了 ${charmedCount} 个敌人`, 'debuff')
            skillHandled = true
          }
          // 妖皇威压（群体减攻防）
          else if (skillEffect === 'royalPressure') {
            for (const target of aliveForPet) {
              if (!target.debuffs) target.debuffs = {}
              target.debuffs.weaken = { value: petUseSkill.attackReduction, duration: petUseSkill.effectDuration }
              target.debuffs.defenseDown = { value: petUseSkill.defenseReduction, duration: petUseSkill.effectDuration }
            }
            addBattleLog(`👑 宠物【${activePet.name}】使用【${petUseSkill.name}】，所有敌人攻防-${petUseSkill.attackReduction}%`, 'debuff')
            skillHandled = true
          }
          // 金刚不坏（宠物减伤buff）
          else if (skillEffect === 'ironBody') {
            if (!gameState.battle.petBuffs) gameState.battle.petBuffs = {}
            gameState.battle.petBuffs.ironBody = { value: petUseSkill.damageReduction, duration: petUseSkill.effectDuration }
            addBattleLog(`🛡️ 宠物【${activePet.name}】使用【${petUseSkill.name}】，受到伤害-${petUseSkill.damageReduction}%`, 'buff')
            skillHandled = true
          }
          // 群体眩晕
          else if (skillEffect === 'aoeStun') {
            for (const target of aliveForPet) {
              let aoeDamage = calculateDamage(petStats.attack, target.defense, 0, 0, petCrit, petStats.critDamage)
              aoeDamage = Math.floor(aoeDamage * petSkillDamageMultiplier)
              target.currentHp -= aoeDamage
              if (!target.debuffs) target.debuffs = {}
              target.debuffs.stun = { duration: petUseSkill.stunDuration || 1 }
            }
            addBattleLog(`⚡ 宠物【${activePet.name}】使用【${petUseSkill.name}】，雷霆轰击所有敌人并眩晕！`, 'success')
            skillHandled = true
          }
          // 鸿蒙之力（混沌伤害+随机效果）
          else if (skillEffect === 'primordialChaos') {
            petTarget.currentHp -= petDamage
            if (!petTarget.debuffs) petTarget.debuffs = {}
            const effects = ['bleed', 'poison', 'burn', 'weaken', 'curse', 'stun']
            const count = Math.floor(Math.random() * 3) + 2
            for (let i = 0; i < count; i++) {
              const effect = effects[Math.floor(Math.random() * effects.length)]
              if (effect === 'stun') {
                petTarget.debuffs[effect] = { duration: 1 }
              } else {
                petTarget.debuffs[effect] = { value: 20, duration: 3 }
              }
            }
            addBattleLog(`🌌 宠物【${activePet.name}】使用【${petUseSkill.name}】，鸿蒙之力爆发！`, 'success')
            skillHandled = true
          }
          // 亡灵召唤（多段攻击）
          else if (skillEffect === 'summon') {
            const hits = petUseSkill.hitCount || 3
            let totalDmg = 0
            for (let i = 0; i < hits; i++) {
              let hitDmg = calculateDamage(petStats.attack, petTarget.defense, 0, 0, petCrit, petStats.critDamage)
              hitDmg = Math.floor(hitDmg * petSkillDamageMultiplier)
              petTarget.currentHp -= hitDmg
              totalDmg += hitDmg
            }
            addBattleLog(`👻 宠物【${activePet.name}】使用【${petUseSkill.name}】，亡灵攻击 ${hits} 次，共造成 ${totalDmg} 伤害`, 'success')
            skillHandled = true
          }
          // 其他攻击类技能（有伤害倍率的）
          else if (petSkillDamageMultiplier > 1) {
            petTarget.currentHp -= petDamage
            // 处理持续伤害效果
            if (skillEffect === 'bleed' || skillEffect === 'poison' || skillEffect === 'burn') {
              if (!petTarget.debuffs) petTarget.debuffs = {}
              petTarget.debuffs[skillEffect] = {
                value: petUseSkill.effectValue,
                duration: petUseSkill.effectDuration,
                source: 'pet'
              }
            }
            if (petCrit) {
              addBattleLog(`💥 宠物【${activePet.name}】使用【${petUseSkill.name}】暴击！对 ${getMonsterNameWithStatus(petTarget)} 造成 ${petDamage} 伤害`, 'critical')
            } else {
              addBattleLog(`✨ 宠物【${activePet.name}】使用【${petUseSkill.name}】对 ${getMonsterNameWithStatus(petTarget)} 造成 ${petDamage} 伤害`, 'success')
            }
            skillHandled = true
          }

          // 如果技能没有被处理，做普通攻击
          if (!skillHandled) {
            petTarget.currentHp -= petDamage
            addBattleLog(`🐾 宠物【${activePet.name}】对 ${getMonsterNameWithStatus(petTarget)} 造成 ${petDamage} 伤害`, 'success')
          }
        } else {
          // 普通攻击
          petTarget.currentHp -= petDamage
          if (petCrit) {
            addBattleLog(`💥 宠物【${activePet.name}】暴击！对 ${getMonsterNameWithStatus(petTarget)} 造成 ${petDamage} 伤害`, 'critical')
          } else {
            addBattleLog(`🐾 宠物【${activePet.name}】对 ${getMonsterNameWithStatus(petTarget)} 造成 ${petDamage} 伤害`, 'success')
          }
        }

        // 宠物吸血效果（被动吸血+血之狂欢）
        if (totalPetLifesteal > 0 && petDamage > 0) {
          const petLifestealHeal = Math.floor(petDamage * totalPetLifesteal / 100)
          activePet.currentHp = Math.min(petStats.maxHp, activePet.currentHp + petLifestealHeal)
          addBattleLog(`🩸 宠物吸血 ${petLifestealHeal} 生命`, 'heal')
        }

        // 连击效果：有几率额外攻击
        if (petPassive.multiHit && petTarget.currentHp > 0 && Math.random() * 100 < petPassive.multiHit.chance) {
          const extraHits = Math.floor(Math.random() * (petPassive.multiHit.maxHits - petPassive.multiHit.minHits + 1)) + petPassive.multiHit.minHits - 1
          let totalExtraDamage = 0
          for (let i = 0; i < extraHits; i++) {
            if (petTarget.currentHp <= 0) break
            const extraDmg = calculateDamage(petStats.attack, petTarget.defense, 0, 0, false, petStats.critDamage)
            petTarget.currentHp -= extraDmg
            totalExtraDamage += extraDmg
          }
          if (totalExtraDamage > 0) {
            addBattleLog(`⚡ 宠物【${activePet.name}】触发连击！额外造成 ${totalExtraDamage} 伤害`, 'success')
          }
        }

        // 检查怪物死亡
        if (petTarget.currentHp <= 0) {
          petTarget.currentHp = 0
          gameState.battle.killCount++

          // 奖励（应用经验和金币倍率）
          const petExpGain = petTarget.exp * gameState.devExpMultiplier
          const petGoldGain = petTarget.gold * gameState.devGoldMultiplier
          gameState.player.exp += petExpGain
          gameState.player.realmExp += Math.floor(petExpGain / 4)
          gameState.player.gold += petGoldGain

          // 更新战斗统计
          if (gameState.battle.battleStats) {
            gameState.battle.battleStats.totalExp += petExpGain
            gameState.battle.battleStats.totalGold += petGoldGain
            gameState.battle.battleStats.totalKills++
          }

          // 宠物获得经验（应用倍率）
          addPetExp(activePet.id, Math.floor(petExpGain / 3))

          addBattleLog(`宠物击败 ${getMonsterNameWithStatus(petTarget)}！+${petExpGain}经验 +${petGoldGain}灵石`, 'success')

          checkLevelUp()
          checkRealmBreakthrough()

          // 检查是否全部怪物都死亡
          const remainingAfterPet = monsters.filter(m => m.currentHp > 0)
          if (remainingAfterPet.length === 0) {
            gameState.battle.isInBattle = false
            if (gameState.battle.isTowerMode) {
              towerFloorCleared()
            }
            return 'win'
          }
        }
      } else {
        addBattleLog(`💨 宠物【${activePet.name}】的攻击被闪避！`, 'normal')
      }
    }
  }

  // 更新宠物技能冷却
  if (gameState.battle.petSkillCooldowns) {
    for (const skillId in gameState.battle.petSkillCooldowns) {
      if (gameState.battle.petSkillCooldowns[skillId] > 0) {
        gameState.battle.petSkillCooldowns[skillId]--
      }
    }
  }

  // 更新宠物buff持续时间
  if (gameState.battle.petBuffs) {
    for (const buffKey of Object.keys(gameState.battle.petBuffs)) {
      if (gameState.battle.petBuffs[buffKey].duration > 0) {
        gameState.battle.petBuffs[buffKey].duration--
        if (gameState.battle.petBuffs[buffKey].duration <= 0) {
          Vue.delete(gameState.battle.petBuffs, buffKey)
        }
      }
    }
  }

  // 所有存活怪物攻击
  const currentAliveMonsters = monsters.filter(m => m.currentHp > 0)
  const petForDefense = getActivePet()

  for (const monster of currentAliveMonsters) {
    // 玩家和宠物都死亡时才跳出循环
    if (shouldLoseBattle()) break

    // 检查眩晕状态
    if (monster.debuffs && monster.debuffs.stun && monster.debuffs.stun.duration > 0) {
      addBattleLog(`💫 ${getMonsterNameWithStatus(monster)} 处于眩晕状态，无法行动！`, 'info')
      continue
    }

    // 检查冰冻状态
    if (monster.debuffs && monster.debuffs.freeze && monster.debuffs.freeze.duration > 0) {
      addBattleLog(`❄️ ${getMonsterNameWithStatus(monster)} 被冰冻，无法行动！`, 'info')
      continue
    }

    // 检查是否使用技能
    let monsterUseSkill = null
    let skillDamageMultiplier = 1

    if (monster.skills.length > 0 && Math.random() < 0.3) { // 30%几率使用技能
      const attackSkills = monster.skills.filter(s => s.type === 'attack')
      const buffSkills = monster.skills.filter(s => s.type === 'buff')
      const debuffSkills = monster.skills.filter(s => s.type === 'debuff')

      if (attackSkills.length > 0 && Math.random() < 0.6) {
        monsterUseSkill = attackSkills[Math.floor(Math.random() * attackSkills.length)]
        skillDamageMultiplier = monsterUseSkill.multiplier
      } else if (debuffSkills.length > 0 && Math.random() < 0.5) {
        // 50%几率使用debuff技能（对玩家施加负面效果）
        monsterUseSkill = debuffSkills[Math.floor(Math.random() * debuffSkills.length)]
        // 应用debuff到玩家
        if (!gameState.battle.playerDebuffs) {
          gameState.battle.playerDebuffs = {}
        }
        const debuffEffect = monsterUseSkill.effect
        const debuffDuration = monsterUseSkill.duration || 3
        const debuffValue = monsterUseSkill.value || 0
        gameState.battle.playerDebuffs[debuffEffect] = {
          value: debuffValue,
          duration: debuffDuration
        }
        addBattleLog(`😈 ${getMonsterNameWithStatus(monster)} 使用【${monsterUseSkill.name}】！${monsterUseSkill.description}`, 'danger')
        continue // debuff技能不攻击
      } else if (buffSkills.length > 0) {
        monsterUseSkill = buffSkills[Math.floor(Math.random() * buffSkills.length)]
        // 应用buff
        if (monsterUseSkill.stat === 'lifesteal') {
          monster.buffs.lifesteal = monsterUseSkill.value
        } else {
          monster.buffs[monsterUseSkill.stat] = monsterUseSkill.value
        }
        addBattleLog(`${getMonsterNameWithStatus(monster)} 使用【${monsterUseSkill.name}】！${monsterUseSkill.description}`, 'warning')
        continue // buff技能不攻击
      }
    }

    // 决定攻击目标：玩家死亡时只能攻击宠物；宠物有嘲讽时100%攻击宠物；否则50%概率攻击宠物
    const hasTaunt = gameState.battle.petBuffs && gameState.battle.petBuffs.taunt && gameState.battle.petBuffs.taunt.duration > 0
    const playerDead = gameState.battle.playerCurrentHp <= 0
    const petCanBeAttacked = petForDefense && petForDefense.currentHp > 0
    const attackPet = petCanBeAttacked && (playerDead || hasTaunt || Math.random() < 0.5)

    // 计算有效攻击力（考虑buff和虚弱debuff）
    let effectiveAttack = monster.buffs.attack ? monster.attack * (1 + monster.buffs.attack / 100) : monster.attack
    if (monster.debuffs && monster.debuffs.weaken) {
      effectiveAttack = effectiveAttack * (1 - monster.debuffs.weaken.value / 100)
    }

    if (attackPet) {
      // 攻击宠物
      const petStats = getPetStats(petForDefense)
      const monsterHitRoll = Math.random() * 100

      // 计算宠物闪避（加上幻影分身buff）
      let petDodge = petStats.dodge
      if (gameState.battle.petBuffs && gameState.battle.petBuffs.superDodge) {
        petDodge += gameState.battle.petBuffs.superDodge.value
      }

      // 怪物命中率 = 怪物命中 - 宠物闪避
      const monsterHit = monster.hit || 85
      const effectiveHitRate = Math.max(5, monsterHit - petDodge) // 最低5%命中率

      if (monsterHitRoll < effectiveHitRate) {
        const monsterCritRoll = Math.random() * 100
        // 使用怪物自身的暴击率
        const baseCritRate = monster.critRate || 0
        const effectiveCritRate = monster.buffs.critRate ? baseCritRate + monster.buffs.critRate : baseCritRate
        const monsterCrit = monsterCritRoll < effectiveCritRate

        // 使用怪物的穿透属性
        const monsterPenetration = monster.penetration || 0
        let monsterDamage = calculateDamage(
          effectiveAttack,
          petStats.defense,
          monsterPenetration,
          0,
          monsterCrit,
          50
        )
        monsterDamage = Math.floor(monsterDamage * skillDamageMultiplier)

        // 金刚不坏减伤
        if (gameState.battle.petBuffs && gameState.battle.petBuffs.ironBody && gameState.battle.petBuffs.ironBody.duration > 0) {
          monsterDamage = Math.floor(monsterDamage * (1 - gameState.battle.petBuffs.ironBody.value / 100))
        }

        petForDefense.currentHp -= monsterDamage

        // 烈焰之躯反伤（真实伤害）
        if (gameState.battle.petBuffs && gameState.battle.petBuffs.flameBody && gameState.battle.petBuffs.flameBody.duration > 0) {
          const reflectDmg = Math.floor(monsterDamage * gameState.battle.petBuffs.flameBody.value / 100)
          monster.currentHp -= reflectDmg
          addBattleLog(`🔥 烈焰之躯反弹 ${reflectDmg} 伤害给 ${getMonsterNameWithStatus(monster)}`, 'success')
        }

        // 怪物吸血效果
        const totalLifesteal = (monster.lifesteal || 0) + (monster.buffs.lifesteal || 0)
        if (totalLifesteal > 0 && monsterDamage > 0) {
          const healAmount = Math.floor(monsterDamage * totalLifesteal / 100)
          monster.currentHp = Math.min(monster.hp, monster.currentHp + healAmount)
        }

        if (monsterUseSkill && monsterUseSkill.type === 'attack') {
          if (monsterCrit) {
            addBattleLog(`💥 ${getMonsterNameWithStatus(monster)}【${monsterUseSkill.name}】暴击！对宠物造成 ${monsterDamage} 伤害`, 'critical')
          } else {
            addBattleLog(`${getMonsterNameWithStatus(monster)} 使用【${monsterUseSkill.name}】对宠物造成 ${monsterDamage} 伤害`, 'warning')
          }
        } else {
          if (monsterCrit) {
            addBattleLog(`💥 ${getMonsterNameWithStatus(monster)} 暴击！对宠物【${petForDefense.name}】造成 ${monsterDamage} 伤害`, 'critical')
          } else {
            addBattleLog(`${getMonsterNameWithStatus(monster)} 对宠物【${petForDefense.name}】造成 ${monsterDamage} 伤害`, 'warning')
          }
        }

        if (petForDefense.currentHp <= 0) {
          // 检查浴火重生技能
          let revived = false
          if (petForDefense.skills && !petForDefense.phoenixUsed) {
            for (const skillId of petForDefense.skills) {
              const skill = getSkillById(skillId)
              if (skill && skill.effect === 'phoenixRebirth') {
                if (Math.random() * 100 < skill.reviveChance) {
                  const petStats = getPetStats(petForDefense)
                  petForDefense.currentHp = Math.floor(petStats.maxHp * skill.effectValue / 100)
                  petForDefense.phoenixUsed = true
                  addBattleLog(`🔥 宠物【${petForDefense.name}】发动【浴火重生】复活，恢复 ${skill.effectValue}% 生命！`, 'success')
                  revived = true
                }
                break
              }
            }
          }
          if (!revived) {
            petForDefense.currentHp = 0
            addBattleLog(`宠物【${petForDefense.name}】倒下了！`, 'danger')
            // 检查是否应该判定战斗失败
            if (shouldLoseBattle()) {
              gameState.battle.isInBattle = false
              stopAutoBattle()
              return 'lose'
            }
          }
        }
      } else {
        addBattleLog(`💨 宠物【${petForDefense.name}】闪避了 ${getMonsterNameWithStatus(monster)} 的攻击！`, 'success')
      }
    } else {
      // 攻击玩家
      const monsterHitRoll = Math.random() * 100
      // 怪物命中率 = 怪物命中 - 玩家闪避
      const monsterHit = monster.hit || 85
      const effectiveHitRate = Math.max(5, monsterHit - stats.dodge) // 最低5%命中率

      if (monsterHitRoll < effectiveHitRate) {
        const monsterCritRoll = Math.random() * 100
        // 使用怪物自身的暴击率
        const baseCritRate = monster.critRate || 0
        const effectiveCritRate = monster.buffs.critRate ? baseCritRate + monster.buffs.critRate : baseCritRate
        const monsterCrit = monsterCritRoll < Math.max(0, effectiveCritRate - stats.critResist)

        // 使用怪物的穿透属性
        const monsterPenetration = monster.penetration || 0

        // 钢铁意志：生命低于30%时防御翻倍
        let effectiveDefense = stats.defense
        if (stats.lowHpDefenseBonus > 0 && gameState.battle.playerCurrentHp < stats.maxHp * 0.3) {
          effectiveDefense = Math.floor(stats.defense * (1 + stats.lowHpDefenseBonus / 100))
        }

        let monsterDamage = calculateDamage(
          effectiveAttack,
          effectiveDefense,
          monsterPenetration,
          0,
          monsterCrit,
          50
        )

        // 应用技能伤害加成
        monsterDamage = Math.floor(monsterDamage * skillDamageMultiplier)

        // 应用伤害减免
        let totalReduction = stats.damageReduction || 0

        // 绝对防御buff
        const absoluteDefense = gameState.battle.playerBuffs.absoluteDefense
        if (absoluteDefense && absoluteDefense.duration > 0) {
          totalReduction += absoluteDefense.value
        }

        if (totalReduction > 0) {
          monsterDamage = Math.floor(monsterDamage * (1 - Math.min(totalReduction, 90) / 100))
        }

        // 格挡天赋：有概率减少50%伤害
        if (stats.blockRate > 0 && Math.random() * 100 < stats.blockRate) {
          monsterDamage = Math.floor(monsterDamage * 0.5)
          addBattleLog(`🤚 格挡！伤害减半`, 'buff')
        }

        // 护盾吸收伤害
        const shield = gameState.battle.playerBuffs.shield
        if (shield && shield.value > 0) {
          if (shield.value >= monsterDamage) {
            shield.value -= monsterDamage
            addBattleLog(`🔰 护盾吸收 ${monsterDamage} 伤害 (剩余${shield.value})`, 'buff')
            monsterDamage = 0
          } else {
            monsterDamage -= shield.value
            addBattleLog(`💥 护盾吸收 ${shield.value} 伤害后破碎！`, 'danger')
            Vue.delete(gameState.battle.playerBuffs, 'shield')
          }
        }

        // 荆棘护甲反伤（真实伤害）
        if (stats.thorns > 0 && monsterDamage > 0) {
          const thornsDamage = Math.floor(monsterDamage * stats.thorns / 100)
          monster.currentHp -= thornsDamage
          addBattleLog(`🌵 荆棘护甲反弹 ${thornsDamage} 伤害`, 'success')
        }

        // 以牙还牙反伤buff（真实伤害）
        const reflectBuff = gameState.battle.playerBuffs.reflect
        if (reflectBuff && reflectBuff.duration > 0 && monsterDamage > 0) {
          const reflectDamage = Math.floor(monsterDamage * reflectBuff.value / 100)
          monster.currentHp -= reflectDamage
          addBattleLog(`🔄 以牙还牙反弹 ${reflectDamage} 伤害`, 'success')
        }

        gameState.battle.playerCurrentHp -= monsterDamage

        // 怪物吸血效果（自身属性 + buff）
        const totalLifesteal = (monster.lifesteal || 0) + (monster.buffs.lifesteal || 0)
        if (totalLifesteal > 0 && monsterDamage > 0) {
          const healAmount = Math.floor(monsterDamage * totalLifesteal / 100)
          monster.currentHp = Math.min(monster.hp, monster.currentHp + healAmount)
          if (healAmount > 0) {
            addBattleLog(`🩸 ${getMonsterNameWithStatus(monster)} 吸血恢复 ${healAmount} 生命`, 'warning')
          }
        }

        // 吸血光环（特殊技能）
        const drainSkill = monster.skills.find(s => s.effect === 'drain')
        if (drainSkill) {
          const healAmount = Math.floor(monsterDamage * drainSkill.value / 100)
          monster.currentHp = Math.min(monster.hp, monster.currentHp + healAmount)
        }

        if (monsterUseSkill && monsterUseSkill.type === 'attack') {
          if (monsterCrit) {
            addBattleLog(`💥 ${getMonsterNameWithStatus(monster)}【${monsterUseSkill.name}】暴击！造成 ${monsterDamage} 伤害`, 'critical')
          } else {
            addBattleLog(`${getMonsterNameWithStatus(monster)} 使用【${monsterUseSkill.name}】造成 ${monsterDamage} 伤害`, 'danger')
          }
        } else {
          if (monsterCrit) {
            addBattleLog(`💥 ${getMonsterNameWithStatus(monster)} 暴击！造成 ${monsterDamage} 伤害`, 'critical')
          } else {
            addBattleLog(`${getMonsterNameWithStatus(monster)} 造成 ${monsterDamage} 伤害`, 'danger')
          }
        }

        if (gameState.battle.playerCurrentHp <= 0) {
          // 因果律：受到致命伤害时反弹伤害（每场战斗1次）
          if (stats.fatalReflect > 0 && !gameState.battle.fatalReflectUsed) {
            gameState.battle.fatalReflectUsed = true
            const fatalReflectDamage = Math.floor(monsterDamage * (100 + stats.fatalReflect) / 100)
            monster.currentHp -= fatalReflectDamage
            gameState.battle.playerCurrentHp = 1
            addBattleLog(`⚖️ 【因果律】触发！反弹 ${fatalReflectDamage} 伤害，保留1点生命`, 'success')
            if (monster.currentHp <= 0) {
              monster.currentHp = 0
              addBattleLog(`${getMonsterNameWithStatus(monster)} 被因果律击杀！`, 'success')
            }
          }
          // 涅槃重生：法宝被动技能，死亡时复活（每场战斗1次）
          else if (stats.revivePercent > 0 && !gameState.battle.artifactReviveUsed) {
            gameState.battle.artifactReviveUsed = true
            const reviveHp = Math.floor(stats.maxHp * stats.revivePercent / 100)
            gameState.battle.playerCurrentHp = reviveHp
            addBattleLog(`🔮 【涅槃重生】触发！复活并恢复 ${reviveHp} 点生命 (${stats.revivePercent}%)`, 'success')
          }
          // 不死战神天赋：有概率复活
          else if (stats.talentReviveChance > 0 && !gameState.battle.talentReviveUsed && Math.random() * 100 < stats.talentReviveChance) {
            gameState.battle.talentReviveUsed = true
            const reviveHp = Math.floor(stats.maxHp * 0.2)
            gameState.battle.playerCurrentHp = reviveHp
            addBattleLog(`👼 【不死战神】触发！复活并恢复 ${reviveHp} 点生命 (20%)`, 'success')
          } else {
            gameState.battle.playerCurrentHp = 0
            addBattleLog(`你被击败了...`, 'danger')
            applyDeathPenalty()
            // 检查宠物是否还能继续战斗
            if (shouldLoseBattle()) {
              result = 'lose'
              gameState.battle.isInBattle = false
              stopAutoBattle()
              return result
            } else {
              addBattleLog(`宠物继续为你战斗！`, 'warning')
            }
          }
        }
      } else {
        addBattleLog(`💨 闪避了 ${getMonsterNameWithStatus(monster)} 的攻击！`, 'success')
        // 暗影突袭天赋：闪避后下次攻击必暴击
        if (stats.shadowStrikeDamage > 0) {
          gameState.battle.shadowStrikeReady = true
          addBattleLog(`🗡️ 暗影突袭就绪！下次攻击必定暴击`, 'buff')
        }
      }
    } // end attackPet else
  } // end monster loop

  return 'continue'
}

// 重置战斗统计
export function resetBattleStats() {
  gameState.battle.battleStats = {
    startTime: Date.now(),
    totalExp: 0,
    totalGold: 0,
    totalKills: 0,
    drops: {
      white: 0,
      green: 0,
      blue: 0,
      purple: 0,
      orange: 0,
      skillBooks: 0,
      materials: {}  // 材料掉落统计 { materialId: count }
    }
  }
}

// 获取战斗统计
export function getBattleStats() {
  const stats = gameState.battle.battleStats
  const elapsed = stats.startTime ? (Date.now() - stats.startTime) / 1000 : 0
  const minutes = elapsed / 60
  return {
    ...stats,
    elapsedSeconds: Math.floor(elapsed),
    expPerMinute: minutes > 0 ? Math.floor(stats.totalExp / minutes) : 0,
    goldPerMinute: minutes > 0 ? Math.floor(stats.totalGold / minutes) : 0,
    killsPerMinute: minutes > 0 ? (stats.totalKills / minutes).toFixed(1) : 0
  }
}

// 防加速检测
let lastBattleTime = 0
let speedHackCount = 0
const BATTLE_INTERVAL = 1000 // 正常间隔1秒
const MIN_INTERVAL = 750 // 最小允许间隔（考虑误差）
const SPEED_HACK_THRESHOLD = 5 // 连续检测到加速的阈值

function checkSpeedHack() {
  const now = performance.now()
  if (lastBattleTime > 0) {
    const elapsed = now - lastBattleTime
    if (elapsed < MIN_INTERVAL) {
      speedHackCount++
      if (speedHackCount >= SPEED_HACK_THRESHOLD) {
        addBattleLog('⚠️ 检测到异常加速，战斗暂停', 'danger')
        stopAutoBattle()
        speedHackCount = 0
        lastBattleTime = 0
        return false
      }
    } else {
      // 正常速度，重置计数
      if (speedHackCount > 0) speedHackCount--
    }
  }
  lastBattleTime = now
  return true
}

// 开始自动战斗
export function startAutoBattle() {
  if (gameState.battle.isAutoBattle) return

  gameState.battle.isAutoBattle = true
  gameState.battle.killCount = 0
  lastBattleTime = 0
  speedHackCount = 0
  resetBattleStats()
  clearBattleLog()
  addBattleLog('开始自动战斗...', 'warning')

  const autoBattleLoop = () => {
    if (!gameState.battle.isAutoBattle) return

    // 防加速检测
    if (!checkSpeedHack()) return

    if (!gameState.battle.isInBattle) {
      startBattle()
    }

    if (gameState.battle.isInBattle) {
      battleRound()
    }

    if (gameState.battle.isAutoBattle) {
      gameState.battle.battleTimer = setTimeout(autoBattleLoop, BATTLE_INTERVAL)
    }
  }

  autoBattleLoop()
}

// 停止自动战斗
export function stopAutoBattle() {
  gameState.battle.isAutoBattle = false
  gameState.battle.isTowerMode = false
  if (gameState.battle.battleTimer) {
    clearTimeout(gameState.battle.battleTimer)
    gameState.battle.battleTimer = null
  }
  addBattleLog('停止自动战斗', 'warning')
}

// 检查是否为开发环境
function isDevEnvironment() {
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

// 保存游戏（加密）
export function saveGame(silent = false) {
  // 数据合理性检查（开发环境跳过）
  if (!isDevEnvironment()) {
    const validation = validatePlayerData(gameState.player)
    if (!validation.valid) {
      console.warn('数据异常:', validation.errors)
      // 如果数据异常，不保存并警告
      if (!silent) {
        addLog('存档失败：检测到数据异常！', 'danger')
      }
      return false
    }
  }

  const saveData = {
    player: gameState.player,
    battle: {
      selectedMapId: gameState.battle.selectedMapId,
      killCount: gameState.battle.killCount,
      towerHighestFloor: gameState.battle.towerHighestFloor
    },
    lootFilter: gameState.lootFilter,
    timestamp: Date.now(),
    version: 8, // 版本号更新
    checksum: calculateChecksum(gameState.player) // 添加校验和
  }
  const encrypted = encrypt(saveData)
  if (encrypted) {
    localStorage.setItem('xiuxianSave', encrypted)
    if (!silent) {
      addLog('游戏已保存', 'success')
    }
    return true
  }
  return false
}

// 自动保存
export function autoSave() {
  saveGame(true) // 静默保存
}

// 加载游戏（解密）
export function loadGame() {
  const save = localStorage.getItem('xiuxianSave')
  if (save) {
    try {
      // 尝试解密
      let data = decrypt(save)

      // 如果解密失败，尝试兼容旧的未加密存档
      if (!data) {
        try {
          data = JSON.parse(save)
        } catch (e) {
          console.error('存档格式无效')
          return false
        }
      }

      // 校验和验证（版本6及以上）
      if (data.version >= 6 && data.checksum) {
        if (!verifyChecksum(data.player, data.checksum)) {
          console.warn('存档校验失败，可能被篡改')
          addLog('存档校验失败，数据可能被篡改！', 'danger')
          return false
        }
      }

      // 兼容旧存档
      if (!data.player.equipment) {
        data.player.equipment = generateStarterEquipment()
      }
      if (!data.player.inventory) {
        data.player.inventory = []
      }
      // 技能系统兼容
      if (!data.player.learnedSkills) {
        data.player.learnedSkills = {}
      }
      if (!data.player.equippedActiveSkills) {
        data.player.equippedActiveSkills = []
      }
      if (!data.player.equippedPassiveSkills) {
        data.player.equippedPassiveSkills = []
      }
      // 兼容旧版本的equippedSkills字段
      if (data.player.equippedSkills && !data.player.equippedActiveSkills.length) {
        data.player.equippedActiveSkills = data.player.equippedSkills.filter(id => {
          const skill = getSkillById(id)
          return skill && skill.type === 'active'
        }).slice(0, 4)
      }
      delete data.player.equippedSkills
      // 移除旧的功法字段
      delete data.player.techniqueId
      delete data.player.ownedTechniques

      // 宠物系统兼容
      if (!data.player.pets) {
        data.player.pets = []
      }
      if (!data.player.activePetId) {
        data.player.activePetId = null
      }
      if (!data.player.petEggClaimedDates) {
        data.player.petEggClaimedDates = {}
      }
      if (!data.player.aptitudePillClaimedDates) {
        data.player.aptitudePillClaimedDates = {}
      }
      // 锁妖塔奖励兼容
      if (data.player.bonusPassiveSlots === undefined) {
        data.player.bonusPassiveSlots = 0
      }
      if (data.player.bonusInventorySlots === undefined) {
        data.player.bonusInventorySlots = 0
      }
      // 兼容旧宠物数据（添加资质和血量）
      if (data.player.pets) {
        for (const pet of data.player.pets) {
          if (pet.aptitude === undefined) {
            pet.aptitude = 5 // 旧宠物默认5资质
          }
          // 重新计算宠物属性
          const petStats = calculatePetStats(pet.level, pet.quality, pet.aptitude)
          pet.baseHp = petStats.baseHp
          pet.baseAttack = petStats.baseAttack
          pet.baseDefense = petStats.baseDefense
          // 初始化currentHp（只在未定义时，保留死亡状态）
          if (pet.currentHp === undefined || pet.currentHp === null) {
            pet.currentHp = pet.baseHp
          }
        }
      }
      // 宠物蛋和资质丹存储兼容
      if (!data.player.petEggs) {
        data.player.petEggs = []
      }
      if (!data.player.aptitudePills) {
        data.player.aptitudePills = []
      }
      // 天赋系统兼容
      if (!data.player.talents) {
        data.player.talents = {}
      }
      // 修炼类型兼容（旧存档默认仙修，如果已经有境界则保持仙修）
      if (!data.player.cultivationType) {
        // 如果已经突破过境界，设为仙修（保持兼容）
        if (data.player.realmId > 1) {
          data.player.cultivationType = 'xian'
        } else {
          data.player.cultivationType = 'none'
        }
      }
      // 迁移背包中的宠物蛋和资质丹到新存储
      if (data.player.inventory) {
        const itemsToRemove = []
        for (let i = 0; i < data.player.inventory.length; i++) {
          const item = data.player.inventory[i]
          if (item.type === 'petEgg') {
            data.player.petEggs.push(item)
            itemsToRemove.push(i)
          } else if (item.type === 'aptitudePill') {
            data.player.aptitudePills.push(item)
            itemsToRemove.push(i)
          }
        }
        // 从后往前删除，避免索引错乱
        for (let i = itemsToRemove.length - 1; i >= 0; i--) {
          data.player.inventory.splice(itemsToRemove[i], 1)
        }
      }

      // 数据合理性验证（开发环境跳过）
      if (!isDevEnvironment()) {
        const validation = validatePlayerData(data.player)
        if (!validation.valid) {
          console.warn('存档数据异常:', validation.errors)
          addLog(`存档数据异常：${validation.errors.join('、')}`, 'danger')
          return false
        }
      }

      Object.assign(gameState.player, data.player)

      // 同步法宝引用（加载后equipment.artifact和craftedArtifacts是独立对象，需要重新建立引用）
      if (gameState.player.equippedCraftedArtifact && gameState.player.craftedArtifacts) {
        const equippedArtifact = gameState.player.craftedArtifacts.find(
          a => a.id === gameState.player.equippedCraftedArtifact
        )
        if (equippedArtifact) {
          gameState.player.equipment.artifact = equippedArtifact
        }
      }

      if (data.battle) {
        gameState.battle.selectedMapId = data.battle.selectedMapId || 1
        gameState.battle.killCount = data.battle.killCount || 0
        gameState.battle.towerHighestFloor = data.battle.towerHighestFloor || 1
      }

      // 拾取筛选设置兼容
      if (data.lootFilter) {
        Object.assign(gameState.lootFilter, data.lootFilter)
      }

      gameState.battle.isInBattle = false
      gameState.battle.isAutoBattle = false
      gameState.battle.isTowerMode = false
      gameState.battle.towerFloor = 1
      gameState.battle.towerStartFloor = 1
      gameState.battle.playerCurrentHp = getPlayerStats().maxHp

      // 补发锁妖塔永久奖励（根据最高层数）
      checkAndGrantTowerRewards()

      addLog('游戏已加载', 'success')
      return true
    } catch (e) {
      console.error('加载存档失败', e)
    }
  }
  return false
}

// 导出存档（返回加密字符串）
export function exportSave() {
  // 数据合理性检查（开发环境跳过）
  if (!isDevEnvironment()) {
    const validation = validatePlayerData(gameState.player)
    if (!validation.valid) {
      console.warn('数据异常，无法导出:', validation.errors)
      return null
    }
  }

  const saveData = {
    player: gameState.player,
    battle: {
      selectedMapId: gameState.battle.selectedMapId,
      killCount: gameState.battle.killCount,
      towerHighestFloor: gameState.battle.towerHighestFloor
    },
    lootFilter: gameState.lootFilter,
    timestamp: Date.now(),
    version: 8,
    checksum: calculateChecksum(gameState.player)
  }
  return encrypt(saveData)
}

// 导入存档（从加密字符串）
export function importSave(encryptedData) {
  try {
    const data = decrypt(encryptedData)
    if (!data || !data.player) {
      addLog('存档数据无效', 'danger')
      return false
    }

    // 校验和验证（版本6及以上）
    if (data.version >= 6 && data.checksum) {
      if (!verifyChecksum(data.player, data.checksum)) {
        addLog('存档校验失败，数据可能被篡改！', 'danger')
        return false
      }
    }

    // 兼容旧存档
    if (!data.player.equipment) {
      data.player.equipment = generateStarterEquipment()
    }
    if (!data.player.inventory) {
      data.player.inventory = []
    }
    // 技能系统兼容
    if (!data.player.learnedSkills) {
      data.player.learnedSkills = {}
    }
    if (!data.player.equippedActiveSkills) {
      data.player.equippedActiveSkills = []
    }
    if (!data.player.equippedPassiveSkills) {
      data.player.equippedPassiveSkills = []
    }
    // 兼容旧版本的equippedSkills字段
    if (data.player.equippedSkills && !data.player.equippedActiveSkills.length) {
      data.player.equippedActiveSkills = data.player.equippedSkills.filter(id => {
        const skill = getSkillById(id)
        return skill && skill.type === 'active'
      }).slice(0, 4)
    }
    delete data.player.equippedSkills
    // 移除旧的功法字段
    delete data.player.techniqueId
    delete data.player.ownedTechniques

    // 宠物系统兼容
    if (!data.player.pets) {
      data.player.pets = []
    }
    if (!data.player.activePetId) {
      data.player.activePetId = null
    }
    if (!data.player.petEggClaimedDates) {
      data.player.petEggClaimedDates = {}
    }
    if (!data.player.aptitudePillClaimedDates) {
      data.player.aptitudePillClaimedDates = {}
    }
    // 锁妖塔奖励兼容
    if (data.player.bonusPassiveSlots === undefined) {
      data.player.bonusPassiveSlots = 0
    }
    if (data.player.bonusInventorySlots === undefined) {
      data.player.bonusInventorySlots = 0
    }
    // 兼容旧宠物数据（添加资质和血量）
    if (data.player.pets) {
      for (const pet of data.player.pets) {
        if (pet.aptitude === undefined) {
          pet.aptitude = 5 // 旧宠物默认5资质
        }
        // 重新计算宠物属性
        const petStats = calculatePetStats(pet.level, pet.quality, pet.aptitude)
        pet.baseHp = petStats.baseHp
        pet.baseAttack = petStats.baseAttack
        pet.baseDefense = petStats.baseDefense
        // 初始化currentHp（只在未定义时，保留死亡状态）
        if (pet.currentHp === undefined || pet.currentHp === null) {
          pet.currentHp = pet.baseHp
        }
      }
    }
    // 宠物蛋和资质丹存储兼容
    if (!data.player.petEggs) {
      data.player.petEggs = []
    }
    if (!data.player.aptitudePills) {
      data.player.aptitudePills = []
    }
    // 天赋系统兼容
    if (!data.player.talents) {
      data.player.talents = {}
    }
    // 迁移背包中的宠物蛋和资质丹到新存储
    if (data.player.inventory) {
      const itemsToRemove = []
      for (let i = 0; i < data.player.inventory.length; i++) {
        const item = data.player.inventory[i]
        if (item.type === 'petEgg') {
          data.player.petEggs.push(item)
          itemsToRemove.push(i)
        } else if (item.type === 'aptitudePill') {
          data.player.aptitudePills.push(item)
          itemsToRemove.push(i)
        }
      }
      // 从后往前删除，避免索引错乱
      for (let i = itemsToRemove.length - 1; i >= 0; i--) {
        data.player.inventory.splice(itemsToRemove[i], 1)
      }
    }

    // 数据合理性验证（开发环境跳过）
    if (!isDevEnvironment()) {
      const validation = validatePlayerData(data.player)
      if (!validation.valid) {
        addLog(`存档数据异常：${validation.errors.join('、')}`, 'danger')
        return false
      }
    }

    Object.assign(gameState.player, data.player)

    // 同步法宝引用（导入后equipment.artifact和craftedArtifacts是独立对象，需要重新建立引用）
    if (gameState.player.equippedCraftedArtifact && gameState.player.craftedArtifacts) {
      const equippedArtifact = gameState.player.craftedArtifacts.find(
        a => a.id === gameState.player.equippedCraftedArtifact
      )
      if (equippedArtifact) {
        gameState.player.equipment.artifact = equippedArtifact
      }
    }

    if (data.battle) {
      gameState.battle.selectedMapId = data.battle.selectedMapId || 1
      gameState.battle.killCount = data.battle.killCount || 0
      gameState.battle.towerHighestFloor = data.battle.towerHighestFloor || 1
    }

    // 拾取筛选设置兼容
    if (data.lootFilter) {
      Object.assign(gameState.lootFilter, data.lootFilter)
    }

    gameState.battle.isInBattle = false
    gameState.battle.isAutoBattle = false
    gameState.battle.isTowerMode = false
    gameState.battle.towerFloor = 1
    gameState.battle.towerStartFloor = 1
    gameState.battle.playerCurrentHp = getPlayerStats().maxHp

    // 保存到本地
    saveGame(true)

    addLog('存档导入成功', 'success')
    return true
  } catch (e) {
    console.error('导入存档失败', e)
    addLog('存档导入失败', 'danger')
    return false
  }
}

// 重置游戏
export function resetGame() {
  stopAutoBattle()

  gameState.player = {
    name: '无名修士',
    level: 1,
    exp: 0,
    realmId: 1,
    realmExp: 0,
    gold: 100,
    learnedSkills: {},
    equippedActiveSkills: [],
    equippedPassiveSkills: [],
    baseHp: 150,
    baseAttack: 15,
    baseDefense: 8,
    critRate: 5,
    critResist: 0,
    critDamage: 50,
    dodge: 3,
    hit: 95,
    penetration: 0,
    skillDamage: 0,
    equipment: generateStarterEquipment(),
    inventory: [],
    // 宠物系统
    pets: [],
    activePetId: null,
    petEggs: [],
    aptitudePills: [],
    petEggClaimedDates: {},
    aptitudePillClaimedDates: {},
    // 锁妖塔奖励
    bonusPassiveSlots: 0,
    bonusInventorySlots: 0
  }

  gameState.battle = {
    isAutoBattle: false,
    isInBattle: false,
    currentMonsters: [],
    currentMonsterIndex: 0,
    playerCurrentHp: 150,
    playerBuffs: {},
    skillCooldowns: {},
    petSkillCooldowns: {},
    roundCount: 0,
    battleLog: [],
    selectedMapId: 1,
    battleTimer: null,
    killCount: 0,
    // 锁妖塔状态
    isTowerMode: false,
    towerFloor: 1,
    towerHighestFloor: 1,
    towerStartFloor: 1
  }

  gameState.lootFilter = {
    enabled: false,
    minQuality: 'white',
    autoSellFiltered: false,
    pickupSkillBooks: true
  }

  gameState.logs = []
  addLog('开始新的修仙之旅！', 'success')
}

// 开发测试：添加测试装备（仅开发环境可用）
export function addTestEquipment() {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('仅开发环境可用')
    return
  }
  const testArtifact = {
    id: 'test_artifact_' + Date.now(),
    name: '测试神器·混沌珠',
    slotType: 'artifact',
    type: 'equipment',
    level: 100,
    requiredLevel: 1,
    quality: 'orange',
    qualityName: '传说',
    qualityColor: '#e67e22',
    icon: '🔮',
    enhanceLevel: 10,
    stats: {
      hp: 100000,
      attack: 10000,
      defense: 10000
    }
  }
  gameState.player.equipment.artifact = testArtifact
  autoSave()
  addLog('测试装备已添加！', 'success')
  console.log('测试法宝已装备！')
}

// 开发测试：切换百倍经验、掉落、金币（仅开发环境可用）
export function toggleExpMultiplier() {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('仅开发环境可用')
    return false
  }
  if (gameState.devExpMultiplier === 1) {
    gameState.devExpMultiplier = 100
    gameState.devDropMultiplier = 100
    gameState.devGoldMultiplier = 100
    addLog('百倍经验+百倍爆率+百倍金币已开启！', 'success')
    console.log('百倍经验+百倍爆率+百倍金币已开启！')
    return true
  } else {
    gameState.devExpMultiplier = 1
    gameState.devDropMultiplier = 1
    gameState.devGoldMultiplier = 1
    addLog('百倍经验+百倍爆率+百倍金币已关闭', 'normal')
    console.log('百倍经验+百倍爆率+百倍金币已关闭')
    return false
  }
}

// 获取当前经验倍率
export function getExpMultiplier() {
  return gameState.devExpMultiplier
}

// 开发测试：添加材料（仅开发环境可用）
export function devAddMaterials(grade = 'all') {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('仅开发环境可用')
    return false
  }

  const materialsToAdd = {
    low: ['mat_spirit_stone', 'mat_iron_essence', 'mat_wood_spirit'],
    mid: ['mat_dark_iron', 'mat_spirit_jade', 'mat_fire_crystal'],
    high: ['mat_meteor_iron', 'mat_dragon_crystal', 'mat_phoenix_feather'],
    super: ['mat_chaos_essence', 'mat_hongmeng_qi']
  }

  if (grade === 'all') {
    for (const g of Object.keys(materialsToAdd)) {
      for (const matId of materialsToAdd[g]) {
        addMaterial(matId, 10)
      }
    }
    addLog('已添加所有材料各10个！', 'success')
    console.log('已添加所有材料各10个！')
  } else if (materialsToAdd[grade]) {
    for (const matId of materialsToAdd[grade]) {
      addMaterial(matId, 10)
    }
    addLog(`已添加${grade}级材料各10个！`, 'success')
    console.log(`已添加${grade}级材料各10个！`)
  } else {
    console.log('无效的材料等级，可选：low, mid, high, super, all')
    return false
  }

  autoSave()
  return true
}

// ==================== 法宝打造系统 ====================

// 添加材料到背包
export function addMaterial(materialId, count = 1) {
  if (!gameState.player.artifactMaterials) {
    gameState.player.artifactMaterials = {}
  }
  if (!gameState.player.artifactMaterials[materialId]) {
    gameState.player.artifactMaterials[materialId] = 0
  }
  gameState.player.artifactMaterials[materialId] += count
  return true
}

// 移除材料
export function removeMaterial(materialId, count = 1) {
  if (!gameState.player.artifactMaterials || !gameState.player.artifactMaterials[materialId]) {
    return false
  }
  if (gameState.player.artifactMaterials[materialId] < count) {
    return false
  }
  gameState.player.artifactMaterials[materialId] -= count
  if (gameState.player.artifactMaterials[materialId] <= 0) {
    Vue.delete(gameState.player.artifactMaterials, materialId)
  }
  return true
}

// 获取材料数量
export function getMaterialCount(materialId) {
  if (!gameState.player.artifactMaterials) return 0
  return gameState.player.artifactMaterials[materialId] || 0
}

// 获取所有材料
export function getAllMaterials() {
  if (!gameState.player.artifactMaterials) return []
  const result = []
  for (const [id, count] of Object.entries(gameState.player.artifactMaterials)) {
    const matData = getMaterialById(id)
    if (matData && count > 0) {
      result.push({ ...matData, count })
    }
  }
  return result
}

// 打造法宝
export function doCraftArtifact(selectedMaterials, artifactName = null) {
  // 检查材料是否足够
  for (const mat of selectedMaterials) {
    if (getMaterialCount(mat.id) < mat.count) {
      addLog(`材料【${getMaterialById(mat.id)?.name || mat.id}】不足！`, 'danger')
      return null
    }
  }

  // 扣除材料
  for (const mat of selectedMaterials) {
    removeMaterial(mat.id, mat.count)
  }

  // 打造法宝
  const artifact = craftArtifact(selectedMaterials, artifactName)
  if (!artifact) {
    addLog('打造失败！', 'danger')
    return null
  }

  // 添加到法宝列表
  if (!gameState.player.craftedArtifacts) {
    gameState.player.craftedArtifacts = []
  }
  gameState.player.craftedArtifacts.push(artifact)

  addLog(`成功打造【${artifact.qualityName}】${artifact.name}！`, 'success')
  autoSave()
  return artifact
}

// 装备打造法宝
export function equipCraftedArtifact(artifactId) {
  if (!gameState.player.craftedArtifacts) return false

  const artifact = gameState.player.craftedArtifacts.find(a => a.id === artifactId)
  if (!artifact) return false

  gameState.player.equippedCraftedArtifact = artifact.id
  // 同时设置到装备槽位，以便装备面板显示
  gameState.player.equipment.artifact = artifact
  addLog(`装备了【${artifact.qualityName}】${artifact.name}`, 'success')
  autoSave()
  return true
}

// 卸下打造法宝
export function unequipCraftedArtifact() {
  if (!gameState.player.equippedCraftedArtifact) return false

  const artifact = getEquippedCraftedArtifact()
  if (artifact) {
    addLog(`卸下了【${artifact.qualityName}】${artifact.name}`, 'normal')
  }

  gameState.player.equippedCraftedArtifact = null
  // 同时清除装备槽位
  gameState.player.equipment.artifact = null
  autoSave()
  return true
}

// 获取当前装备的打造法宝
export function getEquippedCraftedArtifact() {
  if (!gameState.player.equippedCraftedArtifact) return null
  if (!gameState.player.craftedArtifacts) return null

  return gameState.player.craftedArtifacts.find(
    a => a.id === gameState.player.equippedCraftedArtifact
  )
}

// 给法宝增加经验
export function addCraftedArtifactExp(artifactId, exp) {
  if (!gameState.player.craftedArtifacts) return false

  const artifact = gameState.player.craftedArtifacts.find(a => a.id === artifactId)
  if (!artifact) return false

  artifact.exp = (artifact.exp || 0) + exp

  // 检查升级
  let leveledUp = false
  while (artifact.level < artifact.maxLevel) {
    const expNeeded = getArtifactExpForLevel(artifact.level)
    if (artifact.exp >= expNeeded) {
      artifact.exp -= expNeeded
      artifact.level++
      leveledUp = true
    } else {
      break
    }
  }

  if (leveledUp) {
    addBattleLog(`法宝【${artifact.name}】升级到 ${artifact.level} 级！`, 'success')
  }

  return leveledUp
}

// 分解法宝（返还部分材料）
export function dismantleCraftedArtifact(artifactId) {
  if (!gameState.player.craftedArtifacts) return false

  const index = gameState.player.craftedArtifacts.findIndex(a => a.id === artifactId)
  if (index === -1) return false

  const artifact = gameState.player.craftedArtifacts[index]

  // 如果是已装备的，先卸下
  if (gameState.player.equippedCraftedArtifact === artifactId) {
    gameState.player.equippedCraftedArtifact = null
  }

  // 返还部分材料（50%几率返还每种材料1个）
  if (artifact.usedMaterials) {
    for (const mat of artifact.usedMaterials) {
      if (Math.random() < 0.5) {
        addMaterial(mat.id, 1)
        const matData = getMaterialById(mat.id)
        if (matData) {
          addLog(`回收了1个【${matData.name}】`, 'normal')
        }
      }
    }
  }

  // 移除法宝
  gameState.player.craftedArtifacts.splice(index, 1)

  addLog(`分解了【${artifact.qualityName}】${artifact.name}`, 'warning')
  autoSave()
  return true
}

// 获取法宝列表
export function getCraftedArtifacts() {
  return gameState.player.craftedArtifacts || []
}

// 材料掉落检查（普通地图）
export function checkMaterialDrop(mapId) {
  const droppableMaterials = getMapDroppableMaterials(mapId)
  if (droppableMaterials.length === 0) return null

  // 应用掉落倍率
  const dropMultiplier = gameState.devDropMultiplier || 1

  for (const material of droppableMaterials) {
    const dropRate = materialDropRates[material.grade] * dropMultiplier
    if (Math.random() * 100 < dropRate) {
      addMaterial(material.id, 1)
      // 记录材料掉落统计
      if (gameState.battle.battleStats && gameState.battle.battleStats.drops) {
        if (!gameState.battle.battleStats.drops.materials) {
          gameState.battle.battleStats.drops.materials = {}
        }
        gameState.battle.battleStats.drops.materials[material.id] = (gameState.battle.battleStats.drops.materials[material.id] || 0) + 1
      }
      return material
    }
  }
  return null
}

// 材料掉落检查（锁妖塔）
export function checkTowerMaterialDrop(towerFloor) {
  const droppableMaterials = getTowerDroppableMaterials(towerFloor)
  if (droppableMaterials.length === 0) return null

  // 应用掉落倍率
  const dropMultiplier = gameState.devDropMultiplier || 1

  for (const material of droppableMaterials) {
    const dropRate = materialDropRates[material.grade] * dropMultiplier
    if (Math.random() * 100 < dropRate) {
      addMaterial(material.id, 1)
      // 记录材料掉落统计
      if (gameState.battle.battleStats && gameState.battle.battleStats.drops) {
        if (!gameState.battle.battleStats.drops.materials) {
          gameState.battle.battleStats.drops.materials = {}
        }
        gameState.battle.battleStats.drops.materials[material.id] = (gameState.battle.battleStats.drops.materials[material.id] || 0) + 1
      }
      return material
    }
  }
  return null
}

// ==================== 天赋系统 ====================

// 获取可用天赋点数（每25级获得1点）
export function getAvailableTalentPoints() {
  const totalPoints = Math.floor(gameState.player.level / talentConfig.pointsPerLevel)
  const usedPoints = getTotalUsedPoints(gameState.player.talents)
  return Math.max(0, totalPoints - usedPoints)
}

// 获取总天赋点数
export function getTotalTalentPoints() {
  return Math.floor(gameState.player.level / talentConfig.pointsPerLevel)
}

// 分配天赋点
export function allocateTalentPoint(branchId, talentId) {
  const availablePoints = getAvailableTalentPoints()

  if (!canAddTalentPoint(gameState.player.talents, branchId, talentId, availablePoints)) {
    return { success: false, message: '无法加点' }
  }

  // 初始化天赋存储（使用 Vue.set 确保响应式）
  if (!gameState.player.talents) {
    Vue.set(gameState.player, 'talents', {})
  }
  if (!gameState.player.talents[branchId]) {
    Vue.set(gameState.player.talents, branchId, {})
  }
  if (!gameState.player.talents[branchId][talentId]) {
    Vue.set(gameState.player.talents[branchId], talentId, 0)
  }

  // 使用 Vue.set 更新点数
  Vue.set(gameState.player.talents[branchId], talentId, gameState.player.talents[branchId][talentId] + 1)

  // 递增版本号触发响应式更新
  gameState.player.talentsVersion++

  const branch = talentTree[branchId]
  const talent = branch.talents.find(t => t.id === talentId)

  autoSave()
  return {
    success: true,
    message: `【${talent.name}】+1 (${gameState.player.talents[branchId][talentId]}/${talent.maxPoints})`
  }
}

// 重置天赋（免费）
export function resetTalents() {
  Vue.set(gameState.player, 'talents', {})
  // 递增版本号触发响应式更新
  gameState.player.talentsVersion++
  autoSave()
  addLog('天赋已重置', 'success')
  return { success: true, message: '天赋已重置' }
}

// 获取天赋分配状态
export function getTalentAllocation() {
  return gameState.player.talents || {}
}

// 导出天赋树数据供组件使用
export { talentTree, talentConfig }
