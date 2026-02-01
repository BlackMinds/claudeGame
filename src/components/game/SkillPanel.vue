<template>
  <div class="skill-panel">
    <div class="panel-header">
      <h3>技能</h3>
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'learned' }"
          @click="activeTab = 'learned'"
        >已学习</button>
        <button
          :class="{ active: activeTab === 'inventory' }"
          @click="activeTab = 'inventory'"
        >背包</button>
      </div>
    </div>

    <!-- 已装备主动技能栏 -->
    <div class="equipped-section">
      <div class="section-title">主动技能 ({{ equippedActiveSkills.length }}/4)</div>
      <div class="equipped-skills">
        <div
          v-for="skill in equippedActiveSkills"
          :key="skill.id"
          class="equipped-skill active-skill"
          :style="{ borderColor: getRarityColor(skill.rarity) }"
          @click="handleUnequipSkill(skill.id)"
        >
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-level">Lv.{{ skill.currentLevel }}</span>
          <span class="skill-dmg">{{ (skill.damageMultiplier * 100).toFixed(0) }}%</span>
        </div>
        <div
          v-for="i in (4 - equippedActiveSkills.length)"
          :key="'empty-active-' + i"
          class="equipped-skill empty"
        >
          <span>空槽位</span>
        </div>
      </div>
    </div>

    <!-- 已装备被动技能栏 -->
    <div class="equipped-section passive-section">
      <div class="section-title">被动技能 ({{ equippedPassiveSkills.length }}/{{ maxPassiveSlots }})</div>
      <div class="equipped-skills passive-skills">
        <div
          v-for="skill in equippedPassiveSkills"
          :key="skill.id"
          class="equipped-skill passive-skill"
          :style="{ borderColor: getRarityColor(skill.rarity) }"
          @click="handleUnequipSkill(skill.id)"
        >
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-level">Lv.{{ skill.currentLevel }}</span>
          <span class="skill-bonus">{{ getPassiveBonusText(skill) }}</span>
        </div>
        <div
          v-for="i in (maxPassiveSlots - equippedPassiveSkills.length)"
          :key="'empty-passive-' + i"
          class="equipped-skill empty"
        >
          <span>空槽位</span>
        </div>
      </div>
    </div>

    <!-- 已学习技能列表 -->
    <div v-if="activeTab === 'learned'" class="content-section">
      <div class="section-title">已学习的技能</div>

      <!-- 筛选和排序 -->
      <div class="filter-sort-section">
        <div class="filter-row">
          <span class="filter-label">分类:</span>
          <div class="filter-buttons">
            <button
              v-for="f in skillFilters"
              :key="f.key"
              :class="{ active: currentFilter === f.key }"
              @click="currentFilter = f.key"
            >
              {{ f.name }}
              <span v-if="getFilterCount(f.key) > 0" class="filter-count">{{ getFilterCount(f.key) }}</span>
            </button>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">排序:</span>
          <div class="filter-buttons">
            <button
              v-for="s in sortOptions"
              :key="s.key"
              :class="{ active: currentSort === s.key }"
              @click="toggleSort(s.key)"
            >
              {{ s.name }}
              <span v-if="currentSort === s.key" class="sort-arrow">{{ sortAsc ? '↑' : '↓' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredLearnedSkills.length === 0" class="empty-hint">
        {{ learnedSkills.length === 0 ? '暂无已学习的技能，击杀怪物可获得技能书' : '该分类下没有技能' }}
      </div>
      <div class="skill-list">
        <div
          v-for="skill in filteredLearnedSkills"
          :key="skill.id"
          class="skill-item"
          :class="{ passive: skill.type === 'passive' }"
          :style="{ borderLeftColor: getRarityColor(skill.rarity) }"
          @click="selectSkill(skill)"
        >
          <div class="skill-header">
            <span class="skill-name" :style="{ color: getRarityColor(skill.rarity) }">{{ skill.name }}</span>
            <span class="skill-type">{{ skill.type === 'passive' ? '被动' : '主动' }}</span>
            <span class="skill-level">Lv.{{ skill.currentLevel }}/{{ skill.maxLevel }}</span>
          </div>
          <div class="skill-desc">{{ skill.description }}</div>
          <div class="skill-info">
            <span v-if="skill.type === 'active'">伤害: {{ (skill.damageMultiplier * 100).toFixed(0) }}%</span>
            <span v-if="skill.type === 'active'">冷却: {{ skill.cooldown }}回合</span>
            <span v-if="skill.isEquipped" class="equipped-tag">已装备</span>
          </div>
          <!-- 经验条 -->
          <div class="skill-exp" v-if="skill.currentLevel < skill.maxLevel">
            <div class="exp-bar-container">
              <div
                class="exp-bar"
                :style="{ width: (skill.currentExp / skill.expToNextLevel * 100) + '%' }"
              ></div>
            </div>
            <span class="exp-text">{{ skill.currentExp }}/{{ skill.expToNextLevel }}</span>
          </div>
          <div v-else class="skill-max">已满级</div>
        </div>
      </div>
    </div>

    <!-- 背包技能书 -->
    <div v-if="activeTab === 'inventory'" class="content-section">
      <div class="section-title">技能书</div>
      <div v-if="skillBooks.length === 0" class="empty-hint">
        背包中没有技能书
      </div>
      <div class="skillbook-list">
        <div
          v-for="(item, index) in skillBooks"
          :key="item.id"
          class="skillbook-item"
          :style="{ borderColor: getRarityColor(item.rarity) }"
        >
          <div class="skillbook-info">
            <span class="skillbook-name" :style="{ color: getRarityColor(item.rarity) }">{{ item.name }}</span>
            <span class="skillbook-rarity">[{{ getRarityName(item.rarity) }}]</span>
          </div>
          <div class="skillbook-actions">
            <button
              @click="handleUseSkillBook(index)"
              :disabled="isSkillLearned(item.skillId)"
              class="use-btn"
            >
              {{ isSkillLearned(item.skillId) ? '已学会' : '使用' }}
            </button>
            <button @click="handleDiscardSkillBook(index)" class="discard-btn">丢弃</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 技能详情弹窗 -->
    <div v-if="selectedSkill" class="skill-modal" @click.self="selectedSkill = null">
      <div class="skill-detail">
        <div class="detail-header" :style="{ color: getRarityColor(selectedSkill.rarity) }">
          {{ selectedSkill.name }}
          <span class="rarity-tag">[{{ getRarityName(selectedSkill.rarity) }}]</span>
        </div>
        <div class="detail-type">{{ selectedSkill.type === 'passive' ? '被动技能' : '主动技能' }}</div>
        <div class="detail-desc">{{ selectedSkill.description }}</div>

        <div class="detail-stats">
          <div v-if="selectedSkill.type === 'active'">
            <div>当前伤害: <span class="highlight">{{ (selectedSkill.damageMultiplier * 100).toFixed(0) }}%</span></div>
            <div>冷却时间: {{ selectedSkill.cooldown }} 回合</div>
            <div v-if="selectedSkill.effect">特效: {{ getEffectDescription(selectedSkill) }}</div>
          </div>
          <div v-else>
            <div>属性加成 (Lv.{{ selectedSkill.currentLevel }}):</div>
            <div v-for="(value, stat) in getPassiveBonus(selectedSkill)" :key="stat" class="passive-bonus">
              {{ statNames[stat] || stat }}: +{{ value }}{{ percentStats.includes(stat) ? '%' : '' }}
            </div>
          </div>
        </div>

        <div class="detail-level">
          <span>等级: {{ selectedSkill.currentLevel }} / {{ selectedSkill.maxLevel }}</span>
          <div v-if="selectedSkill.currentLevel < selectedSkill.maxLevel" class="exp-progress">
            经验: {{ selectedSkill.currentExp }} / {{ selectedSkill.expToNextLevel }}
          </div>
        </div>

        <div class="detail-actions">
          <button
            v-if="!selectedSkill.isEquipped"
            @click="handleEquipSkill(selectedSkill.id)"
            :disabled="isSlotsFull(selectedSkill.type)"
            class="equip-btn"
          >
            {{ isSlotsFull(selectedSkill.type) ? '技能栏已满' : '装备' }}
          </button>
          <button
            v-if="selectedSkill.isEquipped"
            @click="handleUnequipSkill(selectedSkill.id)"
            class="unequip-btn"
          >
            卸下
          </button>
          <button @click="selectedSkill = null" class="close-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { skills, skillRarityConfig, getPassiveSkillStats } from '../../data/gameData'
import {
  gameState,
  getLearnedSkillsWithDetails,
  getEquippedActiveSkillsWithDetails,
  getEquippedPassiveSkillsWithDetails,
  useSkillBook,
  equipSkill,
  unequipSkill,
  discardItem,
  getMaxPassiveSlots
} from '../../store/gameStore'

export default {
  name: 'SkillPanel',
  data() {
    return {
      activeTab: 'learned',
      selectedSkill: null,
      currentFilter: 'all',
      currentSort: 'default',
      sortAsc: false,
      skillFilters: [
        { key: 'all', name: '全部' },
        { key: 'active', name: '主动' },
        { key: 'passive', name: '被动' },
        { key: 'equipped', name: '已装备' }
      ],
      sortOptions: [
        { key: 'default', name: '默认' },
        { key: 'level', name: '等级' },
        { key: 'rarity', name: '稀有度' },
        { key: 'name', name: '名称' }
      ],
      rarityOrder: { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 },
      statNames: {
        hp: '生命',
        attack: '攻击',
        defense: '防御',
        critRate: '暴击率',
        critResist: '抗暴击',
        critDamage: '暴击伤害',
        dodge: '闪避',
        hit: '命中',
        penetration: '穿透',
        skillDamage: '技能伤害',
        lifesteal: '吸血',
        damageReduction: '减伤',
        hpRegen: '回复',
        thorns: '反伤',
        hpPercent: '生命',
        attackPercent: '攻击',
        defensePercent: '防御',
        lowHpDefenseBonus: '低血防御',
        fatalReflect: '致命反伤'
      },
      percentStats: ['hpPercent', 'attackPercent', 'defensePercent', 'lowHpDefenseBonus', 'fatalReflect']
    }
  },
  computed: {
    player() {
      return gameState.player
    },
    learnedSkills() {
      return getLearnedSkillsWithDetails()
    },
    equippedActiveSkills() {
      return getEquippedActiveSkillsWithDetails()
    },
    equippedPassiveSkills() {
      return getEquippedPassiveSkillsWithDetails()
    },
    maxPassiveSlots() {
      return getMaxPassiveSlots()
    },
    skillBooks() {
      return gameState.player.inventory.filter(item => item.type === 'skillBook')
    },
    filteredLearnedSkills() {
      let result = [...this.learnedSkills]

      // 分类筛选
      if (this.currentFilter === 'active') {
        result = result.filter(s => s.type === 'active')
      } else if (this.currentFilter === 'passive') {
        result = result.filter(s => s.type === 'passive')
      } else if (this.currentFilter === 'equipped') {
        result = result.filter(s => s.isEquipped)
      }

      // 排序
      if (this.currentSort !== 'default') {
        result.sort((a, b) => {
          let compareValue = 0
          if (this.currentSort === 'level') {
            compareValue = a.currentLevel - b.currentLevel
          } else if (this.currentSort === 'rarity') {
            compareValue = (this.rarityOrder[a.rarity] || 0) - (this.rarityOrder[b.rarity] || 0)
          } else if (this.currentSort === 'name') {
            compareValue = a.name.localeCompare(b.name, 'zh-CN')
          }
          return this.sortAsc ? compareValue : -compareValue
        })
      }

      return result
    }
  },
  methods: {
    getRarityColor(rarity) {
      return skillRarityConfig[rarity]?.color || '#ffffff'
    },
    getRarityName(rarity) {
      return skillRarityConfig[rarity]?.name || '普通'
    },
    isSkillLearned(skillId) {
      return !!gameState.player.learnedSkills[skillId]
    },
    selectSkill(skill) {
      this.selectedSkill = skill
    },
    handleUseSkillBook(index) {
      useSkillBook(index)
    },
    handleDiscardSkillBook(index) {
      const item = gameState.player.inventory.filter(i => i.type === 'skillBook')[index]
      if (item && confirm(`确定要丢弃【${item.name}】吗？`)) {
        // 找到实际索引
        const actualIndex = gameState.player.inventory.findIndex(i => i.id === item.id)
        if (actualIndex > -1) {
          gameState.player.inventory.splice(actualIndex, 1)
        }
      }
    },
    handleEquipSkill(skillId) {
      if (equipSkill(skillId)) {
        // 更新选中技能的装备状态
        if (this.selectedSkill && this.selectedSkill.id === skillId) {
          this.selectedSkill.isEquipped = true
        }
      }
    },
    handleUnequipSkill(skillId) {
      if (unequipSkill(skillId)) {
        // 更新选中技能的装备状态
        if (this.selectedSkill && this.selectedSkill.id === skillId) {
          this.selectedSkill.isEquipped = false
        }
      }
    },
    getPassiveBonus(skill) {
      return getPassiveSkillStats(skill, skill.currentLevel)
    },
    getEffectDescription(skill) {
      const effects = {
        slow: `减速${skill.effectValue}%`,
        freeze: `冰冻${skill.effectValue}回合`,
        burn: `灼烧${skill.effectValue}%/回合`,
        pen: `穿透+${skill.effectValue}%`,
        critBoost: `暴击率+${skill.effectValue}%`,
        aoe: '群体伤害',
        lifesteal: `吸血${skill.effectValue}%`,
        charge: `蓄力1回合，攻击${skill.hitCount}个目标`,
        heal: `恢复${(skill.baseDamageMultiplier * 100).toFixed(0)}%攻击力的生命`,
        attackBuff: `攻击+${skill.effectValue}%，${skill.effectDuration}回合`,
        critBuff: `暴击+${skill.effectValue}%，${skill.effectDuration}回合`,
        defenseBuff: `防御+${skill.effectValue}%，${skill.effectDuration}回合`,
        shield: `护盾${skill.effectValue}%最大生命`,
        sacrifice: `消耗${skill.effectValue}%生命`
      }
      return effects[skill.effect] || skill.effect
    },
    isSlotsFull(skillType) {
      if (skillType === 'active') {
        return this.equippedActiveSkills.length >= 4
      } else {
        return this.equippedPassiveSkills.length >= this.maxPassiveSlots
      }
    },
    getPassiveBonusText(skill) {
      if (!skill.bonusStats) return ''
      const texts = []
      for (const [stat, value] of Object.entries(skill.bonusStats)) {
        const name = this.statNames[stat] || stat
        if (this.percentStats.includes(stat)) {
          texts.push(`${name}+${value}%`)
        } else {
          texts.push(`${name}+${value}`)
        }
      }
      return texts.join(' ')
    },
    getFilterCount(filterKey) {
      if (filterKey === 'all') {
        return this.learnedSkills.length
      } else if (filterKey === 'active') {
        return this.learnedSkills.filter(s => s.type === 'active').length
      } else if (filterKey === 'passive') {
        return this.learnedSkills.filter(s => s.type === 'passive').length
      } else if (filterKey === 'equipped') {
        return this.learnedSkills.filter(s => s.isEquipped).length
      }
      return 0
    },
    toggleSort(sortKey) {
      if (this.currentSort === sortKey) {
        this.sortAsc = !this.sortAsc
      } else {
        this.currentSort = sortKey
        this.sortAsc = false
      }
    }
  }
}
</script>

<style scoped>
.skill-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #4a4a6a;
  border-radius: 10px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #4a4a6a;
}

.panel-header h3 {
  margin: 0;
  color: #ffd700;
  font-size: 1.1em;
}

.tabs {
  display: flex;
  gap: 5px;
}

.tabs button {
  padding: 4px 10px;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  background: #2a2a4a;
  color: #aaa;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.2s;
}

.tabs button.active {
  background: #4a4a6a;
  color: #fff;
  border-color: #87ceeb;
}

.tabs button:hover {
  background: #3a3a5a;
}

.equipped-section {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #3a3a5a;
}

.section-title {
  color: #87ceeb;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.equipped-skills {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.equipped-skills.passive-skills {
  grid-template-columns: repeat(2, 1fr);
}

.passive-section {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #3a3a5a;
}

.equipped-skill {
  background: #2a2a4a;
  border: 2px solid #4a4a6a;
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75em;
}

.equipped-skill:hover {
  background: #3a3a5a;
}

.equipped-skill.empty {
  border-style: dashed;
  color: #666;
  cursor: default;
}

.equipped-skill .skill-name {
  display: block;
  color: #fff;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipped-skill .skill-level {
  display: block;
  color: #ffd700;
  font-size: 0.9em;
}

.equipped-skill .skill-dmg {
  display: block;
  color: #ff6b6b;
  font-size: 0.85em;
}

.equipped-skill .skill-bonus {
  display: block;
  color: #98fb98;
  font-size: 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipped-skill.passive-skill {
  background: #2a3a4a;
}

.content-section {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 筛选排序区域 */
.filter-sort-section {
  background: #2a2a4a;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 10px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  color: #888;
  font-size: 0.75em;
  min-width: 35px;
  flex-shrink: 0;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.filter-buttons button {
  padding: 3px 8px;
  background: #1a1a2e;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  color: #888;
  font-size: 0.7em;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 3px;
}

.filter-buttons button:hover {
  background: #3a3a5a;
  color: #aaa;
}

.filter-buttons button.active {
  background: #4a4a6a;
  color: #fff;
  border-color: #87ceeb;
}

.filter-count {
  background: #5a5a7a;
  padding: 0 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.sort-arrow {
  color: #87ceeb;
  font-size: 0.9em;
}

.empty-hint {
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 0.85em;
}

.skill-list, .skillbook-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 280px;
  padding-right: 5px;
}

.skill-item {
  background: #2a2a4a;
  border: 1px solid #3a3a5a;
  border-left: 3px solid #4a4a6a;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-item:hover {
  background: #3a3a5a;
}

.skill-item.passive {
  background: #2a3a4a;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.skill-name {
  font-weight: bold;
  font-size: 0.9em;
}

.skill-type {
  color: #87ceeb;
  font-size: 0.75em;
  padding: 1px 4px;
  background: #1a1a2e;
  border-radius: 3px;
}

.skill-level {
  margin-left: auto;
  color: #ffd700;
  font-size: 0.8em;
}

.skill-desc {
  color: #888;
  font-size: 0.75em;
  margin-bottom: 4px;
}

.skill-info {
  display: flex;
  gap: 10px;
  font-size: 0.75em;
  color: #aaa;
}

.equipped-tag {
  color: #2ecc71;
  font-weight: bold;
}

.skill-exp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.exp-bar-container {
  flex: 1;
  height: 4px;
  background: #1a1a2e;
  border-radius: 2px;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  background: linear-gradient(90deg, #9b59b6, #d8b4fe);
  transition: width 0.3s;
}

.exp-text {
  color: #888;
  font-size: 0.7em;
  min-width: 60px;
  text-align: right;
}

.skill-max {
  color: #2ecc71;
  font-size: 0.75em;
  margin-top: 4px;
}

/* 技能书列表 */
.skillbook-item {
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skillbook-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skillbook-name {
  font-weight: bold;
  font-size: 0.9em;
}

.skillbook-rarity {
  color: #888;
  font-size: 0.75em;
}

.skillbook-actions {
  display: flex;
  gap: 6px;
}

.use-btn, .discard-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.2s;
}

.use-btn {
  background: #27ae60;
  color: white;
}

.use-btn:hover:not(:disabled) {
  background: #2ecc71;
}

.use-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.discard-btn {
  background: #5a3a3a;
  color: #ff9999;
}

.discard-btn:hover {
  background: #7a4a4a;
}

/* 弹窗 */
.skill-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.skill-detail {
  background: #1a1a2e;
  border: 2px solid #4a4a6a;
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  max-width: 380px;
}

.detail-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 4px;
}

.rarity-tag {
  font-size: 0.7em;
  font-weight: normal;
  margin-left: 8px;
}

.detail-type {
  color: #87ceeb;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.detail-desc {
  color: #888;
  font-size: 0.85em;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3a3a5a;
}

.detail-stats {
  background: #2a2a4a;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.85em;
  color: #aaa;
}

.detail-stats .highlight {
  color: #ff6b6b;
  font-weight: bold;
}

.passive-bonus {
  color: #98fb98;
  margin-left: 10px;
}

.detail-level {
  font-size: 0.85em;
  color: #ffd700;
  margin-bottom: 15px;
}

.exp-progress {
  color: #888;
  font-size: 0.9em;
  margin-top: 4px;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.detail-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.equip-btn {
  background: #27ae60;
  color: white;
}

.equip-btn:hover:not(:disabled) {
  background: #2ecc71;
}

.equip-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.unequip-btn {
  background: #e74c3c;
  color: white;
}

.unequip-btn:hover {
  background: #c0392b;
}

.close-btn {
  background: #7f8c8d;
  color: white;
}

.close-btn:hover {
  background: #95a5a6;
}
</style>
