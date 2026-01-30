// 修仙境界
export const realms = [
  { id: 1, name: '凡人', minExp: 0, statBonus: 1 },
  { id: 2, name: '练气期', minExp: 1500, statBonus: 1.3 },
  { id: 3, name: '筑基期', minExp: 6000, statBonus: 1.7 },
  { id: 4, name: '金丹期', minExp: 25000, statBonus: 2.2 },
  { id: 5, name: '元婴期', minExp: 100000, statBonus: 3 },
  { id: 6, name: '化神期', minExp: 350000, statBonus: 4 },
  { id: 7, name: '合体期', minExp: 1200000, statBonus: 5.5 },
  { id: 8, name: '大乘期', minExp: 4000000, statBonus: 7.5 },
  { id: 9, name: '渡劫期', minExp: 12000000, statBonus: 10 }
]

// 装备品质
export const qualityConfig = {
  white: { name: '普通', color: '#ffffff', statMultiplier: 1, dropRate: 50 },
  green: { name: '优秀', color: '#2ecc71', statMultiplier: 1.3, dropRate: 30 },
  blue: { name: '精良', color: '#3498db', statMultiplier: 1.7, dropRate: 15 },
  purple: { name: '史诗', color: '#9b59b6', statMultiplier: 2.2, dropRate: 4 },
  orange: { name: '传说', color: '#e67e22', statMultiplier: 3, dropRate: 1 }
}

// 装备槽位
export const equipSlots = {
  weapon: { name: '武器', icon: '⚔️' },
  armor: { name: '衣服', icon: '👘' },
  helmet: { name: '头饰', icon: '👑' },
  ring: { name: '戒指', icon: '💍' },
  necklace: { name: '项链', icon: '📿' },
  boots: { name: '鞋子', icon: '👢' },
  artifact: { name: '法宝', icon: '🔮' }
}

// 武器类型 - 3种特色武器
export const weaponTypes = {
  sword: {
    name: '剑',
    description: '剑走轻灵，暴击致命',
    primaryStat: 'attack',
    secondaryStat: 'critRate',
    secondaryValue: 0.15,
    prefixes: ['青锋', '寒霜', '紫电', '赤焰', '玄铁', '破晓', '裂空', '斩龙', '诛仙', '灭世']
  },
  blade: {
    name: '刀',
    description: '刀法霸道，无视防御',
    primaryStat: 'attack',
    secondaryStat: 'penetration',
    secondaryValue: 0.12,
    prefixes: ['狂风', '霸王', '血月', '裂天', '屠龙', '鬼煞', '修罗', '灭神', '天罚', '混沌']
  },
  staff: {
    name: '法杖',
    description: '法力精深，暴击致命',
    primaryStat: 'attack',
    secondaryStat: 'critDamage',
    secondaryValue: 0.3,
    prefixes: ['灵木', '星辰', '月华', '日曜', '雷霆', '冰魄', '炎灵', '虚空', '混元', '太极']
  },
  hammer: {
    name: '锤',
    description: '重锤压制，防御加成',
    primaryStat: 'attack',
    secondaryStat: 'defense',
    secondaryValue: 0.5,
    prefixes: ['石锤', '铁锤', '钢锤', '玄铁', '镇山', '碎岳', '裂地', '天崩', '神锤', '开天']
  },
  shield: {
    name: '盾',
    description: '盾卫己身，生命倍增',
    primaryStat: 'attack',
    secondaryStat: 'hp',
    secondaryValue: 3,
    prefixes: ['木盾', '铁盾', '钢盾', '玄盾', '金盾', '护心', '龙鳞', '天罡', '不朽', '永恒']
  }
}

// 装备基础属性模板（每级增加的属性）
export const equipTemplates = {
  weapon: { attack: 3 },
  armor: { hp: 15, defense: 2 },
  helmet: { hp: 10, critResist: 0.1 },
  ring: { attack: 1.5, critDamage: 0.25 },
  necklace: { attack: 1, critDamage: 0.15, dropRate: 0.15 },
  boots: { dodge: 0.08, hit: 0.1 },
  artifact: { hp: 5, attack: 1, defense: 0.5, critRate: 0.03, dropRate: 0.1 }
}

// 装备名称后缀
export const equipSuffixes = {
  armor: ['布衣', '皮甲', '锁甲', '玄甲', '宝衣', '仙袍', '神衣', '天衣'],
  helmet: ['布巾', '头环', '发冠', '宝冠', '仙冠', '神冕', '天冠', '帝冕'],
  ring: ['铜戒', '银戒', '金戒', '玉戒', '灵戒', '仙戒', '神戒', '天戒'],
  necklace: ['麻绳', '铜链', '银链', '金链', '玉链', '灵链', '仙链', '神链'],
  boots: ['草鞋', '布靴', '皮靴', '铁靴', '玄靴', '灵靴', '仙靴', '神靴'],
  artifact: ['木符', '玉佩', '铜镜', '灵珠', '宝塔', '仙剑', '神印', '混沌珠']
}

// 怪物技能库
export const monsterSkills = [
  // 攻击类技能
  { name: '凶猛撕咬', type: 'attack', multiplier: 1.5, description: '造成150%伤害' },
  { name: '致命一击', type: 'attack', multiplier: 2.0, description: '造成200%伤害' },
  { name: '狂暴冲撞', type: 'attack', multiplier: 1.8, description: '造成180%伤害' },
  { name: '毒液喷射', type: 'attack', multiplier: 1.3, description: '造成130%伤害' },
  { name: '寒冰吐息', type: 'attack', multiplier: 1.6, description: '造成160%伤害' },
  { name: '烈焰灼烧', type: 'attack', multiplier: 1.7, description: '造成170%伤害' },
  { name: '雷霆轰击', type: 'attack', multiplier: 1.9, description: '造成190%伤害' },
  { name: '暗影突袭', type: 'attack', multiplier: 2.2, description: '造成220%伤害' },
  { name: '死亡凝视', type: 'attack', multiplier: 2.5, description: '造成250%伤害' },
  { name: '毁灭之息', type: 'attack', multiplier: 3.0, description: '造成300%伤害' },
  // 增益类技能
  { name: '狂暴', type: 'buff', stat: 'attack', value: 20, description: '攻击力+20%' },
  { name: '铁壁', type: 'buff', stat: 'defense', value: 30, description: '防御力+30%' },
  { name: '嗜血', type: 'buff', stat: 'lifesteal', value: 15, description: '生命偷取15%' },
  { name: '疾风', type: 'buff', stat: 'dodge', value: 10, description: '闪避+10%' },
  { name: '精准', type: 'buff', stat: 'critRate', value: 15, description: '暴击+15%' },
  // 特殊技能
  { name: '反伤护盾', type: 'special', effect: 'reflect', value: 20, description: '反弹20%伤害' },
  { name: '吸血光环', type: 'special', effect: 'drain', value: 10, description: '每次攻击回复10%伤害' },
  { name: '不屈意志', type: 'special', effect: 'revive', value: 30, description: '首次死亡恢复30%血量' }
]

// 根据等级获取随机技能
export function getRandomSkills(level) {
  const skillCount = Math.min(5, 1 + Math.floor(level / 12)) // 1-12级1个，13-24级2个，以此类推
  const availableSkills = [...monsterSkills]
  const selectedSkills = []

  // 高等级怪物有更高几率获得强力技能
  for (let i = 0; i < skillCount; i++) {
    if (availableSkills.length === 0) break
    const index = Math.floor(Math.random() * availableSkills.length)
    selectedSkills.push({ ...availableSkills[index] })
    availableSkills.splice(index, 1)
  }

  return selectedSkills
}

// 地图难度倍率（后期地图怪物更强）
const mapDifficultyMultiplier = {
  '新手村外': 1,
  '青云山脚': 1.3,
  '幽暗森林': 1.8,
  '妖兽山脉': 2.5,
  '元素秘境': 3.5,
  '魔渊边境': 4.5,
  '魔渊深处': 6.0,
  '天魔战场': 8.0,
  '混沌裂隙': 11.0,
  '上古遗迹': 15.0,
  '天道试炼': 20.0
}

// 生成怪物数据（1-60级）
function generateMonsters() {
  const monsterTemplates = [
    { level: [1, 3], names: ['野鸡', '野兔', '山鼠'], location: '新手村外' },
    { level: [4, 6], names: ['野狼', '毒蛇', '野猪'], location: '新手村外' },
    { level: [7, 10], names: ['黑熊', '猛虎', '豹子'], location: '青云山脚' },
    { level: [11, 13], names: ['山魈', '树精', '石怪'], location: '青云山脚' },
    { level: [14, 16], names: ['狼妖', '蛇妖', '熊妖'], location: '幽暗森林' },
    { level: [17, 20], names: ['鬼面蛛', '嗜血蝠', '噬魂兽'], location: '幽暗森林' },
    { level: [21, 23], names: ['火焰狮', '寒冰狼', '雷电鹰'], location: '妖兽山脉' },
    { level: [24, 26], names: ['岩石巨人', '风暴元素', '水灵精'], location: '妖兽山脉' },
    { level: [27, 30], names: ['赤焰蟒', '玄冰蛟', '紫雷貂'], location: '元素秘境' },
    { level: [31, 33], names: ['魔化战士', '暗影刺客', '邪能法师'], location: '魔渊边境' },
    { level: [34, 36], names: ['血魔将', '骨魔将', '魂魔将'], location: '魔渊边境' },
    { level: [37, 40], names: ['噬天魔', '裂地魔', '焚世魔'], location: '魔渊深处' },
    { level: [41, 43], names: ['堕落天使', '深渊领主', '虚空行者'], location: '天魔战场' },
    { level: [44, 46], names: ['魔龙幼崽', '炎魔后裔', '冰魔之子'], location: '天魔战场' },
    { level: [47, 50], names: ['天魔将军', '地狱公爵', '混沌使者'], location: '混沌裂隙' },
    { level: [51, 53], names: ['远古巨龙', '不死凤凰', '万年玄龟'], location: '上古遗迹' },
    { level: [54, 56], names: ['仙界叛徒', '魔界王子', '妖界皇子'], location: '上古遗迹' },
    { level: [57, 60], names: ['混沌兽', '天道傀儡', '轮回守卫'], location: '天道试炼' }
  ]

  const monsters = []
  monsterTemplates.forEach(template => {
    for (let lvl = template.level[0]; lvl <= template.level[1]; lvl++) {
      template.names.forEach(name => {
        // 新手村(1-6级)怪物数值较低
        const isBeginnerArea = lvl <= 6
        const beginnerMult = isBeginnerArea ? 0.5 : 1

        // 地图难度倍率
        const mapMult = mapDifficultyMultiplier[template.location] || 1

        // 基础属性公式（更激进的增长）
        const baseHp = 40 + lvl * 25 + Math.pow(lvl, 1.7) * 4
        const baseAtk = 4 + lvl * 3 + Math.pow(lvl, 1.35) * 1.2
        const baseDef = 2 + lvl * 1.8 + Math.pow(lvl, 1.25) * 0.8

        monsters.push({
          name: `${name}`,
          level: lvl,
          hp: Math.floor(baseHp * beginnerMult * mapMult),
          attack: Math.floor(baseAtk * beginnerMult * mapMult),
          defense: Math.floor(baseDef * beginnerMult * mapMult),
          exp: Math.floor(15 + lvl * 6 + Math.pow(lvl, 1.3)),
          gold: Math.floor(8 + lvl * 4 + Math.pow(lvl, 1.2)),
          dropRate: Math.min(25, 8 + lvl * 0.3),
          location: template.location
        })
      })
    }
  })
  return monsters
}

// 生成地图数据
function generateMaps() {
  const mapData = [
    { id: 1, name: '新手村外', description: '村外的小树林，有一些野兽出没', levelRange: [1, 6], requiredLevel: 1 },
    { id: 2, name: '青云山脚', description: '青云山脚下，妖气渐浓', levelRange: [7, 13], requiredLevel: 7 },
    { id: 3, name: '幽暗森林', description: '终年不见阳光的森林，危机四伏', levelRange: [14, 20], requiredLevel: 14 },
    { id: 4, name: '妖兽山脉', description: '妖兽横行的山脉，弱者勿入', levelRange: [21, 26], requiredLevel: 21 },
    { id: 5, name: '元素秘境', description: '元素之力汇聚之地，蕴含强大能量', levelRange: [27, 30], requiredLevel: 27 },
    { id: 6, name: '魔渊边境', description: '魔族领地的边缘，魔气弥漫', levelRange: [31, 36], requiredLevel: 31 },
    { id: 7, name: '魔渊深处', description: '魔渊的核心区域，强大魔物栖息', levelRange: [37, 40], requiredLevel: 37 },
    { id: 8, name: '天魔战场', description: '远古天魔大战之地，残留无数亡魂', levelRange: [41, 46], requiredLevel: 41 },
    { id: 9, name: '混沌裂隙', description: '连接混沌虚空的裂缝，极其危险', levelRange: [47, 50], requiredLevel: 47 },
    { id: 10, name: '上古遗迹', description: '上古大能陨落之地，机缘与危机并存', levelRange: [51, 56], requiredLevel: 51 },
    { id: 11, name: '天道试炼', description: '天道设下的终极试炼，唯强者可入', levelRange: [57, 60], requiredLevel: 57 }
  ]

  const allMonsters = generateMonsters()

  return mapData.map(map => ({
    ...map,
    monsters: allMonsters.filter(m => m.level >= map.levelRange[0] && m.level <= map.levelRange[1])
  }))
}

export const maps = generateMaps()

// ==================== 锁妖塔系统 ====================

// 锁妖塔配置
export const towerConfig = {
  name: '锁妖塔',
  description: '镇压妖魔的古塔，每层都有强大的妖物守护',
  monsterCount: 3, // 每层固定3只怪物
  requiredLevel: 10 // 需要10级才能进入
}

// 生成锁妖塔某一层的怪物
export function generateTowerFloorMonsters(floor) {
  // 怪物等级 = 层数 + 5，最低10级
  const monsterLevel = Math.max(10, floor + 5)

  // 难度倍率随层数增加（每10层增加50%）
  const difficultyMult = 1 + Math.floor(floor / 10) * 0.5

  // 怪物名称库
  const monsterNames = [
    '妖狐', '狼妖', '蛇妖', '熊妖', '虎妖',
    '鬼面蛛', '嗜血蝠', '噬魂兽', '赤焰魔', '玄冰魔',
    '雷霆兽', '暗影鬼', '血魔将', '骨魔将', '魂魔将',
    '堕落天使', '深渊领主', '混沌使者', '远古巨兽', '天魔王'
  ]

  const monsters = []
  for (let i = 0; i < towerConfig.monsterCount; i++) {
    // 随机选择怪物名称
    const nameIndex = Math.min(Math.floor(floor / 5) + Math.floor(Math.random() * 3), monsterNames.length - 1)
    const name = monsterNames[nameIndex]

    // 计算属性（比普通地图怪物强）
    const baseHp = 60 + monsterLevel * 30 + Math.pow(monsterLevel, 1.8) * 5
    const baseAtk = 6 + monsterLevel * 4 + Math.pow(monsterLevel, 1.4) * 1.5
    const baseDef = 3 + monsterLevel * 2.5 + Math.pow(monsterLevel, 1.3)

    monsters.push({
      name: `${floor}层${name}`,
      level: monsterLevel,
      hp: Math.floor(baseHp * difficultyMult),
      attack: Math.floor(baseAtk * difficultyMult),
      defense: Math.floor(baseDef * difficultyMult),
      exp: Math.floor((20 + floor * 8) * difficultyMult),
      gold: Math.floor((15 + floor * 5) * difficultyMult),
      dropRate: Math.min(30, 10 + floor * 0.5), // 锁妖塔掉落率更高
      currentHp: Math.floor(baseHp * difficultyMult),
      skills: getRandomSkills(monsterLevel),
      buffs: {},
      reviveUsed: false
    })
  }

  return monsters
}

// 技能稀有度配置
export const skillRarityConfig = {
  common: { name: '普通', color: '#ffffff' },
  uncommon: { name: '优秀', color: '#2ecc71' },
  rare: { name: '稀有', color: '#3498db' },
  epic: { name: '史诗', color: '#9b59b6' },
  legendary: { name: '传说', color: '#e67e22' }
}

// 技能系统 - 10个主动技能 + 5个被动技能
export const skills = [
  // 主动技能 (10个)
  {
    id: 1,
    name: '火球术',
    description: '发射一颗火球攻击敌人',
    type: 'active',
    rarity: 'common',
    maxLevel: 5,
    baseDamageMultiplier: 1.5,
    levelBonusMultiplier: 0.2,
    cooldown: 2,
    shopPrice: 0,
    dropFromMaps: [1, 2],
    dropRate: 0.02
  },
  {
    id: 2,
    name: '冰锥术',
    description: '发射冰锥攻击敌人，附带减速效果',
    type: 'active',
    rarity: 'common',
    maxLevel: 5,
    baseDamageMultiplier: 1.4,
    levelBonusMultiplier: 0.18,
    cooldown: 2,
    effect: 'slow',
    effectValue: 20,
    shopPrice: 0,
    dropFromMaps: [1, 2],
    dropRate: 0.02
  },
  {
    id: 3,
    name: '雷击术',
    description: '召唤雷电攻击敌人',
    type: 'active',
    rarity: 'common',
    maxLevel: 5,
    baseDamageMultiplier: 1.6,
    levelBonusMultiplier: 0.22,
    cooldown: 3,
    shopPrice: 0,
    dropFromMaps: [2, 3],
    dropRate: 0.02
  },
  {
    id: 4,
    name: '旋风斩',
    description: '挥舞武器形成旋风，攻击最多3个敌人',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 2.0,
    levelBonusMultiplier: 0.25,
    cooldown: 4,
    effect: 'aoe',
    hitCount: 3,
    shopPrice: 0,
    dropFromMaps: [3, 4],
    dropRate: 0.01
  },
  {
    id: 5,
    name: '烈焰斩',
    description: '以火焰附魔的强力斩击',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 2.2,
    levelBonusMultiplier: 0.28,
    cooldown: 4,
    effect: 'burn',
    effectValue: 5,
    shopPrice: 0,
    dropFromMaps: [4, 5],
    dropRate: 0.01
  },
  {
    id: 6,
    name: '冰封万里',
    description: '释放极寒之力，攻击最多4个敌人并冰冻',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 2.5,
    levelBonusMultiplier: 0.3,
    cooldown: 5,
    effect: 'freeze',
    effectValue: 1,
    hitCount: 4,
    shopPrice: 0,
    dropFromMaps: [5, 6],
    dropRate: 0.01
  },
  {
    id: 7,
    name: '雷霆万钧',
    description: '召唤天雷轰击敌人，威力巨大',
    type: 'active',
    rarity: 'epic',
    maxLevel: 5,
    baseDamageMultiplier: 3.0,
    levelBonusMultiplier: 0.35,
    cooldown: 6,
    effect: 'critBoost',
    effectValue: 30,
    shopPrice: 0,
    dropFromMaps: [7, 8],
    dropRate: 0.005
  },
  {
    id: 8,
    name: '破空斩',
    description: '无视防御的致命斩击',
    type: 'active',
    rarity: 'epic',
    maxLevel: 5,
    baseDamageMultiplier: 3.5,
    levelBonusMultiplier: 0.4,
    cooldown: 7,
    effect: 'pen',
    effectValue: 50,
    shopPrice: 0,
    dropFromMaps: [8, 9],
    dropRate: 0.005
  },
  {
    id: 9,
    name: '天降陨石',
    description: '召唤陨石从天而降，攻击最多5个敌人',
    type: 'active',
    rarity: 'legendary',
    maxLevel: 5,
    baseDamageMultiplier: 4.0,
    levelBonusMultiplier: 0.5,
    cooldown: 8,
    effect: 'aoe',
    hitCount: 5,
    shopPrice: 0,
    dropFromMaps: [10, 11],
    dropRate: 0.002
  },
  {
    id: 10,
    name: '灭世',
    description: '释放毁灭之力，造成惊天伤害',
    type: 'active',
    rarity: 'legendary',
    maxLevel: 5,
    baseDamageMultiplier: 5.0,
    levelBonusMultiplier: 0.6,
    cooldown: 10,
    shopPrice: 0,
    dropFromMaps: [11],
    dropRate: 0.001
  },
  // 被动技能 (5个)
  {
    id: 11,
    name: '铁壁',
    description: '增强防御力',
    type: 'passive',
    rarity: 'common',
    maxLevel: 5,
    bonusPerLevel: { defense: 5 },
    shopPrice: 0,
    dropFromMaps: [1, 2],
    dropRate: 0.02
  },
  {
    id: 12,
    name: '强壮',
    description: '增强攻击力',
    type: 'passive',
    rarity: 'common',
    maxLevel: 5,
    bonusPerLevel: { attack: 5 },
    shopPrice: 0,
    dropFromMaps: [1, 2],
    dropRate: 0.02
  },
  {
    id: 13,
    name: '生命强化',
    description: '增加最大生命值',
    type: 'passive',
    rarity: 'rare',
    maxLevel: 5,
    bonusPerLevel: { hp: 30 },
    shopPrice: 0,
    dropFromMaps: [3, 4, 5],
    dropRate: 0.01
  },
  {
    id: 14,
    name: '暴击精通',
    description: '提高暴击率',
    type: 'passive',
    rarity: 'rare',
    maxLevel: 5,
    bonusPerLevel: { critRate: 3 },
    shopPrice: 0,
    dropFromMaps: [4, 5, 6],
    dropRate: 0.01
  },
  {
    id: 15,
    name: '吸血',
    description: '攻击时回复生命',
    type: 'passive',
    rarity: 'epic',
    maxLevel: 5,
    bonusPerLevel: { lifesteal: 2 },
    shopPrice: 0,
    dropFromMaps: [7, 8, 9, 10],
    dropRate: 0.005
  },
  // 新增特色技能
  {
    id: 16,
    name: '蓄力一击',
    description: '蓄力1回合，下回合对2个敌人造成400%伤害',
    type: 'active',
    rarity: 'epic',
    maxLevel: 5,
    baseDamageMultiplier: 4.0,
    levelBonusMultiplier: 0.5,
    cooldown: 6,
    effect: 'charge',
    hitCount: 2,
    shopPrice: 0,
    dropFromMaps: [6, 7, 8],
    dropRate: 0.005
  },
  {
    id: 17,
    name: '治愈术',
    description: '根据攻击力恢复生命（80%攻击力）',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 0.8,
    levelBonusMultiplier: 0.1,
    cooldown: 5,
    effect: 'heal',
    shopPrice: 0,
    dropFromMaps: [3, 4, 5],
    dropRate: 0.01
  },
  {
    id: 18,
    name: '战意激发',
    description: '3回合内攻击力提升30%',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 0,
    levelBonusMultiplier: 0,
    cooldown: 8,
    effect: 'attackBuff',
    effectValue: 30,
    effectDuration: 3,
    shopPrice: 0,
    dropFromMaps: [4, 5, 6],
    dropRate: 0.01
  },
  {
    id: 19,
    name: '致命本能',
    description: '3回合内暴击率提升25%',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 0,
    levelBonusMultiplier: 0,
    cooldown: 8,
    effect: 'critBuff',
    effectValue: 25,
    effectDuration: 3,
    shopPrice: 0,
    dropFromMaps: [5, 6, 7],
    dropRate: 0.01
  },
  {
    id: 20,
    name: '铁甲术',
    description: '3回合内防御力提升50%',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    baseDamageMultiplier: 0,
    levelBonusMultiplier: 0,
    cooldown: 8,
    effect: 'defenseBuff',
    effectValue: 50,
    effectDuration: 3,
    shopPrice: 0,
    dropFromMaps: [3, 4, 5],
    dropRate: 0.01
  },
  {
    id: 21,
    name: '金钟罩',
    description: '生成护盾吸收相当于30%最大生命的伤害',
    type: 'active',
    rarity: 'epic',
    maxLevel: 5,
    baseDamageMultiplier: 0,
    levelBonusMultiplier: 0,
    cooldown: 10,
    effect: 'shield',
    effectValue: 30,
    shopPrice: 0,
    dropFromMaps: [7, 8, 9],
    dropRate: 0.005
  },
  {
    id: 22,
    name: '破釜沉舟',
    description: '消耗30%当前生命，造成500%伤害',
    type: 'active',
    rarity: 'legendary',
    maxLevel: 5,
    baseDamageMultiplier: 5.0,
    levelBonusMultiplier: 0.6,
    cooldown: 8,
    effect: 'sacrifice',
    effectValue: 30,
    shopPrice: 0,
    dropFromMaps: [9, 10, 11],
    dropRate: 0.002
  },
  // 新增坦克被动技能
  {
    id: 23,
    name: '坚韧',
    description: '受到的伤害降低',
    type: 'passive',
    rarity: 'rare',
    maxLevel: 5,
    bonusPerLevel: { damageReduction: 3 },
    shopPrice: 0,
    dropFromMaps: [4, 5, 6],
    dropRate: 0.01
  },
  {
    id: 24,
    name: '格挡大师',
    description: '提高闪避率',
    type: 'passive',
    rarity: 'rare',
    maxLevel: 5,
    bonusPerLevel: { dodge: 2 },
    shopPrice: 0,
    dropFromMaps: [5, 6, 7],
    dropRate: 0.01
  },
  {
    id: 25,
    name: '生命之源',
    description: '每回合恢复生命值',
    type: 'passive',
    rarity: 'epic',
    maxLevel: 5,
    bonusPerLevel: { hpRegen: 2 },
    shopPrice: 0,
    dropFromMaps: [8, 9, 10],
    dropRate: 0.005
  }
]

// 技能书数据（从技能生成）
export const skillBooks = skills.map(skill => ({
  skillId: skill.id,
  name: `${skill.name}技能书`,
  rarity: skill.rarity
}))

// 计算技能伤害倍率
export function getSkillDamage(skill, level) {
  if (skill.type !== 'active') return 0
  return skill.baseDamageMultiplier + skill.levelBonusMultiplier * (level - 1)
}

// 计算被动技能属性加成
export function getPassiveSkillStats(skill, level) {
  if (skill.type !== 'passive' || !skill.bonusPerLevel) return {}
  const stats = {}
  for (const [stat, perLevel] of Object.entries(skill.bonusPerLevel)) {
    stats[stat] = perLevel * level
  }
  return stats
}

// 技能升级所需经验（根据稀有度调整难度）
// 稀有度倍率: common=1, uncommon=1.3, rare=1.6, epic=2, legendary=2.5
const rarityExpMultiplier = {
  common: 1,
  uncommon: 1.3,
  rare: 1.6,
  epic: 2,
  legendary: 2.5
}

export function getSkillExpForLevel(level, rarity = 'common') {
  const baseExp = Math.floor(200 * level * (1 + level * 0.45))
  const multiplier = rarityExpMultiplier[rarity] || 1
  return Math.floor(baseExp * multiplier)
}

// 根据技能ID获取技能
export function getSkillById(skillId) {
  return skills.find(s => s.id === skillId)
}

// 技能书掉落逻辑
export function rollSkillBookDrop(mapId) {
  const droppableSkills = skills.filter(s =>
    s.dropFromMaps.includes(mapId) && s.dropRate > 0
  )
  for (const skill of droppableSkills) {
    if (Math.random() < skill.dropRate) {
      return { type: 'skillBook', skillId: skill.id }
    }
  }
  return null
}

// 生成装备函数
export function generateEquipment(level, slotType, forceQuality = null) {
  let quality = forceQuality
  if (!quality) {
    const roll = Math.random() * 100
    let cumulative = 0
    for (const [key, config] of Object.entries(qualityConfig)) {
      cumulative += config.dropRate
      if (roll < cumulative) {
        quality = key
        break
      }
    }
  }
  if (!quality) quality = 'white'

  const qualityData = qualityConfig[quality]
  const template = equipTemplates[slotType]
  const slot = equipSlots[slotType]

  // 计算属性
  const stats = {}
  for (const [stat, perLevel] of Object.entries(template)) {
    const value = perLevel * level * qualityData.statMultiplier
    stats[stat] = stat === 'dropRate' ? Math.round(value * 10) / 10 : Math.floor(value)
  }

  // 生成名称
  let name = ''
  let weaponType = null

  if (slotType === 'weapon') {
    const types = Object.keys(weaponTypes)
    const typeKey = types[Math.floor(Math.random() * types.length)]
    weaponType = typeKey
    const type = weaponTypes[typeKey]
    stats[type.secondaryStat] = Math.floor(type.secondaryValue * level * qualityData.statMultiplier * 10) / 10
    const prefixIndex = Math.min(Math.floor(level / 7), type.prefixes.length - 1)
    name = `${type.prefixes[prefixIndex]}${type.name}`
  } else {
    const suffixes = equipSuffixes[slotType]
    const suffixIndex = Math.min(Math.floor(level / 8), suffixes.length - 1)
    name = suffixes[suffixIndex]
  }

  // 装备等级要求 = 装备等级 - 5，最低1级
  const requiredLevel = Math.max(1, level - 5)

  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    slotType,
    weaponType,
    level,
    requiredLevel, // 装备需要的等级
    quality,
    qualityName: qualityData.name,
    qualityColor: qualityData.color,
    stats,
    icon: slot.icon,
    enhanceLevel: 0 // 强化等级，默认0
  }
}

// ==================== 装备强化系统 ====================

// 强化成功率（+6之后开始有失败概率）
export function getEnhanceSuccessRate(enhanceLevel) {
  if (enhanceLevel < 6) return 100
  const rates = {
    6: 80,   // +6 -> +7: 80%
    7: 65,   // +7 -> +8: 65%
    8: 50,   // +8 -> +9: 50%
    9: 35    // +9 -> +10: 35%
  }
  return rates[enhanceLevel] || 0
}

// 强化费用（基于装备等级和当前强化等级）
export function getEnhanceCost(equipLevel, enhanceLevel) {
  // 基础费用 = 装备等级 * 50
  // 每级强化费用倍增
  const baseCost = equipLevel * 50
  const levelMultiplier = Math.pow(1.5, enhanceLevel)
  return Math.floor(baseCost * levelMultiplier)
}

// 强化失败时掉落的等级数（1-3）
export function getEnhanceDropLevels(enhanceLevel) {
  if (enhanceLevel <= 6) return 0
  // +7及以上失败会掉1-3级
  const maxDrop = Math.min(3, enhanceLevel - 5)
  return Math.floor(Math.random() * maxDrop) + 1
}

// 计算强化后的属性加成（每级+5%）
export function getEnhanceBonus(enhanceLevel) {
  // +1=5%, +2=10%, +3=15%, ..., +10=50%
  return enhanceLevel * 0.05
}

// 计算强化后的实际属性值
export function getEnhancedStatValue(baseValue, enhanceLevel) {
  const bonus = getEnhanceBonus(enhanceLevel)
  return baseValue * (1 + bonus)
}

// ==================== 宠物系统 ====================

// 宠物品质配置
export const petQualityConfig = {
  white: { name: '普通', color: '#ffffff', statMultiplier: 1, captureRate: 15 },
  green: { name: '优秀', color: '#2ecc71', statMultiplier: 1.3, captureRate: 10 },
  blue: { name: '精良', color: '#3498db', statMultiplier: 1.6, captureRate: 6 },
  purple: { name: '史诗', color: '#9b59b6', statMultiplier: 2, captureRate: 3 },
  orange: { name: '传说', color: '#e67e22', statMultiplier: 2.5, captureRate: 1 }
}

// 宠物种类（每个地图可捕获的宠物）
export const petTypes = [
  // 新手村
  { id: 1, name: '小狐狸', mapId: 1, baseLevel: 1, icon: '🦊', skillPool: [1, 2] },
  { id: 2, name: '野兔精', mapId: 1, baseLevel: 2, icon: '🐰', skillPool: [1, 10] },
  // 黑风林
  { id: 3, name: '黑狼', mapId: 2, baseLevel: 8, icon: '🐺', skillPool: [2, 3, 11] },
  { id: 4, name: '毒蛇', mapId: 2, baseLevel: 10, icon: '🐍', skillPool: [3, 10] },
  // 落日峰
  { id: 5, name: '火鸦', mapId: 3, baseLevel: 18, icon: '🐦', skillPool: [1, 4, 12] },
  { id: 6, name: '石傀儡', mapId: 3, baseLevel: 20, icon: '🗿', skillPool: [10, 11] },
  // 血月谷
  { id: 7, name: '血蝠', mapId: 4, baseLevel: 28, icon: '🦇', skillPool: [5, 15, 12] },
  { id: 8, name: '骷髅兵', mapId: 4, baseLevel: 30, icon: '💀', skillPool: [4, 11] },
  // 龙脊山脉
  { id: 9, name: '幼龙', mapId: 5, baseLevel: 38, icon: '🐲', skillPool: [6, 4, 12] },
  { id: 10, name: '雷鹰', mapId: 5, baseLevel: 40, icon: '🦅', skillPool: [3, 6, 13] },
  // 天魔峡
  { id: 11, name: '魔灵', mapId: 6, baseLevel: 45, icon: '👻', skillPool: [7, 5, 14] },
  { id: 12, name: '炎魔', mapId: 6, baseLevel: 48, icon: '👹', skillPool: [1, 7, 12] },
  // 虚空裂隙
  { id: 13, name: '虚空兽', mapId: 7, baseLevel: 52, icon: '🌀', skillPool: [8, 14, 13] },
  { id: 14, name: '星灵', mapId: 7, baseLevel: 55, icon: '✨', skillPool: [6, 8, 15] },
  // 混沌深渊
  { id: 15, name: '混沌幼兽', mapId: 8, baseLevel: 58, icon: '🌑', skillPool: [9, 7, 14] },
  { id: 16, name: '远古魔神', mapId: 8, baseLevel: 60, icon: '😈', skillPool: [9, 8, 15] }
]

// 根据地图获取可捕获的宠物
export function getPetsByMap(mapId) {
  return petTypes.filter(p => p.mapId === mapId)
}

// 资质系数计算（资质1-10对应0.55-1.0的成长系数）
export function getAptitudeMultiplier(aptitude) {
  return 0.5 + aptitude * 0.05
}

// 计算宠物某一级的属性（基于初始属性+等级成长）
export function calculatePetStats(level, quality, aptitude) {
  const qualityData = petQualityConfig[quality]
  const qualityMult = qualityData.statMultiplier
  const aptMult = getAptitudeMultiplier(aptitude)

  // 基础成长值（比玩家低）
  // 玩家每级: HP+10, 攻击+3, 防御+2
  // 宠物基础每级: HP+4, 攻击+1.2, 防御+0.8
  const hpGrowth = 4 * aptMult * qualityMult
  const atkGrowth = 1.2 * aptMult * qualityMult
  const defGrowth = 0.8 * aptMult * qualityMult

  // 初始属性 + 等级成长
  const baseHp = Math.floor(80 + level * hpGrowth)
  const baseAttack = Math.floor(8 + level * atkGrowth)
  const baseDefense = Math.floor(4 + level * defGrowth)

  return { baseHp, baseAttack, baseDefense }
}

// 生成宠物实例
export function generatePet(petTypeId, level, forceQuality = null, maxAptitude = 8) {
  const petType = petTypes.find(p => p.id === petTypeId)
  if (!petType) return null

  // 随机品质
  let quality = forceQuality
  if (!quality) {
    const roll = Math.random() * 100
    if (roll < 1) quality = 'orange'
    else if (roll < 5) quality = 'purple'
    else if (roll < 15) quality = 'blue'
    else if (roll < 35) quality = 'green'
    else quality = 'white'
  }

  const qualityData = petQualityConfig[quality]

  // 随机资质（1到maxAptitude，高资质概率低）
  // 资质分布：低资质多，高资质少
  let aptitude
  const aptRoll = Math.random() * 100
  if (aptRoll < 5 && maxAptitude >= 8) aptitude = Math.min(8, maxAptitude)        // 5%概率最高资质
  else if (aptRoll < 15 && maxAptitude >= 7) aptitude = Math.min(7, maxAptitude)  // 10%概率7资质
  else if (aptRoll < 30 && maxAptitude >= 6) aptitude = Math.min(6, maxAptitude)  // 15%概率6资质
  else if (aptRoll < 50 && maxAptitude >= 5) aptitude = Math.min(5, maxAptitude)  // 20%概率5资质
  else if (aptRoll < 70 && maxAptitude >= 4) aptitude = Math.min(4, maxAptitude)  // 20%概率4资质
  else if (aptRoll < 85 && maxAptitude >= 3) aptitude = Math.min(3, maxAptitude)  // 15%概率3资质
  else if (aptRoll < 95 && maxAptitude >= 2) aptitude = Math.min(2, maxAptitude)  // 10%概率2资质
  else aptitude = 1                                                                // 5%概率1资质

  // 计算属性
  const stats = calculatePetStats(level, quality, aptitude)

  // 随机选择1-2个技能
  const numSkills = Math.random() < 0.3 ? 2 : 1
  const petSkills = []
  const availableSkills = [...petType.skillPool]
  for (let i = 0; i < numSkills && availableSkills.length > 0; i++) {
    const idx = Math.floor(Math.random() * availableSkills.length)
    petSkills.push(availableSkills.splice(idx, 1)[0])
  }

  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    typeId: petType.id,
    name: petType.name,
    icon: petType.icon,
    level,
    exp: 0,
    quality,
    qualityName: qualityData.name,
    qualityColor: qualityData.color,
    // 资质（1-10）
    aptitude,
    // 属性
    baseHp: stats.baseHp,
    baseAttack: stats.baseAttack,
    baseDefense: stats.baseDefense,
    critRate: 5 + Math.floor(level / 10),
    critDamage: 50,
    dodge: 3,
    hit: 95,
    // 技能（技能ID数组）
    skills: petSkills,
    skillLevels: petSkills.reduce((acc, id) => { acc[id] = 1; return acc }, {}),
    // 当前状态
    currentHp: stats.baseHp
  }
}

// 计算宠物升级所需经验
export function getPetExpForLevel(level) {
  return Math.floor(100 * level * (1 + level * 0.2))
}

// 计算宠物战斗属性
export function getPetStats(pet) {
  if (!pet) return null
  return {
    maxHp: pet.baseHp,
    attack: pet.baseAttack,
    defense: pet.baseDefense,
    critRate: pet.critRate,
    critDamage: pet.critDamage,
    dodge: pet.dodge,
    hit: pet.hit
  }
}

// 生成宠物蛋（只有10/100/200层可获得）
export function generatePetEgg(towerFloor) {
  // 根据层数决定蛋的品质范围和资质上限
  let qualityPool = []
  let eggName = ''
  let maxAptitude = 8 // 孵化最高资质8

  if (towerFloor === 10) {
    // 10层：最高精良，资质上限6
    qualityPool = ['white', 'white', 'green', 'green', 'blue']
    eggName = '初级宠物蛋'
    maxAptitude = 6
  } else if (towerFloor === 100) {
    // 100层：最高史诗，资质上限7
    qualityPool = ['green', 'blue', 'blue', 'purple']
    eggName = '高级宠物蛋'
    maxAptitude = 7
  } else if (towerFloor === 200) {
    // 200层：最高传说，资质上限8
    qualityPool = ['blue', 'purple', 'purple', 'orange']
    eggName = '至尊宠物蛋'
    maxAptitude = 8
  } else {
    return null // 其他层数不掉落
  }

  const quality = qualityPool[Math.floor(Math.random() * qualityPool.length)]
  const qualityData = petQualityConfig[quality]

  return {
    id: `petegg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'petEgg',
    name: eggName,
    quality,
    qualityName: qualityData.name,
    qualityColor: qualityData.color,
    towerFloor, // 记录获取时的层数，用于决定宠物等级
    maxAptitude // 资质上限
  }
}

// 生成资质丹
export function generateAptitudePill(towerFloor) {
  if (towerFloor === 90) {
    return {
      id: `aptpill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'aptitudePill',
      name: '资质丹',
      tier: 1,
      minBoost: 0.05,
      maxBoost: 0.09,
      maxAptitude: 9, // 最高培养到9
      color: '#3498db'
    }
  } else if (towerFloor === 190) {
    return {
      id: `aptpill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'aptitudePill',
      name: '高级资质丹',
      tier: 2,
      minBoost: 0.01,
      maxBoost: 0.05,
      maxAptitude: 10, // 最高培养到10
      color: '#9b59b6'
    }
  }
  return null
}

// 孵化宠物蛋（返回宠物或null）
export function hatchPetEgg(petEgg) {
  if (!petEgg || petEgg.type !== 'petEgg') return null

  // 随机选择一个宠物类型
  const petType = petTypes[Math.floor(Math.random() * petTypes.length)]

  // 宠物等级基于获取蛋时的塔层
  const petLevel = Math.max(1, Math.min(60, petEgg.towerFloor + 5))

  // 使用蛋的资质上限
  const maxAptitude = petEgg.maxAptitude || 8

  return generatePet(petType.id, petLevel, petEgg.quality, maxAptitude)
}
