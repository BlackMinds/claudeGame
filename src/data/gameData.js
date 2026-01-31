// 仙修境界 - 平衡型：生命+5% 攻击+5% 防御+5%
export const xianRealms = [
  { id: 1, name: '凡人', minExp: 0, hpBonus: 0, attackBonus: 0, defenseBonus: 0, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 2, name: '炼气期', minExp: 4500, hpBonus: 5, attackBonus: 5, defenseBonus: 5, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 3, name: '筑基期', minExp: 18000, hpBonus: 10, attackBonus: 10, defenseBonus: 10, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 4, name: '金丹期', minExp: 75000, hpBonus: 15, attackBonus: 15, defenseBonus: 15, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 5, name: '元婴期', minExp: 300000, hpBonus: 20, attackBonus: 20, defenseBonus: 20, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 6, name: '化神期', minExp: 1050000, hpBonus: 25, attackBonus: 25, defenseBonus: 25, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 7, name: '炼虚期', minExp: 3600000, hpBonus: 30, attackBonus: 30, defenseBonus: 30, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 8, name: '合体期', minExp: 12000000, hpBonus: 35, attackBonus: 35, defenseBonus: 35, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 9, name: '大乘期', minExp: 36000000, hpBonus: 40, attackBonus: 40, defenseBonus: 40, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 10, name: '渡劫期', minExp: 105000000, hpBonus: 45, attackBonus: 45, defenseBonus: 45, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 11, name: '真仙', minExp: 300000000, hpBonus: 50, attackBonus: 50, defenseBonus: 50, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 12, name: '天仙', minExp: 900000000, hpBonus: 55, attackBonus: 55, defenseBonus: 55, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 }
]

// 魔修境界 - 攻击型：生命+2% 攻击+8% 防御+0% 吸血+2%
export const moRealms = [
  { id: 1, name: '凡人', minExp: 0, hpBonus: 0, attackBonus: 0, defenseBonus: 0, lifestealBonus: 0, healBonus: 0, healReceivedBonus: 0 },
  { id: 2, name: '凝煞期', minExp: 4500, hpBonus: 2, attackBonus: 8, defenseBonus: 0, lifestealBonus: 2, healBonus: 0, healReceivedBonus: 0 },
  { id: 3, name: '魔童期', minExp: 18000, hpBonus: 4, attackBonus: 16, defenseBonus: 0, lifestealBonus: 4, healBonus: 0, healReceivedBonus: 0 },
  { id: 4, name: '魔丹期', minExp: 75000, hpBonus: 6, attackBonus: 24, defenseBonus: 0, lifestealBonus: 6, healBonus: 0, healReceivedBonus: 0 },
  { id: 5, name: '魔婴期', minExp: 300000, hpBonus: 8, attackBonus: 32, defenseBonus: 0, lifestealBonus: 8, healBonus: 0, healReceivedBonus: 0 },
  { id: 6, name: '化魔期', minExp: 1050000, hpBonus: 10, attackBonus: 40, defenseBonus: 0, lifestealBonus: 10, healBonus: 0, healReceivedBonus: 0 },
  { id: 7, name: '炼域期', minExp: 3600000, hpBonus: 12, attackBonus: 48, defenseBonus: 0, lifestealBonus: 12, healBonus: 0, healReceivedBonus: 0 },
  { id: 8, name: '自在期', minExp: 12000000, hpBonus: 14, attackBonus: 56, defenseBonus: 0, lifestealBonus: 14, healBonus: 0, healReceivedBonus: 0 },
  { id: 9, name: '真魔期', minExp: 36000000, hpBonus: 16, attackBonus: 64, defenseBonus: 0, lifestealBonus: 16, healBonus: 0, healReceivedBonus: 0 },
  { id: 10, name: '逆劫期', minExp: 105000000, hpBonus: 18, attackBonus: 72, defenseBonus: 0, lifestealBonus: 18, healBonus: 0, healReceivedBonus: 0 },
  { id: 11, name: '真魔', minExp: 300000000, hpBonus: 20, attackBonus: 80, defenseBonus: 0, lifestealBonus: 20, healBonus: 0, healReceivedBonus: 0 },
  { id: 12, name: '玄魔', minExp: 900000000, hpBonus: 22, attackBonus: 88, defenseBonus: 0, lifestealBonus: 22, healBonus: 0, healReceivedBonus: 0 }
]

// 兼容旧代码，默认使用仙修
export const realms = xianRealms

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
  armor: ['布衣', '皮甲', '锁甲', '玄甲', '宝衣', '仙袍', '神衣', '天衣', '圣袍', '混沌衣'],
  helmet: ['布巾', '头环', '发冠', '宝冠', '仙冠', '神冕', '天冠', '帝冕', '圣冕', '混沌冠'],
  ring: ['铜戒', '银戒', '金戒', '玉戒', '灵戒', '仙戒', '神戒', '天戒', '圣戒', '混沌戒'],
  necklace: ['麻绳', '铜链', '银链', '金链', '玉链', '灵链', '仙链', '神链', '圣链', '混沌链'],
  boots: ['草鞋', '布靴', '皮靴', '铁靴', '玄靴', '灵靴', '仙靴', '神靴', '圣靴', '混沌靴'],
  artifact: ['木符', '玉佩', '铜镜', '灵珠', '宝塔', '仙剑', '神印', '混沌珠', '圣物', '鸿蒙珠']
}

// ==================== 装备子类型系统 ====================
// 每种装备槽位有多个子类型，提供不同的属性加成方向

export const armorSubTypes = {
  cloth: {
    name: '布甲',
    description: '轻便灵活，提升闪避',
    statBonus: { dodge: 0.15, hp: -0.1 },
    prefixes: ['轻灵', '风行', '云游', '幻影', '虚空']
  },
  leather: {
    name: '皮甲',
    description: '攻守兼备，平衡之选',
    statBonus: { hp: 0.1, attack: 0.05 },
    prefixes: ['猎手', '游侠', '刺客', '暗夜', '疾风']
  },
  heavy: {
    name: '重甲',
    description: '坚固厚重，防御极强',
    statBonus: { defense: 0.3, hp: 0.15, dodge: -0.1 },
    prefixes: ['铁壁', '磐石', '不动', '金刚', '泰山']
  }
}

export const helmetSubTypes = {
  crown: {
    name: '法冠',
    description: '蕴含法力，提升暴击伤害',
    statBonus: { critDamage: 0.2, attack: 0.05 },
    prefixes: ['智慧', '启迪', '灵光', '天启', '至高']
  },
  helm: {
    name: '战盔',
    description: '坚固护头，提升防御',
    statBonus: { defense: 0.2, hp: 0.1 },
    prefixes: ['勇士', '战神', '征服', '霸王', '无畏']
  },
  mask: {
    name: '面具',
    description: '神秘莫测，提升闪避',
    statBonus: { dodge: 0.12, critRate: 0.08 },
    prefixes: ['幻面', '鬼面', '影面', '魔面', '神面']
  }
}

export const ringSubTypes = {
  attack: {
    name: '战戒',
    description: '凝聚战意，提升攻击',
    statBonus: { attack: 0.15, critRate: 0.05 },
    prefixes: ['狂战', '嗜血', '杀戮', '毁灭', '灭世']
  },
  defense: {
    name: '守戒',
    description: '护体之力，提升防御',
    statBonus: { defense: 0.15, hp: 0.08 },
    prefixes: ['守护', '坚韧', '不屈', '永固', '万古']
  },
  special: {
    name: '秘戒',
    description: '蕴含特殊之力',
    statBonus: { penetration: 0.1, lifesteal: 0.05 },
    prefixes: ['秘法', '奥术', '神秘', '太古', '混沌']
  }
}

export const necklaceSubTypes = {
  spirit: {
    name: '灵珠链',
    description: '灵气汇聚，提升攻击',
    statBonus: { attack: 0.12, critDamage: 0.1 },
    prefixes: ['聚灵', '凝气', '引灵', '吸元', '夺天']
  },
  guard: {
    name: '护心链',
    description: '守护心脉，提升生命',
    statBonus: { hp: 0.15, damageReduction: 0.05 },
    prefixes: ['护心', '养神', '固本', '培元', '长生']
  },
  ward: {
    name: '辟邪链',
    description: '驱邪避害，提升抗性',
    statBonus: { critResist: 0.15, defense: 0.05 },
    prefixes: ['辟邪', '镇魔', '伏妖', '降魔', '灭邪']
  }
}

export const bootsSubTypes = {
  light: {
    name: '轻靴',
    description: '轻盈迅捷，闪避极高',
    statBonus: { dodge: 0.2, hit: 0.05 },
    prefixes: ['疾风', '闪电', '流光', '幻影', '瞬移']
  },
  war: {
    name: '战靴',
    description: '稳健有力，攻防兼备',
    statBonus: { defense: 0.1, attack: 0.05, hp: 0.05 },
    prefixes: ['战神', '征服', '铁蹄', '践踏', '碾压']
  },
  spirit: {
    name: '灵靴',
    description: '灵动飘逸，命中精准',
    statBonus: { hit: 0.15, critRate: 0.05 },
    prefixes: ['踏云', '凌波', '御风', '乘龙', '逐日']
  }
}

export const artifactSubTypes = {
  attack: {
    name: '杀伐法宝',
    description: '蕴含杀伐之力，攻击暴击双增',
    statBonus: { attack: 0.1, critRate: 0.08, critDamage: 0.15 },
    prefixes: ['诛仙', '斩神', '弑魔', '屠龙', '灭世']
  },
  defense: {
    name: '护体法宝',
    description: '护体保命，防御生命双增',
    statBonus: { defense: 0.1, hp: 0.12, damageReduction: 0.03 },
    prefixes: ['护法', '金身', '不灭', '永恒', '万劫']
  },
  balance: {
    name: '混元法宝',
    description: '阴阳调和，诸般属性均衡',
    statBonus: { attack: 0.05, defense: 0.05, hp: 0.05, critRate: 0.03, dodge: 0.03 },
    prefixes: ['太极', '混元', '无极', '鸿蒙', '造化']
  }
}

// ==================== 装备特效系统 ====================

export const equipmentEffects = {
  reflect: {
    name: '反伤',
    description: '反弹受到伤害的一部分',
    valueRange: [5, 15],
    icon: '🔄'
  },
  lifesteal: {
    name: '吸血',
    description: '攻击时回复生命',
    valueRange: [3, 10],
    icon: '🩸'
  },
  shield: {
    name: '护盾',
    description: '战斗开始获得护盾',
    valueRange: [5, 15],
    icon: '🛡️'
  },
  lightning: {
    name: '雷击',
    description: '攻击时有概率造成额外伤害',
    valueRange: [10, 25],
    icon: '⚡'
  },
  freeze: {
    name: '冰冻',
    description: '攻击时有概率降低敌人闪避',
    valueRange: [5, 15],
    icon: '❄️'
  },
  burn: {
    name: '灼烧',
    description: '攻击时有概率造成持续伤害',
    valueRange: [3, 8],
    icon: '🔥'
  },
  heal: {
    name: '回春',
    description: '每回合回复生命',
    valueRange: [1, 5],
    icon: '💚'
  },
  critical: {
    name: '致命',
    description: '暴击时额外提升暴击伤害',
    valueRange: [10, 30],
    icon: '💥'
  },
  penetrate: {
    name: '破甲',
    description: '无视敌人部分防御',
    valueRange: [5, 15],
    icon: '🗡️'
  },
  dodge: {
    name: '幻影',
    description: '受到攻击时有概率闪避',
    valueRange: [3, 10],
    icon: '💨'
  }
}

// ==================== 装备套装系统 ====================

export const equipmentSets = {
  xuanwu: {
    name: '玄武套装',
    description: '玄武守护，防御为王',
    color: '#3498db',
    pieces: ['armor', 'helmet', 'boots'],
    bonuses: {
      2: { hp: 10, defense: 10, description: '生命+10%, 防御+10%' },
      3: { hp: 15, defense: 20, damageReduction: 5, description: '生命+15%, 防御+20%, 伤害减免+5%' }
    }
  },
  zhuque: {
    name: '朱雀套装',
    description: '朱雀之焰，攻击至上',
    color: '#e74c3c',
    pieces: ['weapon', 'ring', 'necklace'],
    bonuses: {
      2: { attack: 12, critRate: 5, description: '攻击+12%, 暴击+5%' },
      3: { attack: 20, critRate: 10, critDamage: 15, description: '攻击+20%, 暴击+10%, 暴伤+15%' }
    }
  },
  qinglong: {
    name: '青龙套装',
    description: '青龙之力，攻守兼备',
    color: '#2ecc71',
    pieces: ['weapon', 'armor', 'artifact'],
    bonuses: {
      2: { attack: 8, defense: 8, description: '攻击+8%, 防御+8%' },
      3: { attack: 15, defense: 15, hp: 10, description: '攻击+15%, 防御+15%, 生命+10%' }
    }
  },
  baihu: {
    name: '白虎套装',
    description: '白虎狂啸，爆发惊人',
    color: '#f39c12',
    pieces: ['weapon', 'helmet', 'ring'],
    bonuses: {
      2: { critDamage: 15, penetration: 8, description: '暴伤+15%, 穿透+8%' },
      3: { critDamage: 30, penetration: 15, critRate: 8, description: '暴伤+30%, 穿透+15%, 暴击+8%' }
    }
  },
  qilin: {
    name: '麒麟套装',
    description: '麒麟献瑞，全能之选',
    color: '#9b59b6',
    pieces: ['necklace', 'boots', 'artifact'],
    bonuses: {
      2: { hp: 5, attack: 5, defense: 5, description: '生命+5%, 攻击+5%, 防御+5%' },
      3: { hp: 10, attack: 10, defense: 10, critRate: 5, dodge: 5, description: '全属性+10%, 暴击+5%, 闪避+5%' }
    }
  },
  hundun: {
    name: '混沌套装',
    description: '混沌之力，超越极限',
    color: '#8e44ad',
    pieces: ['weapon', 'armor', 'helmet', 'ring', 'necklace', 'boots', 'artifact'],
    bonuses: {
      3: { attack: 10, defense: 10, hp: 10, description: '攻击+10%, 防御+10%, 生命+10%' },
      5: { attack: 20, defense: 20, hp: 20, critRate: 10, description: '攻击+20%, 防御+20%, 生命+20%, 暴击+10%' },
      7: { attack: 35, defense: 35, hp: 35, critRate: 15, critDamage: 25, penetration: 10, description: '全属性+35%, 暴击+15%, 暴伤+25%, 穿透+10%' }
    }
  }
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

// 地图难度倍率（后期地图怪物更强，但保持合理范围）
const mapDifficultyMultiplier = {
  '新手村外': 1,
  '青云山脚': 1.0,
  '幽暗森林': 1.5,
  '妖兽山脉': 1.8,
  '元素秘境': 2.2,
  '魔渊边境': 2.6,
  '魔渊深处': 3.0,
  '天魔战场': 3.5,
  '混沌裂隙': 4.0,
  '上古遗迹': 4.5,
  '天道试炼': 5.0,
  // 60-100级新地图
  '神魔战场': 5.5,
  '九幽冥界': 6.0,
  '仙界边境': 10.0,
  '太虚星域': 12.0,
  '万妖圣地': 18.0,
  '诸天神域': 22.0,
  '鸿蒙秘境': 34.0
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
    { level: [57, 60], names: ['混沌兽', '天道傀儡', '轮回守卫'], location: '天道试炼' },
    // 60-100级新怪物
    { level: [61, 64], names: ['神战遗灵', '魔战亡魂', '天罚使者'], location: '神魔战场' },
    { level: [65, 68], names: ['九幽鬼王', '冥河判官', '阴司阎罗'], location: '九幽冥界' },
    { level: [69, 72], names: ['幽冥龙蛇', '地狱三头犬', '冥界死神'], location: '九幽冥界' },
    { level: [73, 76], names: ['仙界门卫', '云霄仙使', '天兵天将'], location: '仙界边境' },
    { level: [77, 80], names: ['堕落仙人', '叛逆神将', '噬天魔君'], location: '仙界边境' },
    { level: [81, 84], names: ['星辰巨兽', '虚空吞噬者', '星域守护'], location: '太虚星域' },
    { level: [85, 88], names: ['混沌星魔', '太虚幻灵', '星河古龙'], location: '太虚星域' },
    { level: [89, 92], names: ['万妖之主', '妖皇分身', '至尊妖帝'], location: '万妖圣地' },
    { level: [93, 96], names: ['诸天神使', '护法金刚', '天界战神'], location: '诸天神域' },
    { level: [97, 100], names: ['鸿蒙巨兽', '太初神魔', '混沌始祖'], location: '鸿蒙秘境' }
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
          // 特殊属性：固定随机范围
          critRate: Math.floor(Math.random() * 60) + 1,      // 暴击率 1%-60%
          dodge: Math.floor(Math.random() * 40) + 1,         // 闪避率 1%-40%
          penetration: Math.floor(Math.random() * 25) + 1,   // 穿透 1%-25%
          lifesteal: Math.floor(Math.random() * 20) + 1,     // 吸血 1%-20%
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
    { id: 11, name: '天道试炼', description: '天道设下的终极试炼，唯强者可入', levelRange: [57, 60], requiredLevel: 57 },
    // 60-100级新地图
    { id: 12, name: '神魔战场', description: '上古神魔大战遗址，充满残留的神魔之力', levelRange: [61, 68], requiredLevel: 61 },
    { id: 13, name: '九幽冥界', description: '通往冥界的入口，阴气森森，亡魂游荡', levelRange: [65, 72], requiredLevel: 65 },
    { id: 14, name: '仙界边境', description: '凡仙交界之地，仙气与魔气交汇', levelRange: [73, 80], requiredLevel: 73 },
    { id: 15, name: '太虚星域', description: '星辰之力汇聚的虚空领域，蕴含无尽奥秘', levelRange: [81, 88], requiredLevel: 81 },
    { id: 16, name: '万妖圣地', description: '妖族圣地，万妖朝拜之所，妖气冲天', levelRange: [85, 92], requiredLevel: 85 },
    { id: 17, name: '诸天神域', description: '诸天神明的领域，神威浩荡', levelRange: [93, 96], requiredLevel: 93 },
    { id: 18, name: '鸿蒙秘境', description: '宇宙诞生之初的混沌之地，蕴含天地至理', levelRange: [97, 100], requiredLevel: 97 }
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
      // 特殊属性：锁妖塔怪物更强（固定随机范围）
      critRate: Math.floor(Math.random() * 61) + 20,    // 暴击率 20%-80%
      dodge: Math.floor(Math.random() * 21) + 20,       // 闪避率 20%-40%
      penetration: Math.floor(Math.random() * 21) + 20, // 穿透 20%-40%
      lifesteal: Math.floor(Math.random() * 11) + 10,   // 吸血 10%-20%
      exp: Math.floor((20 + floor * 8) * difficultyMult),
      gold: Math.floor((15 + floor * 5) * difficultyMult),
      dropRate: Math.min(30, 10 + floor * 0.5), // 锁妖塔掉落率更高
      currentHp: Math.floor(baseHp * difficultyMult),
      skills: getRandomSkills(monsterLevel),
      buffs: {},
      debuffs: {},
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
    description: '蓄力1回合，下回合对4个敌人造成400%伤害，并使其易伤3回合（受伤+20%）',
    type: 'active',
    rarity: 'epic',
    maxLevel: 5,
    baseDamageMultiplier: 4.0,
    levelBonusMultiplier: 0.5,
    cooldown: 6,
    effect: 'charge',
    hitCount: 4,
    debuff: 'vulnerable',
    debuffValue: 20,
    debuffDuration: 3,
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
  },
  // ========== 宠物专属技能 (ID: 101-116) ==========
  // 每个宠物孵化时固定携带的技能
  {
    id: 101,
    name: '狐仙治愈',
    description: '治愈主人，恢复主人15%最大生命值',
    type: 'petSkill',
    rarity: 'rare',
    maxLevel: 10,
    effect: 'healOwner',
    effectValue: 15,
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 102,
    name: '疾风步',
    description: '3回合内提升主人20%闪避率',
    type: 'petSkill',
    rarity: 'rare',
    maxLevel: 10,
    effect: 'ownerDodgeBuff',
    effectValue: 20,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 103,
    name: '撕咬',
    description: '凶猛撕咬敌人，造成150%伤害并使其流血3回合',
    type: 'petSkill',
    rarity: 'common',
    maxLevel: 10,
    baseDamageMultiplier: 1.5,
    effect: 'bleed',
    effectValue: 5,
    effectDuration: 3,
    cooldown: 3,
    petExclusive: true
  },
  {
    id: 104,
    name: '剧毒噬咬',
    description: '毒牙攻击，造成120%伤害并使敌人中毒4回合',
    type: 'petSkill',
    rarity: 'common',
    maxLevel: 10,
    baseDamageMultiplier: 1.2,
    effect: 'poison',
    effectValue: 3,
    effectDuration: 4,
    cooldown: 3,
    petExclusive: true
  },
  {
    id: 105,
    name: '烈焰俯冲',
    description: '从空中俯冲攻击，造成180%火焰伤害并有30%几率灼烧敌人',
    type: 'petSkill',
    rarity: 'rare',
    maxLevel: 10,
    baseDamageMultiplier: 1.8,
    effect: 'burn',
    effectValue: 30,
    effectDuration: 2,
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 106,
    name: '石化护盾',
    description: '为主人生成护盾，吸收相当于宠物50%生命值的伤害',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'ownerShield',
    effectValue: 50,
    cooldown: 8,
    petExclusive: true
  },
  {
    id: 107,
    name: '吸血噬咬',
    description: '吸取敌人生命，造成140%伤害并回复伤害50%的生命',
    type: 'petSkill',
    rarity: 'rare',
    maxLevel: 10,
    baseDamageMultiplier: 1.4,
    effect: 'lifesteal',
    effectValue: 50,
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 108,
    name: '亡灵诅咒',
    description: '诅咒敌人，3回合内敌人受到伤害增加25%',
    type: 'petSkill',
    rarity: 'rare',
    maxLevel: 10,
    effect: 'curse',
    effectValue: 25,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 109,
    name: '龙息',
    description: '喷吐龙焰，对所有敌人造成200%伤害',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 2.0,
    effect: 'aoe',
    hitCount: 99,
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 110,
    name: '雷霆俯冲',
    description: '携带雷电俯冲攻击，造成170%伤害并有20%几率眩晕敌人',
    type: 'petSkill',
    rarity: 'rare',
    maxLevel: 10,
    baseDamageMultiplier: 1.7,
    effect: 'stun',
    effectValue: 20,
    effectDuration: 1,
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 111,
    name: '灵魂侵蚀',
    description: '无视防御的灵魂攻击，造成160%真实伤害',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 1.6,
    effect: 'trueDamage',
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 112,
    name: '地狱业火',
    description: '召唤地狱之火，对所有敌人造成180%伤害并灼烧3回合',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 1.8,
    effect: 'aoe',
    hitCount: 99,
    burn: true,
    burnDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 113,
    name: '虚空侵蚀',
    description: '侵蚀敌人，3回合内敌人攻击力降低30%',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'weaken',
    effectValue: 30,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 114,
    name: '星光祝福',
    description: '祝福主人，3回合内暴击率+30%，暴击伤害+50%',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'ownerCritBuff',
    critRateBonus: 30,
    critDamageBonus: 50,
    effectDuration: 3,
    cooldown: 7,
    petExclusive: true
  },
  {
    id: 115,
    name: '混沌冲击',
    description: '释放混沌能量，造成250%伤害并随机附加负面效果',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 2.5,
    effect: 'chaos',
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 116,
    name: '神罚',
    description: '召唤神罚，对单体造成400%毁灭性伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 4.0,
    cooldown: 8,
    petExclusive: true
  },
  // ========== 宠物隐藏技能 (ID: 201-216) ==========
  // 孵化时有10%概率获得
  {
    id: 201,
    name: '魅惑',
    description: '魅惑敌人，30%几率使其眩晕2回合',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'charm',
    effectValue: 30,
    effectDuration: 2,
    cooldown: 7,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 202,
    name: '幻影分身',
    description: '创造幻影，3回合内闪避率+50%',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'superDodge',
    effectValue: 50,
    effectDuration: 3,
    cooldown: 8,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 203,
    name: '狼嚎',
    description: '激励主人，3回合内主人攻击力+40%',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'ownerAttackBuff',
    effectValue: 40,
    effectDuration: 3,
    cooldown: 7,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 204,
    name: '致命剧毒',
    description: '释放致命毒素，使敌人中毒5回合（每回合损失8%生命）',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'deadlyPoison',
    effectValue: 8,
    effectDuration: 5,
    cooldown: 6,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 205,
    name: '浴火重生',
    description: '死亡时有50%几率复活并恢复30%生命（每场战斗限1次）',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'phoenixRebirth',
    effectValue: 30,
    reviveChance: 50,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 206,
    name: '嘲讽',
    description: '嘲讽敌人，2回合内敌人只能攻击宠物',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'taunt',
    effectDuration: 2,
    cooldown: 6,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 207,
    name: '血之狂欢',
    description: '进入狂暴状态，3回合内攻击力+50%且吸血100%',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'bloodFrenzy',
    attackBonus: 50,
    lifestealBonus: 100,
    effectDuration: 3,
    cooldown: 8,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 208,
    name: '亡灵召唤',
    description: '召唤亡灵助战，对敌人额外造成3次80%伤害',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 0.8,
    effect: 'summon',
    hitCount: 3,
    cooldown: 6,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 209,
    name: '龙威',
    description: '释放龙威，3回合内敌人攻击力-40%',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'dragonMight',
    effectValue: 40,
    effectDuration: 3,
    cooldown: 7,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 210,
    name: '闪电链',
    description: '释放闪电链，对所有敌人造成150%伤害并有15%几率眩晕',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 1.5,
    effect: 'chainLightning',
    stunChance: 15,
    hitCount: 99,
    cooldown: 5,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 211,
    name: '灵魂吞噬',
    description: '吞噬敌人灵魂，造成200%真实伤害并恢复等量生命',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 2.0,
    effect: 'soulDevour',
    cooldown: 7,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 212,
    name: '烈焰之躯',
    description: '点燃自身，3回合内反弹受到伤害的30%给攻击者',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'flameBody',
    effectValue: 30,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 213,
    name: '虚空黑洞',
    description: '召唤黑洞，对所有敌人造成180%伤害并降低50%防御3回合',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 1.8,
    effect: 'voidBlackHole',
    defenseReduction: 50,
    effectDuration: 3,
    hitCount: 99,
    cooldown: 8,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 214,
    name: '星陨',
    description: '召唤星辰坠落，对所有敌人造成220%伤害',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 2.2,
    effect: 'starfall',
    hitCount: 99,
    cooldown: 6,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 215,
    name: '混沌领域',
    description: '展开混沌领域，所有敌人随机受到减攻/减防/中毒/流血效果',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'chaosDomain',
    effectDuration: 3,
    cooldown: 8,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 216,
    name: '末日审判',
    description: '召唤末日审判，对所有敌人造成300%伤害并附加所有负面效果',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 3.0,
    effect: 'doomsday',
    hitCount: 99,
    cooldown: 10,
    petExclusive: true,
    isHidden: true
  },
  // ========== 60-100级新宠物专属技能 (ID: 117-130) ==========
  {
    id: 117,
    name: '战魂冲击',
    description: '释放战魂之力，造成220%伤害，攻击力越低伤害越高',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 2.2,
    effect: 'berserker',
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 118,
    name: '魔神之怒',
    description: '无视50%防御的魔神攻击，造成200%伤害',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 2.0,
    effect: 'armorPierce',
    penetration: 50,
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 119,
    name: '冥河缠绕',
    description: '冥河之力缠绕敌人，造成160%伤害并持续流血5回合',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    baseDamageMultiplier: 1.6,
    effect: 'bleed',
    effectValue: 8,
    effectDuration: 5,
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 120,
    name: '阎罗审判',
    description: '判官之力降临，3回合内敌人受到伤害增加35%',
    type: 'petSkill',
    rarity: 'epic',
    maxLevel: 10,
    effect: 'judgement',
    effectValue: 35,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 121,
    name: '仙鹤祝福',
    description: '仙鹤祝福主人，恢复25%最大生命并净化负面效果',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'healAndPurify',
    healValue: 25,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 122,
    name: '天兵守护',
    description: '天兵护体，为主人生成相当于宠物80%生命的护盾',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'ownerShield',
    effectValue: 80,
    cooldown: 8,
    petExclusive: true
  },
  {
    id: 123,
    name: '星辰轰炸',
    description: '召唤星辰轰击所有敌人，造成240%伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 2.4,
    effect: 'aoe',
    hitCount: 99,
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 124,
    name: '虚空吞噬',
    description: '吞噬敌人生命，造成180%伤害并回复100%伤害的生命',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 1.8,
    effect: 'lifesteal',
    effectValue: 100,
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 125,
    name: '九尾幻术',
    description: '释放幻术，50%几率魅惑所有敌人2回合',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'massCharm',
    effectValue: 50,
    effectDuration: 2,
    hitCount: 99,
    cooldown: 8,
    petExclusive: true
  },
  {
    id: 126,
    name: '妖皇威压',
    description: '释放妖皇威压，所有敌人攻防降低40%持续3回合',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'royalPressure',
    attackReduction: 40,
    defenseReduction: 40,
    effectDuration: 3,
    hitCount: 99,
    cooldown: 7,
    petExclusive: true
  },
  {
    id: 127,
    name: '金刚不坏',
    description: '金刚护体，3回合内受到伤害降低50%',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'ironBody',
    damageReduction: 50,
    effectDuration: 3,
    cooldown: 8,
    petExclusive: true
  },
  {
    id: 128,
    name: '神域雷霆',
    description: '召唤神域雷霆，对所有敌人造成280%伤害并眩晕1回合',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 2.8,
    effect: 'aoeStun',
    stunDuration: 1,
    hitCount: 99,
    cooldown: 7,
    petExclusive: true
  },
  {
    id: 129,
    name: '鸿蒙之力',
    description: '释放鸿蒙原始之力，造成300%混沌伤害并随机附加多种效果',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 3.0,
    effect: 'primordialChaos',
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 130,
    name: '太初创世',
    description: '太初神兽的究极技能，造成500%毁天灭地的伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    baseDamageMultiplier: 5.0,
    cooldown: 10,
    petExclusive: true
  },
  // ========== 60-100级新宠物隐藏技能 (ID: 217-230) ==========
  {
    id: 217,
    name: '战魂不灭',
    description: '战斗时首次死亡会复活并恢复50%生命',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'revive',
    reviveHp: 50,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 218,
    name: '魔神领域',
    description: '展开魔神领域，所有攻击无视30%防御',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'passivePenetration',
    penetration: 30,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 219,
    name: '冥河诅咒',
    description: '攻击时有30%几率使敌人受到的伤害增加50%持续2回合',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'passiveCurse',
    curseChance: 30,
    curseValue: 50,
    effectDuration: 2,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 220,
    name: '轮回审判',
    description: '每次攻击有20%几率造成双倍伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'doubleDamageChance',
    chance: 20,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 221,
    name: '仙鹤长生',
    description: '每回合恢复宠物和主人5%最大生命',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'passiveRegen',
    regenValue: 5,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 222,
    name: '天兵铁壁',
    description: '永久减少宠物和主人受到的伤害15%',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'passiveDamageReduction',
    reduction: 15,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 223,
    name: '星辰之力',
    description: '暴击率+20%，暴击伤害+40%',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'passiveCrit',
    critRate: 20,
    critDamage: 40,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 224,
    name: '虚空血契',
    description: '吸血效果提升100%',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'lifestealBoost',
    boostValue: 100,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 225,
    name: '天狐魅影',
    description: '闪避率+25%，被闪避时反击造成100%伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'dodgeCounter',
    dodgeBonus: 25,
    counterDamage: 100,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 226,
    name: '万妖臣服',
    description: '攻击时有25%几率使敌人恐惧，跳过1回合',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'fear',
    fearChance: 25,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 227,
    name: '金刚怒目',
    description: '受到攻击时反弹30%伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'thorns',
    reflectDamage: 30,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 228,
    name: '神域加护',
    description: '所有属性提升15%',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'allStatsBoost',
    boostValue: 15,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 229,
    name: '鸿蒙混沌',
    description: '攻击时随机触发一种强力效果：眩晕/减防/吸血/双倍伤害',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'randomPowerful',
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  {
    id: 230,
    name: '创世神威',
    description: '攻击力、暴击率、暴击伤害各+30%，击杀敌人恢复20%生命',
    type: 'petSkill',
    rarity: 'legendary',
    maxLevel: 10,
    effect: 'godPower',
    attackBonus: 30,
    critRateBonus: 30,
    critDamageBonus: 30,
    killHeal: 20,
    cooldown: 0,
    petExclusive: true,
    isHidden: true
  },
  // ========== 宠物可学习技能 (ID: 301-324) ==========
  // 通过宠物技能书获得，所有宠物都可以学习
  // 初级档位 - 被动技能 (301-307)
  {
    id: 301,
    name: '强壮',
    description: '增加宠物等级×10点生命值',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'hpBonus',
    levelMultiplier: 10,
    petExclusive: true
  },
  {
    id: 302,
    name: '好斗',
    description: '增加宠物等级×3点攻击',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'attackBonus',
    levelMultiplier: 3,
    petExclusive: true
  },
  {
    id: 303,
    name: '硬化',
    description: '增加宠物等级×2点防御',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'defenseBonus',
    levelMultiplier: 2,
    petExclusive: true
  },
  {
    id: 304,
    name: '连击',
    description: '攻击时有30%几率连续对敌人造成2次伤害',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'multiHit',
    hitChance: 30,
    hitCount: 2,
    petExclusive: true
  },
  {
    id: 305,
    name: '吸血',
    description: '攻击时恢复造成伤害20%的生命',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'lifesteal',
    lifestealPercent: 20,
    petExclusive: true
  },
  {
    id: 306,
    name: '熟练施法',
    description: '增加15%施法概率，所有主动技能冷却减少1回合',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'castMastery',
    castChanceBonus: 15,
    cdReduction: 1,
    petExclusive: true
  },
  {
    id: 307,
    name: '再生',
    description: '每回合回复15%的最大生命值',
    type: 'petLearnablePassive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'regen',
    regenPercent: 15,
    petExclusive: true
  },
  // 中级档位 - 被动技能 (308-314)
  {
    id: 308,
    name: '高级强壮',
    description: '增加宠物等级×20点生命值',
    type: 'petLearnablePassive',
    rarity: 'rare',
    tier: 2,
    maxLevel: 10,
    effect: 'hpBonus',
    levelMultiplier: 20,
    petExclusive: true
  },
  {
    id: 309,
    name: '高级好斗',
    description: '增加宠物等级×6点攻击',
    type: 'petLearnablePassive',
    rarity: 'rare',
    tier: 2,
    maxLevel: 10,
    effect: 'attackBonus',
    levelMultiplier: 6,
    petExclusive: true
  },
  {
    id: 310,
    name: '高级硬化',
    description: '增加宠物等级×4点防御',
    type: 'petLearnablePassive',
    rarity: 'rare',
    tier: 2,
    maxLevel: 10,
    effect: 'defenseBonus',
    levelMultiplier: 4,
    petExclusive: true
  },
  {
    id: 311,
    name: '高级连击',
    description: '攻击时有40%几率连续对敌人造成2-3次伤害',
    type: 'petLearnablePassive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'multiHit',
    hitChance: 40,
    minHitCount: 2,
    maxHitCount: 3,
    petExclusive: true
  },
  {
    id: 312,
    name: '高级熟练施法',
    description: '增加25%施法概率，所有主动技能冷却减少2回合',
    type: 'petLearnablePassive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'castMastery',
    castChanceBonus: 25,
    cdReduction: 2,
    petExclusive: true
  },
  {
    id: 313,
    name: '战场嗅觉',
    description: '提高10%闪避率与10%暴击率，对50%血以下敌人造成20%额外伤害',
    type: 'petLearnablePassive',
    rarity: 'rare',
    tier: 2,
    maxLevel: 10,
    effect: 'battleInstinct',
    dodgeBonus: 10,
    critRateBonus: 10,
    executeDamageBonus: 20,
    executeThreshold: 50,
    petExclusive: true
  },
  {
    id: 314,
    name: '超级好战',
    description: '增加宠物等级×10点攻击，并增加25%暴击率',
    type: 'petLearnablePassive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'attackBonus',
    levelMultiplier: 10,
    critRateBonus: 25,
    petExclusive: true
  },
  // 初级档位 - 主动技能 (315-317)
  {
    id: 315,
    name: '冰封',
    description: '造成150%物理伤害并有35%几率冰冻敌人1回合',
    type: 'petLearnableActive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    baseDamageMultiplier: 1.5,
    effect: 'freeze',
    freezeChance: 35,
    freezeDuration: 1,
    cooldown: 4,
    petExclusive: true
  },
  {
    id: 316,
    name: '猪刚烈',
    description: '嘲讽2个敌人攻击自己，持续2回合',
    type: 'petLearnableActive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'taunt',
    tauntCount: 2,
    effectDuration: 2,
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 317,
    name: '自然滋养',
    description: '3回合内每回合回复10%生命值，防御力增加10%',
    type: 'petLearnableActive',
    rarity: 'common',
    tier: 1,
    maxLevel: 10,
    effect: 'naturalBlessing',
    regenPercent: 10,
    defenseBonus: 10,
    effectDuration: 3,
    cooldown: 5,
    petExclusive: true
  },
  // 中级档位 - 主动技能 (318-321)
  {
    id: 318,
    name: '超级赛亚人',
    description: '增加自身35%攻击力、20%暴击率，但防御力降低10%，持续3回合',
    type: 'petLearnableActive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'superSaiyan',
    attackBonus: 35,
    critRateBonus: 20,
    defensePenalty: 10,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 319,
    name: '猎杀标记',
    description: '标记敌人，队友攻击该目标时有30%概率触发50%额外伤害，持续3回合',
    type: 'petLearnableActive',
    rarity: 'rare',
    tier: 2,
    maxLevel: 10,
    effect: 'huntMark',
    triggerChance: 30,
    bonusDamage: 50,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 320,
    name: '暴怒临界',
    description: '生命低于40%时触发，回复到60%生命值并增加10%攻防，持续2回合',
    type: 'petLearnableActive',
    rarity: 'rare',
    tier: 2,
    maxLevel: 10,
    effect: 'rageThreshold',
    triggerThreshold: 40,
    healTo: 60,
    statBonus: 10,
    effectDuration: 2,
    cooldown: 5,
    petExclusive: true
  },
  {
    id: 321,
    name: '共生治愈',
    description: '宠物与主人平均分配生命值',
    type: 'petLearnableActive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'sharedHealing',
    cooldown: 6,
    petExclusive: true
  },
  // 高级档位 - 主动技能 (322-324)
  {
    id: 322,
    name: '惊虎吞狗掌',
    description: '连续对敌人进行1-9次致命打击，每次造成80%伤害',
    type: 'petLearnableActive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    baseDamageMultiplier: 0.8,
    effect: 'multiStrike',
    minHitCount: 1,
    maxHitCount: 9,
    cooldown: 8,
    petExclusive: true
  },
  {
    id: 323,
    name: '神·超级赛亚人',
    description: '增加自身50%攻击力、30%暴击率，但防御力降低10%，持续3回合',
    type: 'petLearnableActive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'godSaiyan',
    attackBonus: 50,
    critRateBonus: 30,
    defensePenalty: 10,
    effectDuration: 3,
    cooldown: 6,
    petExclusive: true
  },
  {
    id: 324,
    name: '残血庇护',
    description: '回复目标已损失生命的30%，优先治疗血量最低的队友',
    type: 'petLearnableActive',
    rarity: 'epic',
    tier: 3,
    maxLevel: 10,
    effect: 'desperateHealing',
    healPercent: 30,
    cooldown: 5,
    petExclusive: true
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
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 4
}

export function getSkillExpForLevel(level, rarity = 'common') {
  const baseExp = Math.floor(600 * level * (1 + level * 0.45)) // 基础经验×3
  const multiplier = rarityExpMultiplier[rarity] || 1
  // 等级递增倍率：1→2级×3，2→3级×4，3→4级×5，4→5级×6
  let levelMultiplier = 3
  if (level === 2) levelMultiplier = 4
  else if (level === 3) levelMultiplier = 5
  else if (level === 4) levelMultiplier = 6
  else if (level >= 5) levelMultiplier = 7 // 5级以上保持×7
  return Math.floor(baseExp * multiplier * levelMultiplier)
}

// 根据技能ID获取技能
export function getSkillById(skillId) {
  return skills.find(s => s.id === skillId)
}

// 技能书掉落逻辑
export function rollSkillBookDrop(mapId) {
  const droppableSkills = skills.filter(s =>
    s.dropFromMaps && s.dropFromMaps.includes(mapId) && s.dropRate > 0
  )
  for (const skill of droppableSkills) {
    if (Math.random() < skill.dropRate) {
      return { type: 'skillBook', skillId: skill.id }
    }
  }
  return null
}

// 获取装备子类型配置
function getSubTypeConfig(slotType) {
  const subTypeMap = {
    armor: armorSubTypes,
    helmet: helmetSubTypes,
    ring: ringSubTypes,
    necklace: necklaceSubTypes,
    boots: bootsSubTypes,
    artifact: artifactSubTypes
  }
  return subTypeMap[slotType] || null
}

// 随机获取装备特效（高品质装备有更高概率获得特效）
function rollEquipmentEffect(quality, level) {
  // 特效概率：普通5%, 优秀10%, 精良20%, 史诗40%, 传说70%
  const effectChance = {
    white: 5,
    green: 10,
    blue: 20,
    purple: 40,
    orange: 70
  }

  if (Math.random() * 100 >= effectChance[quality]) {
    return null
  }

  const effectKeys = Object.keys(equipmentEffects)
  const effectKey = effectKeys[Math.floor(Math.random() * effectKeys.length)]
  const effectConfig = equipmentEffects[effectKey]

  // 效果值随等级和品质增强
  const qualityMult = qualityConfig[quality].statMultiplier
  const levelMult = 1 + level / 100
  const baseValue = effectConfig.valueRange[0] + Math.random() * (effectConfig.valueRange[1] - effectConfig.valueRange[0])
  const value = Math.round(baseValue * qualityMult * levelMult * 10) / 10

  return {
    type: effectKey,
    name: effectConfig.name,
    description: effectConfig.description,
    value,
    icon: effectConfig.icon
  }
}

// 检测装备是否属于某个套装
function detectSetBelonging(slotType, subType, quality) {
  // 只有精良及以上品质才能成为套装
  if (!['blue', 'purple', 'orange'].includes(quality)) {
    return null
  }

  // 30%概率成为套装装备
  if (Math.random() > 0.3) {
    return null
  }

  // 找到可以包含该槽位的套装
  const eligibleSets = Object.entries(equipmentSets).filter(([_, set]) =>
    set.pieces.includes(slotType)
  )

  if (eligibleSets.length === 0) return null

  const [setKey, setData] = eligibleSets[Math.floor(Math.random() * eligibleSets.length)]
  return {
    setId: setKey,
    setName: setData.name,
    setColor: setData.color
  }
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

  // 计算基础属性
  const stats = {}
  for (const [stat, perLevel] of Object.entries(template)) {
    const value = perLevel * level * qualityData.statMultiplier
    stats[stat] = stat === 'dropRate' ? Math.round(value * 10) / 10 : Math.floor(value)
  }

  // 生成名称和子类型
  let name = ''
  let weaponType = null
  let subType = null
  let subTypeData = null

  if (slotType === 'weapon') {
    // 武器使用武器类型系统
    const types = Object.keys(weaponTypes)
    const typeKey = types[Math.floor(Math.random() * types.length)]
    weaponType = typeKey
    const type = weaponTypes[typeKey]
    stats[type.secondaryStat] = Math.floor(type.secondaryValue * level * qualityData.statMultiplier * 10) / 10
    const prefixIndex = Math.min(Math.floor(level / 10), type.prefixes.length - 1)
    name = `${type.prefixes[prefixIndex]}${type.name}`
  } else {
    // 其他装备使用子类型系统
    const subTypeConfig = getSubTypeConfig(slotType)
    if (subTypeConfig) {
      const subTypeKeys = Object.keys(subTypeConfig)
      const subTypeKey = subTypeKeys[Math.floor(Math.random() * subTypeKeys.length)]
      subType = subTypeKey
      subTypeData = subTypeConfig[subTypeKey]

      // 应用子类型属性加成
      for (const [stat, bonus] of Object.entries(subTypeData.statBonus)) {
        if (stats[stat] !== undefined) {
          stats[stat] = Math.floor(stats[stat] * (1 + bonus))
        } else if (bonus > 0) {
          // 新增属性
          const baseValue = level * bonus * qualityData.statMultiplier
          stats[stat] = Math.round(baseValue * 10) / 10
        }
      }

      // 生成名称
      const prefixIndex = Math.min(Math.floor(level / 20), subTypeData.prefixes.length - 1)
      const suffixes = equipSuffixes[slotType]
      const suffixIndex = Math.min(Math.floor(level / 10), suffixes.length - 1)
      name = `${subTypeData.prefixes[prefixIndex]}${suffixes[suffixIndex]}`
    } else {
      const suffixes = equipSuffixes[slotType]
      const suffixIndex = Math.min(Math.floor(level / 10), suffixes.length - 1)
      name = suffixes[suffixIndex]
    }
  }

  // 装备等级要求 = 装备等级 - 5，最低1级
  const requiredLevel = Math.max(1, level - 5)

  // 生成特效（高品质、高等级更容易获得）
  const effect = rollEquipmentEffect(quality, level)

  // 检测套装
  const setInfo = detectSetBelonging(slotType, subType, quality)

  const equipment = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    slotType,
    weaponType,
    subType,
    subTypeName: subTypeData ? subTypeData.name : null,
    level,
    requiredLevel,
    quality,
    qualityName: qualityData.name,
    qualityColor: qualityData.color,
    stats,
    icon: slot.icon,
    enhanceLevel: 0
  }

  // 添加特效信息
  if (effect) {
    equipment.effect = effect
    equipment.name = `${effect.icon}${equipment.name}`
  }

  // 添加套装信息
  if (setInfo) {
    equipment.setId = setInfo.setId
    equipment.setName = setInfo.setName
    equipment.setColor = setInfo.setColor
    equipment.name = `【${setInfo.setName}】${equipment.name}`
  }

  return equipment
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
// 宠物种类（每个地图可捕获的宠物）
// fixedSkills: 孵化时固定携带的技能
// hiddenSkill: 隐藏技能（10%几率获得）
// role: 宠物定位
export const petTypes = [
  // 新手村
  { id: 1, name: '小狐狸', mapId: 1, baseLevel: 1, icon: '🦊', role: '治疗', fixedSkills: [101], hiddenSkill: 201 },
  { id: 2, name: '野兔精', mapId: 1, baseLevel: 2, icon: '🐰', role: '辅助', fixedSkills: [102], hiddenSkill: 202 },
  // 黑风林
  { id: 3, name: '黑狼', mapId: 2, baseLevel: 8, icon: '🐺', role: '输出', fixedSkills: [103], hiddenSkill: 203 },
  { id: 4, name: '毒蛇', mapId: 2, baseLevel: 10, icon: '🐍', role: '持续伤害', fixedSkills: [104], hiddenSkill: 204 },
  // 落日峰
  { id: 5, name: '火鸦', mapId: 3, baseLevel: 18, icon: '🐦', role: '爆发', fixedSkills: [105], hiddenSkill: 205 },
  { id: 6, name: '石傀儡', mapId: 3, baseLevel: 20, icon: '🗿', role: '坦克', fixedSkills: [106], hiddenSkill: 206 },
  // 血月谷
  { id: 7, name: '血蝠', mapId: 4, baseLevel: 28, icon: '🦇', role: '续航', fixedSkills: [107], hiddenSkill: 207 },
  { id: 8, name: '骷髅兵', mapId: 4, baseLevel: 30, icon: '💀', role: '控制', fixedSkills: [108], hiddenSkill: 208 },
  // 龙脊山脉
  { id: 9, name: '幼龙', mapId: 5, baseLevel: 38, icon: '🐲', role: '群攻', fixedSkills: [109], hiddenSkill: 209 },
  { id: 10, name: '雷鹰', mapId: 5, baseLevel: 40, icon: '🦅', role: '控制', fixedSkills: [110], hiddenSkill: 210 },
  // 天魔峡
  { id: 11, name: '魔灵', mapId: 6, baseLevel: 45, icon: '👻', role: '穿透', fixedSkills: [111], hiddenSkill: 211 },
  { id: 12, name: '炎魔', mapId: 6, baseLevel: 48, icon: '👹', role: '群攻', fixedSkills: [112], hiddenSkill: 212 },
  // 虚空裂隙
  { id: 13, name: '虚空兽', mapId: 7, baseLevel: 52, icon: '🌀', role: '减益', fixedSkills: [113], hiddenSkill: 213 },
  { id: 14, name: '星灵', mapId: 7, baseLevel: 55, icon: '✨', role: '增益', fixedSkills: [114], hiddenSkill: 214 },
  // 混沌深渊
  { id: 15, name: '混沌幼兽', mapId: 8, baseLevel: 58, icon: '🌑', role: '混乱', fixedSkills: [115], hiddenSkill: 215 },
  { id: 16, name: '远古魔神', mapId: 8, baseLevel: 60, icon: '😈', role: '毁灭', fixedSkills: [116], hiddenSkill: 216 },
  // 神魔战场 (mapId: 12)
  { id: 17, name: '战魂', mapId: 12, baseLevel: 62, icon: '⚔️', role: '狂暴', fixedSkills: [117], hiddenSkill: 217 },
  { id: 18, name: '魔神残念', mapId: 12, baseLevel: 66, icon: '👿', role: '穿透', fixedSkills: [118], hiddenSkill: 218 },
  // 九幽冥界 (mapId: 13)
  { id: 19, name: '冥河灵蛇', mapId: 13, baseLevel: 68, icon: '🐉', role: '持续伤害', fixedSkills: [119], hiddenSkill: 219 },
  { id: 20, name: '判官鬼', mapId: 13, baseLevel: 72, icon: '👺', role: '减益', fixedSkills: [120], hiddenSkill: 220 },
  // 仙界边境 (mapId: 14)
  { id: 21, name: '仙鹤', mapId: 14, baseLevel: 75, icon: '🕊️', role: '治疗', fixedSkills: [121], hiddenSkill: 221 },
  { id: 22, name: '天兵傀儡', mapId: 14, baseLevel: 78, icon: '🤖', role: '坦克', fixedSkills: [122], hiddenSkill: 222 },
  // 太虚星域 (mapId: 15)
  { id: 23, name: '星辰幼兽', mapId: 15, baseLevel: 82, icon: '🌟', role: '群攻', fixedSkills: [123], hiddenSkill: 223 },
  { id: 24, name: '虚空吞噬者', mapId: 15, baseLevel: 86, icon: '🕳️', role: '吸血', fixedSkills: [124], hiddenSkill: 224 },
  // 万妖圣地 (mapId: 16)
  { id: 25, name: '九尾天狐', mapId: 16, baseLevel: 88, icon: '🦊', role: '魅惑', fixedSkills: [125], hiddenSkill: 225 },
  { id: 26, name: '妖皇分身', mapId: 16, baseLevel: 91, icon: '👑', role: '全能', fixedSkills: [126], hiddenSkill: 226 },
  // 诸天神域 (mapId: 17)
  { id: 27, name: '护法金刚', mapId: 17, baseLevel: 94, icon: '🗿', role: '坦克', fixedSkills: [127], hiddenSkill: 227 },
  { id: 28, name: '神域战灵', mapId: 17, baseLevel: 96, icon: '⚡', role: '爆发', fixedSkills: [128], hiddenSkill: 228 },
  // 鸿蒙秘境 (mapId: 18)
  { id: 29, name: '鸿蒙幼兽', mapId: 18, baseLevel: 98, icon: '🌌', role: '混沌', fixedSkills: [129], hiddenSkill: 229 },
  { id: 30, name: '太初神兽', mapId: 18, baseLevel: 100, icon: '🐲', role: '究极', fixedSkills: [130], hiddenSkill: 230 }
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

  // 等级成长加成（每20级额外+25%成长率）
  const levelBonus = 1 + Math.floor(level / 20) * 0.25

  // 基础成长值（与玩家相近）
  // 宠物基础每级: HP+8, 攻击+3, 防御+2
  const hpGrowth = 8 * aptMult * qualityMult * levelBonus
  const atkGrowth = 3 * aptMult * qualityMult * levelBonus
  const defGrowth = 2 * aptMult * qualityMult * levelBonus

  // 初始属性 + 等级成长 + 等级指数成长
  const baseHp = Math.floor(100 + level * hpGrowth + Math.pow(level, 1.2) * aptMult)
  const baseAttack = Math.floor(12 + level * atkGrowth + Math.pow(level, 1.1) * aptMult * 0.5)
  const baseDefense = Math.floor(6 + level * defGrowth + Math.pow(level, 1.05) * aptMult * 0.3)

  // 暴击和闪避随等级成长
  const critRate = Math.floor(5 + level * 0.1 * aptMult)
  const dodge = Math.floor(3 + level * 0.08 * aptMult)

  return { baseHp, baseAttack, baseDefense, critRate, dodge }
}

// 生成宠物实例
export function generatePet(petTypeId, level, forceQuality = null, maxAptitude = 8, forceHiddenSkill = null) {
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

  // 使用固定技能（每个宠物有特定的固定技能）
  const petSkills = [...(petType.fixedSkills || [])]

  // 隐藏技能：如果传入了参数则使用，否则10%概率获得
  let hasHiddenSkill = forceHiddenSkill !== null ? forceHiddenSkill : (Math.random() < 0.1)
  if (hasHiddenSkill && petType.hiddenSkill) {
    petSkills.push(petType.hiddenSkill)
  } else {
    hasHiddenSkill = false // 如果没有隐藏技能定义，设为false
  }

  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    typeId: petType.id,
    name: petType.name,
    icon: petType.icon,
    role: petType.role,
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
    critRate: stats.critRate || 5,
    critDamage: 50 + Math.floor(level / 5),
    critResist: 0,
    dodge: stats.dodge || 3,
    hit: 95 + Math.floor(level / 10),
    // 技能（技能ID数组）
    skills: petSkills,
    skillLevels: petSkills.reduce((acc, id) => { acc[id] = 1; return acc }, {}),
    hasHiddenSkill,
    // 当前状态
    currentHp: stats.baseHp
  }
}

// 计算宠物升级所需经验
export function getPetExpForLevel(level) {
  return Math.floor(100 * level * (1 + level * 0.2))
}

// 计算宠物战斗属性（包含被动技能加成）
export function getPetStats(pet) {
  if (!pet) return null

  // 基础属性（添加默认值兼容旧存档）
  let stats = {
    maxHp: pet.baseHp || 100,
    attack: pet.baseAttack || 10,
    defense: pet.baseDefense || 5,
    critRate: pet.critRate || 5,
    critDamage: pet.critDamage || 50,
    dodge: pet.dodge || 3,
    hit: pet.hit || 95,
    critResist: pet.critResist || 0,
    // 特殊效果（用于战斗计算）
    executeDamageBonus: 0,
    executeThreshold: 0,
    damageBonus: 0
  }

  // 计算被动技能加成
  if (pet.skills && pet.skills.length > 0) {
    for (const skillId of pet.skills) {
      const skill = skills.find(s => s.id === skillId)
      if (!skill) continue

      // 只处理被动技能
      if (skill.type === 'petLearnablePassive' || (skill.type === 'petSkill' && skill.cooldown === 0)) {
        const skillLevel = pet.skillLevels?.[skillId] || 1
        const levelMult = 1 + (skillLevel - 1) * 0.1  // 每级+10%效果

        // 生命加成
        if (skill.effect === 'hpBonus' && skill.levelMultiplier) {
          stats.maxHp += Math.floor(pet.level * skill.levelMultiplier * levelMult)
        }
        // 攻击加成
        if (skill.effect === 'attackBonus' && skill.levelMultiplier) {
          stats.attack += Math.floor(pet.level * skill.levelMultiplier * levelMult)
        }
        // 防御加成
        if (skill.effect === 'defenseBonus' && skill.levelMultiplier) {
          stats.defense += Math.floor(pet.level * skill.levelMultiplier * levelMult)
        }
        // 暴击率加成
        if (skill.critRateBonus) {
          stats.critRate += Math.floor(skill.critRateBonus * levelMult)
        }
        // 暴击伤害加成
        if (skill.critDamageBonus) {
          stats.critDamage += Math.floor(skill.critDamageBonus * levelMult)
        }
        // 闪避加成
        if (skill.dodgeBonus) {
          stats.dodge += Math.floor(skill.dodgeBonus * levelMult)
        }
        // 命中加成
        if (skill.hitBonus) {
          stats.hit += Math.floor(skill.hitBonus * levelMult)
        }
        // 斩杀效果
        if (skill.executeDamageBonus) {
          stats.executeDamageBonus += Math.floor(skill.executeDamageBonus * levelMult)
          stats.executeThreshold = Math.max(stats.executeThreshold, skill.executeThreshold || 0)
        }
        // 通用伤害加成
        if (skill.damageBonus) {
          stats.damageBonus += Math.floor(skill.damageBonus * levelMult)
        }
      }
    }
  }

  return stats
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

  // 在生成蛋时就决定宠物类型和是否有隐藏技能（防止刷档）
  const petType = petTypes[Math.floor(Math.random() * petTypes.length)]
  const hasHiddenSkill = Math.random() < 0.1 // 10%概率有隐藏技能

  return {
    id: `petegg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'petEgg',
    name: eggName,
    quality,
    qualityName: qualityData.name,
    qualityColor: qualityData.color,
    towerFloor, // 记录获取时的层数，用于决定宠物等级
    maxAptitude, // 资质上限
    petTypeId: petType.id, // 预先决定的宠物类型
    hasHiddenSkill // 预先决定是否有隐藏技能
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

  // 使用蛋中预先决定的宠物类型（防止刷档）
  // 兼容旧存档：如果没有预先决定，则随机选择
  let petTypeId = petEgg.petTypeId
  if (!petTypeId) {
    const petType = petTypes[Math.floor(Math.random() * petTypes.length)]
    petTypeId = petType.id
  }

  // 宠物从1级开始
  const petLevel = 1

  // 使用蛋的资质上限
  const maxAptitude = petEgg.maxAptitude || 8

  // 使用蛋中预先决定的隐藏技能（防止刷档）
  // 兼容旧存档：如果没有预先决定，则随机判定
  const hasHiddenSkill = petEgg.hasHiddenSkill !== undefined ? petEgg.hasHiddenSkill : (Math.random() < 0.1)

  return generatePet(petTypeId, petLevel, petEgg.quality, maxAptitude, hasHiddenSkill)
}

// ========== 宠物技能书系统 ==========
// 可学习技能ID范围：301-324
const petLearnableSkillIds = Array.from({ length: 24 }, (_, i) => 301 + i)

// 宠物技能书掉落层数配置
const petSkillBookDropFloors = {
  // 初级宠物技能书掉落层数
  basic: [110, 120, 130, 140, 150, 160, 170],
  // 中级宠物技能书掉落层数
  intermediate: [180, 190],
  // 高级宠物技能书掉落层数
  advanced: [300, 400]
}

// 生成宠物技能书
export function generatePetSkillBook(towerFloor) {
  // 根据层数决定技能书类型
  let bookQuality, bookName, availableTiers

  if (petSkillBookDropFloors.advanced.includes(towerFloor)) {
    // 高级宠物技能书：可开出全部档位
    bookQuality = 'epic'
    bookName = '高级宠物技能书'
    availableTiers = [1, 2, 3]
  } else if (petSkillBookDropFloors.intermediate.includes(towerFloor)) {
    // 中级宠物技能书：可开出初级和中级
    bookQuality = 'rare'
    bookName = '中级宠物技能书'
    availableTiers = [1, 2]
  } else if (petSkillBookDropFloors.basic.includes(towerFloor)) {
    // 初级宠物技能书：只能开出初级
    bookQuality = 'common'
    bookName = '初级宠物技能书'
    availableTiers = [1]
  } else {
    return null // 非指定层数不掉落
  }

  return {
    id: `petskillbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'petSkillBook',
    name: bookName,
    quality: bookQuality,
    availableTiers,
    towerFloor
  }
}

// 检查某层是否掉落宠物技能书
export function shouldDropPetSkillBook(towerFloor) {
  return petSkillBookDropFloors.basic.includes(towerFloor) ||
         petSkillBookDropFloors.intermediate.includes(towerFloor) ||
         petSkillBookDropFloors.advanced.includes(towerFloor)
}

// 开启宠物技能书，返回获得的技能ID
export function openPetSkillBook(skillBook) {
  if (!skillBook || skillBook.type !== 'petSkillBook') return null

  const availableTiers = skillBook.availableTiers || [1]

  // 获取可学习技能列表
  const learnableSkills = skills.filter(s =>
    petLearnableSkillIds.includes(s.id) && availableTiers.includes(s.tier)
  )

  if (learnableSkills.length === 0) return null

  // 根据档位决定概率权重（越高级越难开）
  // tier 1: 权重60
  // tier 2: 权重30
  // tier 3: 权重10
  const weightedSkills = []
  for (const skill of learnableSkills) {
    let weight = 60
    if (skill.tier === 2) weight = 30
    else if (skill.tier === 3) weight = 10

    for (let i = 0; i < weight; i++) {
      weightedSkills.push(skill)
    }
  }

  // 随机选择一个技能
  const selectedSkill = weightedSkills[Math.floor(Math.random() * weightedSkills.length)]

  return {
    skillId: selectedSkill.id,
    skillName: selectedSkill.name,
    skillTier: selectedSkill.tier,
    skillRarity: selectedSkill.rarity
  }
}

// 获取可学习技能列表（用于UI展示）
export function getPetLearnableSkills() {
  return skills.filter(s => petLearnableSkillIds.includes(s.id))
}
