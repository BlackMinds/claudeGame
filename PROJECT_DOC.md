# 修仙传 - 项目文档

## 项目概述
这是一个基于 Vue 2 的文字修仙 RPG 游戏，包含战斗、装备、技能、宠物、境界等多个系统。

## 技术栈
- **框架**: Vue 2 + Vue.observable（状态管理）
- **构建工具**: Vite
- **桌面应用**: Electron + electron-builder
- **语言**: JavaScript
- **样式**: Scoped CSS（响应式设计，支持移动端）

## 项目结构
```
├── electron/
│   ├── main.js            # Electron 主进程
│   └── preload.js         # Electron 预加载脚本
├── src/
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   ├── assets/
│   │   └── main.css       # 全局样式
│   ├── components/game/
│   │   ├── GameMain.vue       # 游戏主容器
│   │   ├── NavBar.vue         # 顶部导航栏（设置、攻略、打坐面板）
│   │   ├── AttributePanel.vue # 左侧属性面板（角色属性、技能展示）
│   │   ├── BattlePanel.vue    # 中间战斗面板（地图、战斗、锁妖塔）
│   │   ├── EquipmentPanel.vue # 右侧装备面板（装备栏、背包）
│   │   ├── SkillPanel.vue     # 技能面板弹窗（技能学习、装备）
│   │   └── PetPanel.vue       # 宠物面板弹窗（宠物管理）
│   ├── data/
│   │   └── gameData.js        # 游戏数据配置（核心数据文件）
│   ├── store/
│   │   └── gameStore.js       # 游戏状态管理（核心逻辑文件）
│   └── utils/
│       └── security.js        # 存档加密验证
└── release/               # Electron 打包输出目录
```

## 核心文件说明

### 1. gameData.js - 游戏数据配置
包含所有静态游戏数据：

#### 境界系统
- `xianRealms`: 仙修境界（平衡型：生命+5%/攻击+5%/防御+5% 每级）
- `moRealms`: 魔修境界（攻击型：生命+2%/攻击+8%/吸血+2% 每级）
- 共12个境界：凡人 → 炼气期 → ... → 天仙/玄魔

#### 装备系统
- `qualityConfig`: 品质配置（普通/优秀/精良/史诗/传说）
- `equipSlots`: 装备槽位（武器/衣服/头饰/戒指/项链/鞋子/法宝）
- `weaponTypes`: 武器类型（剑/刀/法杖/锤/盾）
- `equipTemplates`: 装备基础属性模板
- **装备子类型**:
  - `armorSubTypes`: 布甲/皮甲/重甲/荆棘甲
  - `helmetSubTypes`: 法冠/战盔/面具
  - `ringSubTypes`: 战戒/守戒/秘戒/荆棘戒
  - `necklaceSubTypes`: 灵珠链/护心链/辟邪链/嗜血链
  - `bootsSubTypes`: 轻靴/战靴/灵靴
  - `artifactSubTypes`: 杀伐法宝/护体法宝/混元法宝/逆鳞法宝
- `equipmentSets`: 套装系统
  - 玄武套装（防具+头盔+鞋子）- 防御向
  - 朱雀套装（武器+戒指+项链）- 攻击向
  - 青龙套装（武器+防具+法宝）- 均衡向
  - 白虎套装（武器+头盔+戒指）- 爆发向
  - 麒麟套装（项链+鞋子+法宝）- 全能向
  - 混沌套装（全部件）- 终极套装
  - 铁壁套装（防具+头盔+法宝）- 肉盾向（减伤+反伤）
  - 嗜血套装（武器+戒指+法宝）- 吸血向
  - 暴击套装（武器+头盔+项链）- 暴击向
- `equipmentEffects`: 装备特效系统
- **装备强化系统**:
  - `MAX_ENHANCE_LEVEL`: 最高强化等级（12级）
  - `getEnhanceSuccessRate(level)`: 获取强化成功率（+7开始有失败概率）
  - `getEnhanceBonus(level)`: 获取强化加成（+1~+10每级5%，+11为10%，+12为15%）
  - 强化失败会降低1-2级（不会低于+6）
- **特殊属性数值平衡**（考虑强化系统）:
  - 闪避：3%~8%（轻靴8%、布甲6%、面具5%、混元法宝1%）
  - 穿透：4%~5%（利刃5%、秘戒4%）

#### 技能系统
- `skills`: 技能数据数组
  - 主动技能: type='active', 有伤害倍率、冷却、特效
  - 被动技能: type='passive', 提供属性加成
- `skillRarityConfig`: 技能稀有度（普通/稀有/史诗/传说）

#### 地图与怪物
- `maps`: 地图配置（等级要求、怪物属性倍率、经验金币倍率）
- `monsterSkills`: 怪物技能库
- `towerConfig`: 锁妖塔配置

#### 宠物系统
- `petTypes`: 宠物种类配置
- `petQualities`: 宠物品质
- 宠物技能系统（固有技能、可学习技能、隐藏技能）

#### 核心函数
- `generateEquipment(level, slotType, forceQuality)`: 生成装备
- `getSkillById(id)`: 获取技能数据
- `getPassiveSkillStats(skill, level)`: 计算被动技能属性

### 2. gameStore.js - 游戏状态管理
包含游戏运行时状态和核心逻辑：

#### 游戏状态 `gameState`
```javascript
gameState = {
  player: {
    name, level, exp, realmId, realmExp,
    cultivationType,  // 'none'|'xian'|'mo'
    gold,
    baseHp, baseAttack, baseDefense,
    critRate, critResist, critDamage, dodge, hit, penetration,
    equipment: { weapon, armor, helmet, ring, necklace, boots, artifact },
    inventory: [],
    learnedSkills: {},
    equippedActiveSkills: [],
    equippedPassiveSkills: [],
    pets: [],
    activePetId,
    petEggs: []
  },
  battle: {
    isInBattle, currentMap, monsters, currentMonsterIndex,
    playerCurrentHp, battleLog, isAutoBattle,
    skillCooldowns: {}, playerBuffs: {},
    // 锁妖塔
    towerFloor, towerMonsters, isInTower, towerBattleLog,
    // 战斗统计
    battleStats: {
      startTime, totalExp, totalGold, totalKills,
      drops: { white, green, blue, purple, orange, skillBooks }
    }
  },
  lootFilter: { enabled, minQuality, autoSellFiltered, pickupSkillBooks },
  // 开发调试
  devExpMultiplier,    // 经验倍率
  devDropMultiplier,   // 掉落倍率
  devGoldMultiplier    // 金币倍率
}
```

#### 核心函数
**属性计算**:
- `getPlayerStats()`: 计算玩家最终属性（包含装备、被动、套装、境界加成）
- `getEquipmentStats()`: 计算装备属性总和
- `getPassiveSkillBonus()`: 计算被动技能加成
- `getSetBonuses()`: 计算套装加成

**战斗系统**:
- `startBattle(mapIndex)`: 开始战斗
- `playerAttack(skillIndex)`: 玩家攻击
- `monsterAttack()`: 怪物攻击
- `calculateDamage()`: 伤害计算公式
- `resetBattleStats()`: 重置战斗统计（自动战斗开始时调用）
- `getBattleStats()`: 获取战斗统计数据（含效率计算）

**锁妖塔**:
- `enterTower()`: 进入锁妖塔
- `towerBattle()`: 锁妖塔战斗
- 特殊掉落：宠物蛋、资质丹、技能书

**存档系统**:
- `saveGame()`: 保存游戏（自动加密）
- `loadGame()`: 加载游戏
- `exportSave()` / `importSave()`: 导出/导入存档

**境界系统**:
- `attemptBreakthrough()`: 尝试突破境界
- `setCultivationType(type)`: 设置修炼类型（仙/魔）

## 属性系统

### 基础属性
- `hp/maxHp`: 生命值
- `attack`: 攻击力
- `defense`: 防御力

### 战斗属性
- `critRate`: 暴击率 (%)
- `critDamage`: 暴击伤害 (基础150%+此值)
- `critResist`: 抗暴击 (%)
- `penetration`: 忽视防御 (%)
- `dodge`: 闪避率 (%)
- `hit`: 命中率 (%)
- `lifesteal`: 吸血 (%)
- `damageReduction`: 减伤 (%)
- `thorns`: 反伤 (%)
- `dropRate`: 掉落率加成 (%)

### 属性来源
1. **基础属性**: player.baseXxx
2. **装备属性**: equipment.stats
3. **被动技能**: equippedPassiveSkills
4. **套装加成**: equipmentSets bonuses（百分比加成）
5. **境界加成**: realm.xxxBonus（百分比加成）
6. **临时Buff**: battle.playerBuffs

## 战斗公式

### 伤害计算
```javascript
baseDamage = attack * (1 + skillDamage/100)
effectiveDefense = defense * (1 - min(penetration, 80)/100)
damageReduction = min(0.8, effectiveDefense / (effectiveDefense + 100))
finalDamage = baseDamage * (1 - damageReduction)
if (isCrit) finalDamage *= (1.5 + critDamage/100)
```

### 命中判定
```
玩家命中率 = 玩家命中 - 怪物闪避（最低5%）
怪物命中率 = 怪物命中 - 玩家闪避（最低5%）
暴击率 = 暴击率 - 抗暴击
```
- 普通怪物命中：70-90% + 等级*0.3
- 锁妖塔怪物命中：80-95% + 层数*0.2

## 开发指南

### 添加新装备子类型
1. 在 `gameData.js` 中对应的 `xxxSubTypes` 对象添加新类型
2. 设置 `statBonus` 属性加成（支持：hp, attack, defense, critRate, critDamage, dodge, hit, penetration, damageReduction, thorns, lifesteal）

### 添加新套装
1. 在 `gameData.js` 的 `equipmentSets` 中添加
2. 设置 `pieces`（部件槽位）和 `bonuses`（件数加成）
3. 如果有新属性，需在 `gameStore.js` 的 `getSetBonuses` 中添加

### 添加新技能
1. 在 `gameData.js` 的 `skills` 数组中添加
2. 主动技能需要在 `BattlePanel.vue` 处理特效
3. 被动技能需要在 `getPassiveSkillStats` 中处理属性计算

### 添加新属性
1. 在 `gameStore.js` 的 `getEquipmentStats` 添加初始值
2. 在 `getSetBonuses` 添加（如需套装支持）
3. 在 `getPlayerStats` 中计算总值
4. 在 `AttributePanel.vue` 添加显示
5. 在 `EquipmentPanel.vue` 的 `statNames` 添加名称映射

## 移动端适配

游戏支持响应式布局，适配移动设备：

### 断点设计
- `768px`: 平板适配（导航栏折叠、面板堆叠）
- `480px`: 手机适配（紧凑布局、简化显示）

### 适配组件
- **NavBar.vue**: 导航按钮自适应、隐藏副标题
- **AttributePanel.vue**: 属性面板紧凑显示
- **BattlePanel.vue**: 战斗面板全宽、日志区域缩小
- **EquipmentPanel.vue**: 装备格子自适应、弹窗全屏
- **GameMain.vue**: 三栏布局改为单栏堆叠

### 玩家名称编辑
点击玩家名称可弹出修改弹窗，支持最多12个字符。

## 装备对比系统

在装备详情弹窗中，选中背包装备时会显示与已装备物品的对比：
- 绿色数值：新装备属性更高
- 红色数值：新装备属性更低
- 显示差值（如 +10 或 -5）

相关方法（EquipmentPanel.vue）:
- `getEquippedForSlot(slotType)`: 获取对应槽位已装备物品
- `getAllCompareStats(item)`: 获取所有需要对比的属性
- `getStatDiff(item, stat)`: 计算属性差值
- `getCompareClass(item, stat)`: 获取对比颜色样式

## 测试人偶地图

用于测试伤害输出的特殊地图：
- **位置**: 地图列表最后一个
- **怪物**: 测试人偶（固定属性，不随等级变化）
- **属性**: HP 999999, 攻击 100, 防御 100, 命中 100
- **特点**: 无经验、无金币、无掉落

## 反加速检测

防止使用加速器作弊的机制：

```javascript
// 核心参数
BATTLE_INTERVAL = 1000    // 正常战斗间隔（毫秒）
MIN_INTERVAL = 750        // 最小允许间隔
SPEED_HACK_THRESHOLD = 5  // 连续异常次数阈值

// 检测逻辑
1. 使用 performance.now() 记录战斗时间
2. 计算两次战斗间隔
3. 如果间隔 < MIN_INTERVAL，累加异常计数
4. 连续异常达到阈值，暂停自动战斗
```

## Electron 桌面应用

### 打包命令
```bash
npm run electron:dev    # 测试运行
npm run electron:build  # 打包安装程序
```

### 输出目录
- `release/修仙物语 Setup x.x.x.exe` - Windows 安装程序
- `release/win-unpacked/` - 免安装版本

### 配置说明
- **main.js**: Electron 主进程，创建窗口和加载页面
- **preload.js**: 预加载脚本，暴露安全 API
- **package.json**: build 字段配置打包选项

## 注意事项

1. **响应式**: 使用 `Vue.observable` 管理状态，修改需注意响应式更新
2. **存档兼容**: 修改 `gameState` 结构时注意旧存档兼容
3. **数值平衡**: 修改数值时注意整体平衡性
4. **攻略同步**: 套装数据会自动显示在攻略面板
5. **移动端测试**: 修改样式后需测试不同屏幕尺寸
6. **Electron打包**: 修改后需重新运行 `npm run electron:build`
