import Vue from 'vue'
import { realms, maps, equipSlots, generateEquipment, getRandomSkills, skills, getSkillById, getSkillDamage, getPassiveSkillStats, getSkillExpForLevel, rollSkillBookDrop, skillRarityConfig } from '../data/gameData'
import { calculateChecksum, verifyChecksum, validatePlayerData } from '../utils/security'

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

// 计算升级所需经验（提升40%难度）
function getExpForLevel(level) {
  return Math.floor(70 * level * (1 + level * 0.1))
}

// 生成新手装备
function generateStarterEquipment() {
  return {
    weapon: generateEquipment(1, 'weapon', 'white'),
    armor: generateEquipment(1, 'armor', 'white'),
    helmet: generateEquipment(1, 'helmet', 'white'),
    ring: generateEquipment(1, 'ring', 'white'),
    necklace: generateEquipment(1, 'necklace', 'white'),
    boots: generateEquipment(1, 'boots', 'white'),
    artifact: generateEquipment(1, 'artifact', 'white')
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
    inventory: []
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
    roundCount: 0, // 回合计数
    battleLog: [],
    selectedMapId: 1,
    battleTimer: null,
    killCount: 0
  },
  logs: []
})

// 获取当前境界
export function getCurrentRealm() {
  return realms.find(r => r.id === gameState.player.realmId) || realms[0]
}

// 获取下一个境界
export function getNextRealm() {
  return realms.find(r => r.id === gameState.player.realmId + 1)
}

// 获取升级所需经验
export function getExpToNextLevel() {
  return getExpForLevel(gameState.player.level)
}

// 计算装备提供的属性加成
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
    dropRate: 0
  }

  for (const equip of Object.values(gameState.player.equipment)) {
    if (equip && equip.stats) {
      for (const [stat, value] of Object.entries(equip.stats)) {
        if (stats.hasOwnProperty(stat)) {
          stats[stat] += value
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
    hpRegen: 0
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

// 计算最终属性
export function getPlayerStats() {
  const realm = getCurrentRealm()
  const p = gameState.player
  const realmBonus = realm.statBonus
  const equipStats = getEquipmentStats()
  const passiveStats = getPassiveSkillBonus()

  // 获取临时buff加成
  const buffs = gameState.battle.playerBuffs || {}
  const attackBuffPercent = buffs.attackBuff?.value || 0
  const defenseBuffPercent = buffs.defenseBuff?.value || 0
  const critBuffValue = buffs.critBuff?.value || 0

  const baseAttack = Math.floor((p.baseAttack + equipStats.attack + passiveStats.attack) * realmBonus)
  const baseDefense = Math.floor((p.baseDefense + equipStats.defense + passiveStats.defense) * realmBonus)

  return {
    maxHp: Math.floor((p.baseHp + equipStats.hp + passiveStats.hp) * realmBonus),
    attack: Math.floor(baseAttack * (1 + attackBuffPercent / 100)),
    defense: Math.floor(baseDefense * (1 + defenseBuffPercent / 100)),
    critRate: p.critRate + equipStats.critRate + passiveStats.critRate + critBuffValue,
    critResist: p.critResist + equipStats.critResist + passiveStats.critResist,
    critDamage: p.critDamage + equipStats.critDamage + passiveStats.critDamage,
    dodge: p.dodge + equipStats.dodge + passiveStats.dodge,
    hit: p.hit + equipStats.hit + passiveStats.hit,
    penetration: p.penetration + equipStats.penetration + passiveStats.penetration,
    skillDamage: equipStats.skillDamage + passiveStats.skillDamage,
    dropRate: equipStats.dropRate,
    lifesteal: passiveStats.lifesteal || 0,
    damageReduction: passiveStats.damageReduction || 0,
    hpRegen: passiveStats.hpRegen || 0
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

// 检查并升级
export function checkLevelUp() {
  let expNeeded = getExpToNextLevel()
  let leveledUp = false

  while (gameState.player.exp >= expNeeded) {
    gameState.player.exp -= expNeeded
    gameState.player.level++

    gameState.player.baseHp += 10
    gameState.player.baseAttack += 3
    gameState.player.baseDefense += 2

    if (gameState.player.level % 5 === 0) {
      gameState.player.critRate += 1
    }
    if (gameState.player.level % 10 === 0) {
      gameState.player.penetration += 1
    }

    addLog(`升级了！当前等级 ${gameState.player.level}`, 'success')
    leveledUp = true
    expNeeded = getExpToNextLevel()
  }

  if (leveledUp) autoSave()
  return leveledUp
}

// 检查并突破境界
export function checkRealmBreakthrough() {
  const nextRealm = getNextRealm()
  if (!nextRealm) return false

  if (gameState.player.realmExp >= nextRealm.minExp) {
    gameState.player.realmId = nextRealm.id
    gameState.player.baseHp += 50
    gameState.player.baseAttack += 15
    gameState.player.baseDefense += 10
    gameState.player.critDamage += 10

    addLog(`突破了！进入【${nextRealm.name}】！`, 'success')
    autoSave()
    return true
  }
  return false
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

// 背包容量上限
const INVENTORY_LIMIT = 50

// 添加物品到背包（超出上限自动丢弃）
export function addToInventory(item) {
  if (gameState.player.inventory.length >= INVENTORY_LIMIT) {
    addLog(`背包已满，【${item.name}】已自动丢弃`, 'warning')
    return false
  }
  gameState.player.inventory.push(item)
  return true
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
    if (gameState.player.inventory.length >= INVENTORY_LIMIT) {
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

// 装备技能（主动技能最多4个，被动技能最多2个）
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

    if (gameState.player.equippedPassiveSkills.length >= 2) {
      addLog('最多只能装备2个被动技能', 'warning')
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

// 开始战斗
export function startBattle() {
  const map = maps.find(m => m.id === gameState.battle.selectedMapId)
  if (!map) return false

  if (gameState.player.level < map.requiredLevel) {
    addLog(`等级不足，需要 ${map.requiredLevel} 级才能进入`, 'danger')
    return false
  }

  // 新手村只生成1个怪物，其他地图随机1-5个
  const monsterCount = map.id === 1 ? 1 : Math.floor(Math.random() * 5) + 1
  const monsters = []

  for (let i = 0; i < monsterCount; i++) {
    const baseMonster = map.monsters[Math.floor(Math.random() * map.monsters.length)]
    const monster = {
      ...baseMonster,
      currentHp: baseMonster.hp,
      skills: getRandomSkills(baseMonster.level),
      buffs: {}, // 存储激活的buff
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
  gameState.battle.playerBuffs = {}
  gameState.battle.roundCount = 0

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

  return true
}

// 更新玩家buff持续时间
function updatePlayerBuffs() {
  const buffs = gameState.battle.playerBuffs
  for (const buffName of Object.keys(buffs)) {
    if (buffs[buffName].duration > 0) {
      buffs[buffName].duration--
      if (buffs[buffName].duration <= 0) {
        delete buffs[buffName]
        addBattleLog(`${getBuffName(buffName)}效果已消失`, 'normal')
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
    charge: '蓄力'
  }
  return names[buffType] || buffType
}

// 执行一回合战斗
export function battleRound() {
  if (!gameState.battle.isInBattle) return null

  gameState.battle.roundCount++
  updateCooldowns()
  updatePlayerBuffs()

  const stats = getPlayerStats()
  const maxHp = stats.maxHp
  const monsters = gameState.battle.currentMonsters
  const aliveMonsters = monsters.filter(m => m.currentHp > 0)

  if (aliveMonsters.length === 0) {
    gameState.battle.isInBattle = false
    return 'win'
  }

  // 生命回复（每回合）
  if (stats.hpRegen > 0 && gameState.battle.playerCurrentHp < maxHp) {
    const healAmount = Math.floor(maxHp * stats.hpRegen / 100)
    gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
    addBattleLog(`生命之源恢复 ${healAmount} 点生命`, 'success')
  }

  let result = null
  let skipAttack = false

  // 检查蓄力状态
  const chargeState = gameState.battle.playerBuffs.charge
  let chargeBonus = 1
  if (chargeState) {
    chargeBonus = chargeState.value
    delete gameState.battle.playerBuffs.charge
    addBattleLog(`蓄力完成，释放强力攻击！`, 'warning')
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

    // 给已装备的技能增加经验
    addSkillExp(selectedSkill.id, 15)

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
      gameState.battle.playerBuffs.charge = { value: skillMultiplier, duration: 1 }
      addBattleLog(`使用【${selectedSkill.name}】开始蓄力...`, 'warning')
      skipAttack = true
    }

    // 治愈技能（基于攻击力）
    if (selectedSkill.effect === 'heal') {
      const healAmount = Math.floor(stats.attack * skillMultiplier)
      gameState.battle.playerCurrentHp = Math.min(maxHp, gameState.battle.playerCurrentHp + healAmount)
      addBattleLog(`使用【${selectedSkill.name}】恢复 ${healAmount} 点生命`, 'success')
      skipAttack = true
    }

    // 攻击增益
    if (selectedSkill.effect === 'attackBuff') {
      gameState.battle.playerBuffs.attackBuff = {
        value: selectedSkill.effectValue,
        duration: selectedSkill.effectDuration
      }
      addBattleLog(`使用【${selectedSkill.name}】攻击力提升${selectedSkill.effectValue}%，持续${selectedSkill.effectDuration}回合`, 'success')
      skipAttack = true
    }

    // 暴击增益
    if (selectedSkill.effect === 'critBuff') {
      gameState.battle.playerBuffs.critBuff = {
        value: selectedSkill.effectValue,
        duration: selectedSkill.effectDuration
      }
      addBattleLog(`使用【${selectedSkill.name}】暴击率提升${selectedSkill.effectValue}%，持续${selectedSkill.effectDuration}回合`, 'success')
      skipAttack = true
    }

    // 防御增益
    if (selectedSkill.effect === 'defenseBuff') {
      gameState.battle.playerBuffs.defenseBuff = {
        value: selectedSkill.effectValue,
        duration: selectedSkill.effectDuration
      }
      addBattleLog(`使用【${selectedSkill.name}】防御力提升${selectedSkill.effectValue}%，持续${selectedSkill.effectDuration}回合`, 'success')
      skipAttack = true
    }

    // 护盾
    if (selectedSkill.effect === 'shield') {
      const shieldAmount = Math.floor(maxHp * selectedSkill.effectValue / 100)
      gameState.battle.playerBuffs.shield = { value: shieldAmount, duration: 99 }
      addBattleLog(`使用【${selectedSkill.name}】生成 ${shieldAmount} 点护盾`, 'success')
      skipAttack = true
    }

    // 牺牲技能（消耗生命换伤害）
    if (selectedSkill.effect === 'sacrifice') {
      const sacrificeHp = Math.floor(gameState.battle.playerCurrentHp * selectedSkill.effectValue / 100)
      gameState.battle.playerCurrentHp -= sacrificeHp
      addBattleLog(`使用【${selectedSkill.name}】消耗 ${sacrificeHp} 点生命！`, 'danger')
    }
  }

  // 应用蓄力加成
  if (chargeBonus > 1) {
    skillMultiplier = chargeBonus
    isAoe = true
    hitCount = 2
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
    const monsterDodge = targetMonster.buffs.dodge ? 5 + targetMonster.buffs.dodge : 5

    if (isGuaranteedHit || playerHitRoll < stats.hit - monsterDodge) {
      const critRoll = Math.random() * 100
      const effectiveCritRate = stats.critRate + extraCritBoost
      const isCrit = critRoll < effectiveCritRate

      let damage = calculateDamage(
        stats.attack,
        targetMonster.buffs.defense ? targetMonster.defense * (1 + targetMonster.buffs.defense / 100) : targetMonster.defense,
        stats.penetration + extraPenetration,
        stats.skillDamage,
        isCrit,
        stats.critDamage
      )

      // 应用技能倍率
      damage = Math.floor(damage * skillMultiplier)

      // 反伤护盾
      const reflectSkill = targetMonster.skills.find(s => s.effect === 'reflect')
      if (reflectSkill) {
        const reflectDamage = Math.floor(damage * reflectSkill.value / 100)
        gameState.battle.playerCurrentHp -= reflectDamage
        addBattleLog(`反伤护盾反弹 ${reflectDamage} 伤害！`, 'warning')
      }

      targetMonster.currentHp -= damage

      // 吸血效果
      if (lifestealPercent > 0) {
        const healAmount = Math.floor(damage * lifestealPercent / 100)
        gameState.battle.playerCurrentHp = Math.min(stats.maxHp, gameState.battle.playerCurrentHp + healAmount)
        addBattleLog(`吸取生命 ${healAmount}！`, 'success')
      }

      if (selectedSkill) {
        addBattleLog(`【${selectedSkill.name}】对 ${targetMonster.name} 造成 ${damage} 伤害${isCrit ? '(暴击!)' : ''}`, 'success')
      } else {
        addBattleLog(`你对 ${targetMonster.name} 造成 ${damage} 伤害${isCrit ? '(暴击!)' : ''}`, 'success')
      }

      // 检查怪物死亡
      if (targetMonster.currentHp <= 0) {
        // 检查不屈意志
        const reviveSkill = targetMonster.skills.find(s => s.effect === 'revive')
        if (reviveSkill && !targetMonster.reviveUsed) {
          targetMonster.reviveUsed = true
          targetMonster.currentHp = Math.floor(targetMonster.hp * reviveSkill.value / 100)
          addBattleLog(`${targetMonster.name} 发动【不屈意志】复活，恢复 ${reviveSkill.value}% 血量！`, 'warning')
        } else {
          targetMonster.currentHp = 0
          gameState.battle.killCount++

          // 奖励
          gameState.player.exp += targetMonster.exp
          gameState.player.realmExp += Math.floor(targetMonster.exp / 2)
          gameState.player.gold += targetMonster.gold

          // 给所有已装备的主动技能增加经验
          for (const skillId of gameState.player.equippedActiveSkills) {
            addSkillExp(skillId, Math.floor(targetMonster.exp / 5))
          }
          // 给所有已装备的被动技能增加经验
          for (const skillId of gameState.player.equippedPassiveSkills) {
            addSkillExp(skillId, Math.floor(targetMonster.exp / 5))
          }

          addBattleLog(`击败 ${targetMonster.name}！+${targetMonster.exp}经验 +${targetMonster.gold}灵石`, 'success')

          // 装备掉落（加上dropRate属性加成）
          const effectiveDropRate = targetMonster.dropRate + stats.dropRate
          if (Math.random() * 100 < effectiveDropRate) {
            const slots = Object.keys(equipSlots)
            const randomSlot = slots[Math.floor(Math.random() * slots.length)]
            const dropLevel = Math.max(1, targetMonster.level + Math.floor(Math.random() * 5) - 2)
            const newEquip = generateEquipment(dropLevel, randomSlot)
            if (addToInventory(newEquip)) {
              addBattleLog(`掉落【${newEquip.qualityName}】${newEquip.name}`, 'success')
            } else {
              addBattleLog(`掉落【${newEquip.qualityName}】${newEquip.name}，但背包已满！`, 'warning')
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
              const rarityName = skillRarityConfig[droppedSkill.rarity].name
              if (addToInventory(skillBook)) {
                addBattleLog(`掉落【${rarityName}】${skillBook.name}！`, 'success')
              } else {
                addBattleLog(`掉落【${rarityName}】${skillBook.name}，但背包已满！`, 'warning')
              }
            }
          }

          checkLevelUp()
          checkRealmBreakthrough()

          // 检查是否全部怪物都死亡
          const remainingMonsters = monsters.filter(m => m.currentHp > 0)
          if (remainingMonsters.length === 0) {
            gameState.battle.isInBattle = false
            return 'win'
          }
        }
      }
    } else {
      addBattleLog(`对 ${targetMonster.name} 的攻击被闪避！`, 'normal')
    }
  } // end of hit loop

  // 所有存活怪物攻击
  const currentAliveMonsters = monsters.filter(m => m.currentHp > 0)
  for (const monster of currentAliveMonsters) {
    if (gameState.battle.playerCurrentHp <= 0) break

    // 检查是否使用技能
    let monsterUseSkill = null
    let skillDamageMultiplier = 1

    if (monster.skills.length > 0 && Math.random() < 0.3) { // 30%几率使用技能
      const attackSkills = monster.skills.filter(s => s.type === 'attack')
      const buffSkills = monster.skills.filter(s => s.type === 'buff')

      if (attackSkills.length > 0 && Math.random() < 0.6) {
        monsterUseSkill = attackSkills[Math.floor(Math.random() * attackSkills.length)]
        skillDamageMultiplier = monsterUseSkill.multiplier
      } else if (buffSkills.length > 0) {
        monsterUseSkill = buffSkills[Math.floor(Math.random() * buffSkills.length)]
        // 应用buff
        if (monsterUseSkill.stat === 'lifesteal') {
          monster.buffs.lifesteal = monsterUseSkill.value
        } else {
          monster.buffs[monsterUseSkill.stat] = monsterUseSkill.value
        }
        addBattleLog(`${monster.name} 使用【${monsterUseSkill.name}】！${monsterUseSkill.description}`, 'warning')
        continue // buff技能不攻击
      }
    }

    const monsterHitRoll = Math.random() * 100
    if (monsterHitRoll >= stats.dodge) {
      const monsterCritRoll = Math.random() * 100
      const effectiveCritRate = monster.buffs.critRate ? 10 + monster.buffs.critRate : 10
      const monsterCrit = monsterCritRoll < Math.max(0, effectiveCritRate - stats.critResist)

      const effectiveAttack = monster.buffs.attack ? monster.attack * (1 + monster.buffs.attack / 100) : monster.attack

      let monsterDamage = calculateDamage(
        effectiveAttack,
        stats.defense,
        0,
        0,
        monsterCrit,
        50
      )

      // 应用技能伤害加成
      monsterDamage = Math.floor(monsterDamage * skillDamageMultiplier)

      // 应用伤害减免
      if (stats.damageReduction > 0) {
        monsterDamage = Math.floor(monsterDamage * (1 - stats.damageReduction / 100))
      }

      // 护盾吸收伤害
      const shield = gameState.battle.playerBuffs.shield
      if (shield && shield.value > 0) {
        if (shield.value >= monsterDamage) {
          shield.value -= monsterDamage
          addBattleLog(`护盾吸收 ${monsterDamage} 伤害，剩余 ${shield.value}`, 'normal')
          monsterDamage = 0
        } else {
          monsterDamage -= shield.value
          addBattleLog(`护盾吸收 ${shield.value} 伤害后破碎！`, 'warning')
          delete gameState.battle.playerBuffs.shield
        }
      }

      gameState.battle.playerCurrentHp -= monsterDamage

      // 吸血效果
      if (monster.buffs.lifesteal) {
        const healAmount = Math.floor(monsterDamage * monster.buffs.lifesteal / 100)
        monster.currentHp = Math.min(monster.hp, monster.currentHp + healAmount)
      }

      // 吸血光环（特殊技能）
      const drainSkill = monster.skills.find(s => s.effect === 'drain')
      if (drainSkill) {
        const healAmount = Math.floor(monsterDamage * drainSkill.value / 100)
        monster.currentHp = Math.min(monster.hp, monster.currentHp + healAmount)
      }

      if (monsterUseSkill && monsterUseSkill.type === 'attack') {
        addBattleLog(`${monster.name} 使用【${monsterUseSkill.name}】造成 ${monsterDamage} 伤害${monsterCrit ? '(暴击!)' : ''}`, 'danger')
      } else {
        addBattleLog(`${monster.name} 造成 ${monsterDamage} 伤害${monsterCrit ? '(暴击!)' : ''}`, 'danger')
      }

      if (gameState.battle.playerCurrentHp <= 0) {
        gameState.battle.playerCurrentHp = 0
        result = 'lose'
        addBattleLog(`你被击败了...`, 'danger')
        gameState.battle.isInBattle = false
        stopAutoBattle()
        return result
      }
    } else {
      addBattleLog(`你闪避了 ${monster.name} 的攻击！`, 'success')
    }
  }

  return 'continue'
}

// 开始自动战斗
export function startAutoBattle() {
  if (gameState.battle.isAutoBattle) return

  gameState.battle.isAutoBattle = true
  gameState.battle.killCount = 0
  clearBattleLog()
  addBattleLog('开始自动战斗...', 'warning')

  const autoBattleLoop = () => {
    if (!gameState.battle.isAutoBattle) return

    if (!gameState.battle.isInBattle) {
      startBattle()
    }

    if (gameState.battle.isInBattle) {
      battleRound()
    }

    if (gameState.battle.isAutoBattle) {
      gameState.battle.battleTimer = setTimeout(autoBattleLoop, 1000)
    }
  }

  autoBattleLoop()
}

// 停止自动战斗
export function stopAutoBattle() {
  gameState.battle.isAutoBattle = false
  if (gameState.battle.battleTimer) {
    clearTimeout(gameState.battle.battleTimer)
    gameState.battle.battleTimer = null
  }
  addBattleLog('停止自动战斗', 'warning')
}

// 保存游戏（加密）
export function saveGame(silent = false) {
  // 数据合理性检查
  const validation = validatePlayerData(gameState.player)
  if (!validation.valid) {
    console.warn('数据异常:', validation.errors)
    // 如果数据异常，不保存并警告
    if (!silent) {
      addLog('存档失败：检测到数据异常！', 'danger')
    }
    return false
  }

  const saveData = {
    player: gameState.player,
    battle: {
      selectedMapId: gameState.battle.selectedMapId,
      killCount: gameState.battle.killCount
    },
    timestamp: Date.now(),
    version: 6, // 版本号更新
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

      // 数据合理性验证
      const validation = validatePlayerData(data.player)
      if (!validation.valid) {
        console.warn('存档数据异常:', validation.errors)
        addLog(`存档数据异常：${validation.errors.join('、')}`, 'danger')
        return false
      }

      Object.assign(gameState.player, data.player)

      if (data.battle) {
        gameState.battle.selectedMapId = data.battle.selectedMapId || 1
        gameState.battle.killCount = data.battle.killCount || 0
      }

      gameState.battle.isInBattle = false
      gameState.battle.isAutoBattle = false
      gameState.battle.playerCurrentHp = getPlayerStats().maxHp

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
  // 数据合理性检查
  const validation = validatePlayerData(gameState.player)
  if (!validation.valid) {
    console.warn('数据异常，无法导出:', validation.errors)
    return null
  }

  const saveData = {
    player: gameState.player,
    battle: {
      selectedMapId: gameState.battle.selectedMapId,
      killCount: gameState.battle.killCount
    },
    timestamp: Date.now(),
    version: 6,
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

    // 数据合理性验证
    const validation = validatePlayerData(data.player)
    if (!validation.valid) {
      addLog(`存档数据异常：${validation.errors.join('、')}`, 'danger')
      return false
    }

    Object.assign(gameState.player, data.player)

    if (data.battle) {
      gameState.battle.selectedMapId = data.battle.selectedMapId || 1
      gameState.battle.killCount = data.battle.killCount || 0
    }

    gameState.battle.isInBattle = false
    gameState.battle.isAutoBattle = false
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
    inventory: []
  }

  gameState.battle = {
    isAutoBattle: false,
    isInBattle: false,
    currentMonsters: [],
    currentMonsterIndex: 0,
    playerCurrentHp: 150,
    playerBuffs: {},
    skillCooldowns: {},
    roundCount: 0,
    battleLog: [],
    selectedMapId: 1,
    battleTimer: null,
    killCount: 0
  }

  gameState.logs = []
  addLog('开始新的修仙之旅！', 'success')
}
