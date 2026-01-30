<template>
  <div class="equipment-panel">
    <div class="panel-header">
      <h3>装备栏</h3>
    </div>

    <!-- 装备槽位 -->
    <div class="equip-slots">
      <div
        v-for="(slot, key) in equipSlots"
        :key="key"
        class="equip-slot"
        :class="{ equipped: equipment[key] }"
        @click="handleSlotClick(key)"
        @mouseenter="equipment[key] && showTooltip($event, equipment[key])"
        @mouseleave="hideTooltip"
      >
        <div class="slot-icon">{{ slot.icon }}</div>
        <div class="slot-name">{{ slot.name }}</div>
        <div v-if="equipment[key]" class="equipped-item" :style="{ color: equipment[key].qualityColor }">
          <div class="item-name">
            {{ equipment[key].name }}
            <span v-if="equipment[key].enhanceLevel > 0" class="enhance-tag">+{{ equipment[key].enhanceLevel }}</span>
          </div>
          <div class="item-level">Lv.{{ equipment[key].level }}</div>
        </div>
        <div v-else class="empty-slot">空</div>
      </div>
    </div>

    <!-- 背包 -->
    <div class="inventory-section">
      <div class="inventory-header">
        <h4>背包 ({{ inventory.length }}/50)</h4>
        <button
          v-if="filteredInventory.length > 0"
          @click="handleDiscardAll"
          class="discard-all-btn"
        >
          一键丢弃
        </button>
      </div>

      <!-- 分类筛选 -->
      <div class="filter-tabs">
        <button
          v-for="filter in filters"
          :key="filter.key"
          :class="{ active: currentFilter === filter.key }"
          @click="currentFilter = filter.key"
        >
          {{ filter.name }}
          <span v-if="getFilterCount(filter.key) > 0" class="filter-count">{{ getFilterCount(filter.key) }}</span>
        </button>
      </div>

      <div class="inventory-grid">
        <div
          v-for="item in filteredInventory"
          :key="item.id"
          class="inventory-item"
          :style="{ borderColor: getItemBorderColor(item) }"
          @click="selectedItem = item"
          @mouseenter="showTooltip($event, item)"
          @mouseleave="hideTooltip"
          :class="{
            selected: selectedItem && selectedItem.id === item.id,
            'cannot-equip': item.type !== 'skillBook' && !canEquip(item),
            locked: item.locked
          }"
        >
          <div class="item-icon">{{ getItemIcon(item) }}</div>
          <div class="item-info">
            <div class="item-name" :style="{ color: getItemColor(item) }">{{ item.name }}</div>
            <div class="item-level">
              <template v-if="item.type === 'skillBook'">
                [{{ getRarityName(item.rarity) }}] 技能书
              </template>
              <template v-else>
                Lv.{{ item.level }} {{ item.qualityName }}
                <span v-if="!canEquip(item)" class="req-level">(需{{ item.requiredLevel }}级)</span>
              </template>
            </div>
          </div>
          <div class="lock-icon" @click.stop="toggleLock(item)" :title="item.locked ? '点击解锁' : '点击锁定'">
            {{ item.locked ? '🔒' : '🔓' }}
          </div>
        </div>
        <div v-if="filteredInventory.length === 0" class="empty-inventory">
          {{ currentFilter === 'all' ? '背包空空如也' : '该分类下没有物品' }}
        </div>
      </div>
    </div>

    <!-- 物品详情弹窗 -->
    <div v-if="selectedItem" class="item-detail-modal" @click.self="selectedItem = null">
      <div class="item-detail" :style="{ borderColor: getItemBorderColor(selectedItem) }">
        <div class="detail-header" :style="{ color: getItemColor(selectedItem) }">
          {{ getItemIcon(selectedItem) }} {{ selectedItem.name }}
          <span v-if="selectedItem.locked" class="lock-badge">🔒 已锁定</span>
        </div>

        <!-- 技能书详情 -->
        <template v-if="selectedItem.type === 'skillBook'">
          <div class="detail-quality">
            [{{ getRarityName(selectedItem.rarity) }}] 技能书
          </div>
          <div class="detail-desc">
            使用后可学习技能
          </div>
          <div class="detail-actions">
            <button
              @click="handleUseSkillBook"
              class="equip-btn"
              :disabled="isSkillLearned(selectedItem.skillId)"
            >
              {{ isSkillLearned(selectedItem.skillId) ? '已学会' : '使用' }}
            </button>
            <button @click="toggleLock(selectedItem)" class="lock-btn">
              {{ selectedItem.locked ? '解锁' : '锁定' }}
            </button>
            <button
              @click="handleDiscard(selectedItem)"
              class="discard-btn"
              :disabled="selectedItem.locked"
            >
              丢弃
            </button>
            <button @click="selectedItem = null" class="close-btn">关闭</button>
          </div>
        </template>

        <!-- 装备详情 -->
        <template v-else>
          <div class="detail-quality">
            {{ selectedItem.qualityName }} · Lv.{{ selectedItem.level }}
            <span v-if="selectedItem.enhanceLevel > 0" class="enhance-tag">+{{ selectedItem.enhanceLevel }}</span>
            <span v-if="selectedItem.requiredLevel" :class="{ 'level-ok': canEquip(selectedItem), 'level-low': !canEquip(selectedItem) }">
              (需要 {{ selectedItem.requiredLevel }} 级)
            </span>
          </div>
          <div class="detail-stats">
            <div v-for="(value, stat) in selectedItem.stats" :key="stat" class="stat-row">
              <span class="stat-name">{{ statNames[stat] || stat }}</span>
              <span class="stat-value" :class="getStatClass(stat)">
                +{{ formatStat(stat, value) }}
                <span v-if="selectedItem.enhanceLevel > 0" class="enhanced-value">
                  ({{ formatStat(stat, getEnhancedValue(value, selectedItem.enhanceLevel)) }})
                </span>
              </span>
            </div>
          </div>
          <div class="detail-actions">
            <button
              @click="handleEquip(selectedItem)"
              class="equip-btn"
              :disabled="!canEquip(selectedItem)"
              :class="{ disabled: !canEquip(selectedItem) }"
            >
              {{ canEquip(selectedItem) ? '装备' : '等级不足' }}
            </button>
            <button @click="toggleLock(selectedItem)" class="lock-btn">
              {{ selectedItem.locked ? '解锁' : '锁定' }}
            </button>
            <button
              @click="handleDiscard(selectedItem)"
              class="discard-btn"
              :disabled="selectedItem.locked"
            >
              丢弃
            </button>
            <button @click="selectedItem = null" class="close-btn">关闭</button>
          </div>
        </template>
      </div>
    </div>

    <!-- 强化面板弹窗 -->
    <div v-if="enhanceItem" class="item-detail-modal" @click.self="enhanceItem = null">
      <div class="enhance-panel" :style="{ borderColor: enhanceItem.qualityColor }">
        <div class="enhance-header" :style="{ color: enhanceItem.qualityColor }">
          {{ enhanceItem.icon }} {{ enhanceItem.name }}
          <span v-if="enhanceItem.enhanceLevel > 0" class="enhance-level">+{{ enhanceItem.enhanceLevel }}</span>
        </div>

        <div class="enhance-info">
          <div class="enhance-quality">{{ enhanceItem.qualityName }} · Lv.{{ enhanceItem.level }}</div>

          <!-- 强化属性预览 -->
          <div class="enhance-stats">
            <div v-for="(value, stat) in enhanceItem.stats" :key="stat" class="enhance-stat-row">
              <span class="stat-name">{{ statNames[stat] || stat }}</span>
              <span class="stat-base">{{ formatStat(stat, value) }}</span>
              <span v-if="enhanceItem.enhanceLevel > 0" class="stat-enhanced">
                ({{ formatStat(stat, getEnhancedValue(value, enhanceItem.enhanceLevel)) }})
              </span>
            </div>
          </div>

          <!-- 强化信息 -->
          <div class="enhance-details">
            <div class="enhance-row">
              <span>当前强化等级</span>
              <span class="enhance-current">+{{ enhanceItem.enhanceLevel || 0 }} / 10</span>
            </div>
            <div class="enhance-row">
              <span>强化费用</span>
              <span class="enhance-cost" :class="{ affordable: canAffordEnhance }">
                {{ getEnhanceCostValue() }} 灵石
              </span>
            </div>
            <div class="enhance-row">
              <span>成功率</span>
              <span class="enhance-rate" :class="getSuccessRateClass()">
                {{ getEnhanceRate() }}%
              </span>
            </div>
            <div v-if="(enhanceItem.enhanceLevel || 0) >= 6" class="enhance-warning">
              ⚠️ +6以上强化失败会掉落1-3级
            </div>
          </div>

          <!-- 强化结果提示 -->
          <div v-if="enhanceResult" class="enhance-result" :class="enhanceResult.success ? 'success' : 'fail'">
            {{ enhanceResult.message }}
          </div>
        </div>

        <div class="enhance-actions">
          <button
            @click="handleEnhance"
            class="enhance-btn"
            :disabled="!canEnhance"
          >
            {{ getEnhanceButtonText() }}
          </button>
          <button @click="handleUnequipFromEnhance" class="unequip-btn">卸下</button>
          <button @click="enhanceItem = null" class="close-btn">关闭</button>
        </div>
      </div>
    </div>

    <!-- 悬浮提示框 -->
    <div
      v-if="tooltipItem"
      class="item-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      <div class="tooltip-header" :style="{ color: getItemColor(tooltipItem) }">
        {{ getItemIcon(tooltipItem) }} {{ tooltipItem.name }}
        <span v-if="tooltipItem.enhanceLevel > 0" class="enhance-tag">+{{ tooltipItem.enhanceLevel }}</span>
      </div>
      <template v-if="tooltipItem.type === 'skillBook'">
        <div class="tooltip-quality">[{{ getRarityName(tooltipItem.rarity) }}] 技能书</div>
        <div class="tooltip-desc">使用后可学习技能</div>
      </template>
      <template v-else>
        <div class="tooltip-quality">{{ tooltipItem.qualityName }} · Lv.{{ tooltipItem.level }}</div>
        <div class="tooltip-stats">
          <div v-for="(value, stat) in tooltipItem.stats" :key="stat" class="tooltip-stat">
            <span>{{ statNames[stat] || stat }}</span>
            <span :class="getStatClass(stat)">
              +{{ formatStat(stat, value) }}
              <template v-if="tooltipItem.enhanceLevel > 0">
                ({{ formatStat(stat, getEnhancedValue(value, tooltipItem.enhanceLevel)) }})
              </template>
            </span>
          </div>
        </div>
        <div v-if="tooltipItem.requiredLevel" class="tooltip-req">
          需要等级: {{ tooltipItem.requiredLevel }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { equipSlots, skillRarityConfig, getEnhanceSuccessRate, getEnhanceCost, getEnhancedStatValue } from '../../data/gameData'
import { gameState, equipItem, unequipItem, discardItem, useSkillBook, autoSave, enhanceEquipment, getEnhancedStats } from '../../store/gameStore'

export default {
  name: 'EquipmentPanel',
  data() {
    return {
      equipSlots,
      selectedItem: null,
      enhanceItem: null,
      enhanceSlotType: null,
      enhanceResult: null,
      currentFilter: 'all',
      tooltipItem: null,
      tooltipX: 0,
      tooltipY: 0,
      filters: [
        { key: 'all', name: '全部' },
        { key: 'weapon', name: '武器' },
        { key: 'armor', name: '衣服' },
        { key: 'helmet', name: '头饰' },
        { key: 'ring', name: '戒指' },
        { key: 'necklace', name: '项链' },
        { key: 'boots', name: '鞋子' },
        { key: 'artifact', name: '法宝' },
        { key: 'skillBook', name: '技能书' }
      ],
      statNames: {
        hp: '生命值',
        attack: '攻击力',
        defense: '防御力',
        critRate: '暴击率',
        critResist: '抗暴击',
        critDamage: '暴击伤害',
        dodge: '闪避率',
        hit: '命中率',
        penetration: '忽视防御',
        skillDamage: '技能伤害',
        dropRate: '掉落率',
        damageReduction: '伤害减免',
        hpRegen: '生命回复'
      }
    }
  },
  computed: {
    equipment() {
      return gameState.player.equipment
    },
    inventory() {
      return gameState.player.inventory
    },
    filteredInventory() {
      if (this.currentFilter === 'all') {
        return this.inventory
      }
      if (this.currentFilter === 'skillBook') {
        return this.inventory.filter(item => item.type === 'skillBook')
      }
      return this.inventory.filter(item => item.slotType === this.currentFilter)
    },
    playerLevel() {
      return gameState.player.level
    },
    playerGold() {
      return gameState.player.gold
    },
    canAffordEnhance() {
      if (!this.enhanceItem) return false
      return this.playerGold >= this.getEnhanceCostValue()
    },
    canEnhance() {
      if (!this.enhanceItem) return false
      if ((this.enhanceItem.enhanceLevel || 0) >= 10) return false
      return this.canAffordEnhance
    }
  },
  methods: {
    getFilterCount(filterKey) {
      if (filterKey === 'all') {
        return this.inventory.length
      }
      if (filterKey === 'skillBook') {
        return this.inventory.filter(item => item.type === 'skillBook').length
      }
      return this.inventory.filter(item => item.slotType === filterKey).length
    },
    canEquip(item) {
      if (item.type === 'skillBook') return true
      if (!item.requiredLevel) return true
      return this.playerLevel >= item.requiredLevel
    },
    handleSlotClick(slotType) {
      if (this.equipment[slotType]) {
        // 打开强化面板
        this.enhanceItem = this.equipment[slotType]
        this.enhanceSlotType = slotType
        this.enhanceResult = null
      }
    },
    handleEquip(item) {
      if (!this.canEquip(item)) return
      equipItem(item)
      this.selectedItem = null
    },
    handleDiscard(item) {
      if (item.locked) {
        alert('该物品已锁定，无法丢弃')
        return
      }
      if (confirm(`确定丢弃【${item.name}】吗？`)) {
        discardItem(item)
        this.selectedItem = null
      }
    },
    handleDiscardAll() {
      const unlocked = this.filteredInventory.filter(item => !item.locked)
      if (unlocked.length === 0) {
        alert('没有可丢弃的物品（所有物品已锁定）')
        return
      }
      const filterName = this.filters.find(f => f.key === this.currentFilter)?.name || '当前分类'
      if (confirm(`确定丢弃【${filterName}】下所有未锁定的 ${unlocked.length} 件物品吗？`)) {
        for (const item of unlocked) {
          const index = gameState.player.inventory.findIndex(i => i.id === item.id)
          if (index > -1) {
            gameState.player.inventory.splice(index, 1)
          }
        }
        autoSave()
      }
    },
    toggleLock(item) {
      item.locked = !item.locked
      autoSave()
    },
    handleUseSkillBook() {
      if (!this.selectedItem || this.selectedItem.type !== 'skillBook') return
      const index = gameState.player.inventory.findIndex(i => i.id === this.selectedItem.id)
      if (index > -1) {
        useSkillBook(index)
        this.selectedItem = null
      }
    },
    isSkillLearned(skillId) {
      return !!gameState.player.learnedSkills[skillId]
    },
    getItemIcon(item) {
      if (item.type === 'skillBook') {
        return '📖'
      }
      return item.icon || '📦'
    },
    getItemColor(item) {
      if (item.type === 'skillBook') {
        return skillRarityConfig[item.rarity]?.color || '#ffffff'
      }
      return item.qualityColor || '#ffffff'
    },
    getItemBorderColor(item) {
      if (item.locked) {
        return '#ffd700' // 锁定物品金色边框
      }
      return this.getItemColor(item)
    },
    getRarityName(rarity) {
      return skillRarityConfig[rarity]?.name || '普通'
    },
    formatStat(stat, value) {
      const percentStats = ['critRate', 'critResist', 'critDamage', 'dodge', 'hit', 'penetration', 'skillDamage', 'dropRate']
      if (percentStats.includes(stat)) {
        return value.toFixed(1) + '%'
      }
      return Math.floor(value)
    },
    getStatClass(stat) {
      const colorMap = {
        hp: 'hp-color',
        attack: 'atk-color',
        defense: 'def-color',
        critRate: 'crit-color',
        critDamage: 'crit-color',
        penetration: 'pen-color',
        skillDamage: 'skill-color',
        dropRate: 'drop-color'
      }
      return colorMap[stat] || ''
    },
    showTooltip(event, item) {
      this.tooltipItem = item
      const rect = event.target.getBoundingClientRect()
      this.tooltipX = rect.right + 10
      this.tooltipY = rect.top
      // 防止超出屏幕右侧
      if (this.tooltipX + 220 > window.innerWidth) {
        this.tooltipX = rect.left - 230
      }
      // 防止超出屏幕底部
      if (this.tooltipY + 200 > window.innerHeight) {
        this.tooltipY = window.innerHeight - 210
      }
    },
    hideTooltip() {
      this.tooltipItem = null
    },
    // 强化相关方法
    getEnhancedValue(baseValue, enhanceLevel) {
      return getEnhancedStatValue(baseValue, enhanceLevel)
    },
    getEnhanceCostValue() {
      if (!this.enhanceItem) return 0
      return getEnhanceCost(this.enhanceItem.level, this.enhanceItem.enhanceLevel || 0)
    },
    getEnhanceRate() {
      if (!this.enhanceItem) return 0
      return getEnhanceSuccessRate(this.enhanceItem.enhanceLevel || 0)
    },
    getSuccessRateClass() {
      const rate = this.getEnhanceRate()
      if (rate >= 80) return 'rate-high'
      if (rate >= 50) return 'rate-mid'
      return 'rate-low'
    },
    getEnhanceButtonText() {
      if (!this.enhanceItem) return '强化'
      if ((this.enhanceItem.enhanceLevel || 0) >= 10) return '已满级'
      if (!this.canAffordEnhance) return '灵石不足'
      return `强化 (${this.getEnhanceCostValue()} 灵石)`
    },
    handleEnhance() {
      if (!this.canEnhance) return
      const result = enhanceEquipment(this.enhanceSlotType)
      this.enhanceResult = result
      // 刷新enhanceItem以更新显示
      this.enhanceItem = this.equipment[this.enhanceSlotType]
      // 3秒后清除结果提示
      setTimeout(() => {
        this.enhanceResult = null
      }, 3000)
    },
    handleUnequipFromEnhance() {
      if (this.enhanceSlotType) {
        unequipItem(this.enhanceSlotType)
        this.enhanceItem = null
        this.enhanceSlotType = null
      }
    }
  }
}
</script>

<style scoped>
.equipment-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #4a4a6a;
  border-radius: 10px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header h3 {
  margin: 0 0 15px 0;
  color: #ffd700;
  font-size: 1.1em;
}

.equip-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 15px;
}

.equip-slot {
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
}

.equip-slot:hover {
  border-color: #87ceeb;
}

.equip-slot.equipped {
  border-color: #98fb98;
  background: #2a3a2a;
}

.slot-icon {
  font-size: 1.2em;
  margin-bottom: 2px;
}

.slot-name {
  color: #888;
  font-size: 0.7em;
}

.equipped-item {
  margin-top: 4px;
}

.equipped-item .item-name {
  font-size: 0.75em;
  font-weight: bold;
}

.equipped-item .item-level {
  font-size: 0.65em;
  color: #aaa;
}

.empty-slot {
  color: #555;
  font-size: 0.7em;
  margin-top: 5px;
}

.inventory-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.inventory-header h4 {
  margin: 0;
  color: #87ceeb;
  font-size: 0.95em;
}

.discard-all-btn {
  padding: 4px 10px;
  background: #c0392b;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.75em;
  cursor: pointer;
}

.discard-all-btn:hover {
  background: #e74c3c;
}

/* 分类筛选 */
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.filter-tabs button {
  padding: 3px 8px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  color: #888;
  font-size: 0.7em;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button:hover {
  background: #3a3a5a;
  color: #aaa;
}

.filter-tabs button.active {
  background: #4a4a6a;
  color: #fff;
  border-color: #87ceeb;
}

.filter-count {
  background: #5a5a7a;
  padding: 0 4px;
  border-radius: 3px;
  margin-left: 3px;
  font-size: 0.9em;
}

.inventory-grid {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 420px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.inventory-item:hover,
.inventory-item.selected {
  background: #3a3a5a;
}

.inventory-item.locked {
  background: #2a2a3a;
  border-style: dashed;
}

.item-icon {
  font-size: 1.2em;
}

.item-info {
  flex: 1;
}

.item-info .item-name {
  font-size: 0.85em;
  font-weight: bold;
}

.item-info .item-level {
  font-size: 0.7em;
  color: #888;
}

.lock-icon {
  font-size: 1em;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.lock-icon:hover {
  opacity: 1;
}

.inventory-item.locked .lock-icon {
  opacity: 1;
}

.empty-inventory {
  color: #555;
  text-align: center;
  padding: 20px;
}

/* 物品详情弹窗 */
.item-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.item-detail {
  background: #1a1a2e;
  border: 2px solid;
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  max-width: 380px;
}

.detail-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lock-badge {
  font-size: 0.6em;
  background: #ffd700;
  color: #1a1a2e;
  padding: 2px 6px;
  border-radius: 4px;
}

.detail-quality {
  color: #888;
  margin-bottom: 15px;
  font-size: 0.9em;
}

.detail-desc {
  color: #aaa;
  font-size: 0.85em;
  margin-bottom: 15px;
  padding: 10px;
  background: #2a2a4a;
  border-radius: 6px;
}

.detail-stats {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.stat-name {
  color: #aaa;
}

.stat-value {
  color: #98fb98;
  font-weight: bold;
}

.stat-value.hp-color { color: #ff6b6b; }
.stat-value.atk-color { color: #ff9f43; }
.stat-value.def-color { color: #54a0ff; }
.stat-value.crit-color { color: #ff4757; }
.stat-value.pen-color { color: #6c5ce7; }
.stat-value.skill-color { color: #00d2d3; }
.stat-value.drop-color { color: #f39c12; }

.stat-value .enhanced-value {
  color: #ffd700;
  margin-left: 4px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-actions button {
  flex: 1;
  min-width: 60px;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
}

.equip-btn {
  background: #27ae60;
  color: white;
}

.equip-btn:hover:not(:disabled) {
  background: #2ecc71;
}

.lock-btn {
  background: #f39c12;
  color: white;
}

.lock-btn:hover {
  background: #f1c40f;
}

.discard-btn {
  background: #c0392b;
  color: white;
}

.discard-btn:hover:not(:disabled) {
  background: #e74c3c;
}

.discard-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.close-btn {
  background: #7f8c8d;
  color: white;
}

.close-btn:hover {
  background: #95a5a6;
}

.equip-btn.disabled,
.equip-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.level-ok {
  color: #2ecc71;
}

.level-low {
  color: #e74c3c;
}

.inventory-item.cannot-equip {
  opacity: 0.6;
}

.req-level {
  color: #e74c3c;
  font-size: 0.9em;
}

/* 悬浮提示框 */
.item-tooltip {
  position: fixed;
  background: #1a1a2e;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  max-width: 220px;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.tooltip-header {
  font-weight: bold;
  font-size: 0.95em;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #3a3a5a;
}

.tooltip-quality {
  color: #888;
  font-size: 0.8em;
  margin-bottom: 8px;
}

.tooltip-desc {
  color: #aaa;
  font-size: 0.8em;
  padding: 6px;
  background: #2a2a4a;
  border-radius: 4px;
}

.tooltip-stats {
  background: #2a2a4a;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
}

.tooltip-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  padding: 2px 0;
}

.tooltip-stat span:first-child {
  color: #aaa;
}

.tooltip-stat span:last-child {
  font-weight: bold;
  color: #98fb98;
}

.tooltip-stat .hp-color { color: #ff6b6b; }
.tooltip-stat .atk-color { color: #ff9f43; }
.tooltip-stat .def-color { color: #54a0ff; }
.tooltip-stat .crit-color { color: #ff4757; }
.tooltip-stat .pen-color { color: #6c5ce7; }
.tooltip-stat .skill-color { color: #00d2d3; }
.tooltip-stat .drop-color { color: #f39c12; }

.tooltip-req {
  color: #f39c12;
  font-size: 0.75em;
  text-align: right;
}

/* 强化标签 */
.enhance-tag {
  color: #ffd700;
  font-size: 0.85em;
  margin-left: 2px;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

/* 强化面板 */
.enhance-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  max-width: 400px;
}

.enhance-header {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.enhance-level {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.enhance-info {
  margin-bottom: 15px;
}

.enhance-quality {
  color: #888;
  font-size: 0.9em;
  margin-bottom: 12px;
}

.enhance-stats {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.enhance-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 0.9em;
}

.enhance-stat-row .stat-name {
  color: #aaa;
  flex: 1;
}

.enhance-stat-row .stat-base {
  color: #98fb98;
  margin-right: 8px;
}

.enhance-stat-row .stat-enhanced {
  color: #ffd700;
  font-weight: bold;
}

.enhance-details {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.enhance-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.9em;
  color: #aaa;
}

.enhance-current {
  color: #ffd700;
  font-weight: bold;
}

.enhance-cost {
  color: #ff6b6b;
}

.enhance-cost.affordable {
  color: #98fb98;
}

.enhance-rate {
  font-weight: bold;
}

.enhance-rate.rate-high {
  color: #2ecc71;
}

.enhance-rate.rate-mid {
  color: #f39c12;
}

.enhance-rate.rate-low {
  color: #e74c3c;
}

.enhance-warning {
  color: #f39c12;
  font-size: 0.8em;
  text-align: center;
  padding: 8px;
  margin-top: 8px;
  background: rgba(243, 156, 18, 0.1);
  border-radius: 4px;
}

.enhance-result {
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 10px;
  animation: fadeIn 0.3s;
}

.enhance-result.success {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

.enhance-result.fail {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.enhance-actions {
  display: flex;
  gap: 10px;
}

.enhance-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.enhance-btn {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  font-weight: bold;
}

.enhance-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f1c40f, #f39c12);
  box-shadow: 0 0 15px rgba(243, 156, 18, 0.5);
}

.enhance-btn:disabled {
  background: #555;
  color: #888;
  cursor: not-allowed;
}

.unequip-btn {
  background: #c0392b;
  color: white;
}

.unequip-btn:hover {
  background: #e74c3c;
}
</style>
