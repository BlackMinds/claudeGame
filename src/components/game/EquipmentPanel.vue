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
        <h4>背包 ({{ inventory.length }}/{{ inventoryLimit }})</h4>
        <div class="header-actions">
          <button
            @click="showLootFilterSettings = !showLootFilterSettings"
            class="settings-btn"
            :class="{ active: lootFilter.enabled }"
          >
            ⚙️ 拾取筛选
          </button>
          <button
            v-if="filteredInventory.length > 0"
            @click="handleSellAll"
            class="sell-all-btn"
          >
            一键出售
          </button>
        </div>
      </div>

      <!-- 拾取筛选设置面板 -->
      <div v-if="showLootFilterSettings" class="loot-filter-panel">
        <div class="loot-filter-row">
          <label class="filter-switch">
            <input type="checkbox" v-model="lootFilter.enabled" @change="saveLootFilter">
            <span class="switch-slider"></span>
            启用拾取筛选
          </label>
        </div>

        <div v-if="lootFilter.enabled" class="loot-filter-options">
          <div class="loot-filter-row">
            <span class="filter-option-label">最低拾取品质:</span>
            <div class="quality-select">
              <button
                v-for="q in qualityOptions"
                :key="q.key"
                :class="{ active: lootFilter.minQuality === q.key }"
                :style="{ color: q.color, borderColor: lootFilter.minQuality === q.key ? q.color : '' }"
                @click="setMinQuality(q.key)"
              >
                {{ q.name }}
              </button>
            </div>
          </div>

          <div class="loot-filter-row">
            <label class="filter-switch">
              <input type="checkbox" v-model="lootFilter.autoSellFiltered" @change="saveLootFilter">
              <span class="switch-slider"></span>
              自动卖出过滤装备
            </label>
          </div>

          <div class="loot-filter-row">
            <label class="filter-switch">
              <input type="checkbox" v-model="lootFilter.pickupSkillBooks" @change="saveLootFilter">
              <span class="switch-slider"></span>
              拾取技能书
            </label>
          </div>

          <div class="loot-filter-hint">
            {{ getLootFilterHint() }}
          </div>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="filter-section">
        <!-- 槽位筛选 -->
        <div class="filter-row">
          <span class="filter-label">类型:</span>
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
        </div>

        <!-- 品质筛选 -->
        <div class="filter-row">
          <span class="filter-label">品质:</span>
          <div class="filter-tabs quality-filters">
            <button
              v-for="quality in qualityFilters"
              :key="quality.key"
              :class="{ active: currentQuality === quality.key }"
              :style="quality.key !== 'all' ? { color: quality.color, borderColor: currentQuality === quality.key ? quality.color : '' } : {}"
              @click="currentQuality = quality.key"
            >
              {{ quality.name }}
            </button>
          </div>
        </div>

        <!-- 排序选项 -->
        <div class="filter-row">
          <span class="filter-label">排序:</span>
          <div class="filter-tabs sort-tabs">
            <button
              v-for="sort in sortOptions"
              :key="sort.key"
              :class="{ active: currentSort === sort.key }"
              @click="toggleSort(sort.key)"
            >
              {{ sort.name }}
              <span v-if="currentSort === sort.key" class="sort-arrow">{{ sortAsc ? '↑' : '↓' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="inventory-grid">
        <div
          v-for="item in filteredInventory"
          :key="item.id"
          class="inventory-item"
          :style="{ borderColor: getItemBorderColor(item), backgroundColor: getItemBgColor(item) }"
          @click="selectedItem = item"
          @mouseenter="showTooltip($event, item)"
          @mouseleave="hideTooltip"
          :class="{
            selected: selectedItem && selectedItem.id === item.id,
            'cannot-equip': item.type !== 'skillBook' && !canEquip(item),
            locked: item.locked
          }"
        >
          <div class="item-icon-large">{{ getItemIcon(item) }}</div>
          <div class="item-enhance" v-if="item.enhanceLevel > 0">+{{ item.enhanceLevel }}</div>
          <div class="item-level-badge">{{ item.level || '' }}</div>
          <div class="lock-badge" v-if="item.locked">🔒</div>
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
              @click="handleSell(selectedItem)"
              class="sell-btn"
              :disabled="selectedItem.locked"
            >
              出售 {{ getSellPrice(selectedItem) }}💰
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

          <!-- 装备对比 -->
          <div class="compare-section" v-if="getEquippedForSlot(selectedItem.slotType)">
            <div class="compare-header">
              <span class="compare-title">📊 装备对比</span>
            </div>
            <div class="compare-content">
              <div class="compare-column new-item">
                <div class="compare-label">背包装备</div>
                <div class="compare-item-name" :style="{ color: selectedItem.qualityColor }">
                  {{ selectedItem.name }}
                  <span v-if="selectedItem.enhanceLevel > 0">+{{ selectedItem.enhanceLevel }}</span>
                </div>
              </div>
              <div class="compare-column equipped-item">
                <div class="compare-label">已装备</div>
                <div class="compare-item-name" :style="{ color: getEquippedForSlot(selectedItem.slotType).qualityColor }">
                  {{ getEquippedForSlot(selectedItem.slotType).name }}
                  <span v-if="getEquippedForSlot(selectedItem.slotType).enhanceLevel > 0">+{{ getEquippedForSlot(selectedItem.slotType).enhanceLevel }}</span>
                </div>
              </div>
            </div>
            <div class="compare-stats">
              <div v-for="stat in getAllCompareStats(selectedItem)" :key="stat" class="compare-stat-row">
                <span class="compare-stat-name">{{ statNames[stat] || stat }}</span>
                <span class="compare-stat-new" :class="getCompareClass(selectedItem, stat, true)">
                  {{ getItemStatValue(selectedItem, stat) }}
                </span>
                <span class="compare-arrow">→</span>
                <span class="compare-stat-old">
                  {{ getItemStatValue(getEquippedForSlot(selectedItem.slotType), stat) }}
                </span>
                <span class="compare-diff" :class="getCompareClass(selectedItem, stat, true)">
                  ({{ getStatDiff(selectedItem, stat) }})
                </span>
              </div>
            </div>
          </div>

          <div class="detail-stats">
            <div class="stats-title" v-if="getEquippedForSlot(selectedItem.slotType)">属性详情</div>
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
            <button
              @click="openEnhanceForInventory(selectedItem)"
              class="enhance-btn"
            >
              强化
            </button>
            <button @click="toggleLock(selectedItem)" class="lock-btn">
              {{ selectedItem.locked ? '解锁' : '锁定' }}
            </button>
            <button
              @click="handleSell(selectedItem)"
              class="sell-btn"
              :disabled="selectedItem.locked"
            >
              出售 {{ getSellPrice(selectedItem) }}💰
            </button>
            <button @click="selectedItem = null" class="close-btn">关闭</button>
          </div>
        </template>
      </div>
    </div>

    <!-- 强化面板弹窗 -->
    <div v-if="enhancingItem" class="item-detail-modal" @click.self="enhancingItem = null">
      <div class="enhance-panel" :style="{ borderColor: enhancingItem.qualityColor }">
        <div class="enhance-header" :style="{ color: enhancingItem.qualityColor }">
          {{ enhancingItem.icon }} {{ enhancingItem.name }}
          <span v-if="enhancingItem.enhanceLevel > 0" class="enhance-level">+{{ enhancingItem.enhanceLevel }}</span>
        </div>

        <div class="enhance-info">
          <div class="enhance-quality">{{ enhancingItem.qualityName }} · Lv.{{ enhancingItem.level }}</div>

          <!-- 强化属性预览 -->
          <div class="enhance-stats">
            <div v-for="(value, stat) in enhancingItem.stats" :key="stat" class="enhance-stat-row">
              <span class="stat-name">{{ statNames[stat] || stat }}</span>
              <span class="stat-base">{{ formatStat(stat, value) }}</span>
              <span v-if="enhancingItem.enhanceLevel > 0" class="stat-enhanced">
                ({{ formatStat(stat, getEnhancedValue(value, enhancingItem.enhanceLevel)) }})
              </span>
            </div>
          </div>

          <!-- 强化信息 -->
          <div class="enhance-details">
            <div class="enhance-row">
              <span>当前强化等级</span>
              <span class="enhance-current">+{{ enhancingItem.enhanceLevel || 0 }} / 10</span>
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
            <div v-if="(enhancingItem.enhanceLevel || 0) >= 6" class="enhance-warning">
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
          <button v-if="!enhanceFromInventory" @click="handleUnequipFromEnhance" class="unequip-btn">卸下</button>
          <button v-if="enhanceFromInventory" @click="handleEquipFromEnhance" class="equip-btn">装备</button>
          <button @click="enhancingItem = null" class="close-btn">关闭</button>
        </div>
      </div>
    </div>

    <!-- 法宝详情面板 -->
    <div v-if="viewingArtifact" class="item-detail-modal" @click.self="viewingArtifact = null">
      <div class="artifact-detail-panel" :style="{ borderColor: viewingArtifact.qualityColor }">
        <div class="artifact-header" :style="{ color: viewingArtifact.qualityColor }">
          🔮 {{ viewingArtifact.name }}
        </div>

        <div class="artifact-info">
          <div class="artifact-quality">{{ viewingArtifact.qualityName }}</div>
          <div class="artifact-level">
            <span>等级: {{ viewingArtifact.level }} / {{ viewingArtifact.maxLevel }}</span>
            <div class="exp-bar">
              <div class="exp-fill" :style="{ width: getArtifactExpPercent(viewingArtifact) + '%' }"></div>
            </div>
            <span class="exp-text">{{ viewingArtifact.exp || 0 }} / {{ getArtifactExpToNext(viewingArtifact) }}</span>
          </div>
        </div>

        <div class="artifact-stats-section">
          <div class="section-title">基础属性</div>
          <div class="artifact-stats">
            <div v-for="(value, stat) in viewingArtifact.baseStats" :key="stat" class="artifact-stat-row">
              <span class="stat-name">{{ statNames[stat] || stat }}</span>
              <span class="stat-value" :class="getStatClass(stat)">+{{ formatStat(stat, getArtifactStatValue(viewingArtifact, stat, value)) }}</span>
            </div>
          </div>
        </div>

        <div v-if="viewingArtifact.passiveSkills && viewingArtifact.passiveSkills.length > 0" class="artifact-skills-section">
          <div class="section-title">被动技能</div>
          <div v-for="skill in viewingArtifact.passiveSkills" :key="skill.id" class="artifact-skill">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-effect">{{ formatArtifactSkillEffect(skill, viewingArtifact.level) }}</span>
          </div>
        </div>

        <div v-if="viewingArtifact.activeSkills && viewingArtifact.activeSkills.length > 0" class="artifact-skills-section">
          <div class="section-title">主动技能</div>
          <div v-for="skill in viewingArtifact.activeSkills" :key="skill.id" class="artifact-skill active">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-effect">{{ formatArtifactActiveSkill(skill, viewingArtifact.level) }}</span>
          </div>
        </div>

        <div class="artifact-hint">
          💡 法宝通过战斗获得经验升级
        </div>

        <div class="artifact-actions">
          <button @click="handleUnequipArtifact" class="unequip-btn">卸下</button>
          <button @click="viewingArtifact = null" class="close-btn">关闭</button>
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
      <!-- 打造法宝 -->
      <template v-else-if="tooltipItem.type === 'craftedArtifact'">
        <div class="tooltip-quality">{{ tooltipItem.qualityName }} · Lv.{{ tooltipItem.level }}/{{ tooltipItem.maxLevel }}</div>
        <div class="tooltip-stats">
          <div v-for="(value, stat) in tooltipItem.baseStats" :key="stat" class="tooltip-stat">
            <span>{{ statNames[stat] || stat }}</span>
            <span :class="getStatClass(stat)">+{{ formatStat(stat, getArtifactStatValue(tooltipItem, stat, value)) }}</span>
          </div>
        </div>
        <div v-if="tooltipItem.passiveSkills && tooltipItem.passiveSkills.length > 0" class="tooltip-skills">
          <div class="tooltip-skill-title">被动技能</div>
          <div v-for="skill in tooltipItem.passiveSkills" :key="skill.id" class="tooltip-skill">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-value">{{ formatArtifactSkillEffect(skill, tooltipItem.level) }}</span>
          </div>
        </div>
        <div v-if="tooltipItem.activeSkills && tooltipItem.activeSkills.length > 0" class="tooltip-skills">
          <div class="tooltip-skill-title">主动技能</div>
          <div v-for="skill in tooltipItem.activeSkills" :key="skill.id" class="tooltip-skill active-skill">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-effect">{{ formatArtifactActiveSkill(skill, tooltipItem.level) }}</span>
          </div>
        </div>
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
import { equipSlots, skillRarityConfig, getEnhanceSuccessRate, getEnhanceCost, getEnhancedStatValue, getArtifactExpForLevel } from '../../data/gameData'
import { gameState, equipItem, unequipItem, discardItem, useSkillBook, autoSave, enhanceEquipment, enhanceItem, getEnhancedStats, getLootFilter, updateLootFilter, getInventoryLimit } from '../../store/gameStore'

export default {
  name: 'EquipmentPanel',
  data() {
    return {
      equipSlots,
      selectedItem: null,
      enhancingItem: null,
      enhanceSlotType: null,
      enhanceFromInventory: false,
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
        { key: 'set', name: '套装' },
        { key: 'skillBook', name: '技能书' }
      ],
      qualityFilters: [
        { key: 'all', name: '全部', color: '#888' },
        { key: 'white', name: '普通', color: '#ffffff' },
        { key: 'green', name: '优秀', color: '#2ecc71' },
        { key: 'blue', name: '精良', color: '#3498db' },
        { key: 'purple', name: '史诗', color: '#9b59b6' },
        { key: 'orange', name: '传说', color: '#e67e22' }
      ],
      sortOptions: [
        { key: 'default', name: '默认' },
        { key: 'level', name: '等级' },
        { key: 'quality', name: '品质' },
        { key: 'name', name: '名称' }
      ],
      currentQuality: 'all',
      currentSort: 'default',
      sortAsc: false,
      qualityOrder: { white: 1, green: 2, blue: 3, purple: 4, orange: 5 },
      showLootFilterSettings: false,
      qualityOptions: [
        { key: 'white', name: '普通', color: '#ffffff' },
        { key: 'green', name: '优秀', color: '#2ecc71' },
        { key: 'blue', name: '精良', color: '#3498db' },
        { key: 'purple', name: '史诗', color: '#9b59b6' },
        { key: 'orange', name: '传说', color: '#e67e22' }
      ],
      viewingArtifact: null,
      viewingArtifactSlot: null,
      statNames: {
        hp: '生命值',
        attack: '攻击力',
        defense: '防御力',
        critRate: '暴击率',
        critResist: '抗暴击',
        critDamage: '暴击伤害',
        dodge: '闪避率',
        hit: '命中率',
        penetration: '穿透',
        skillDamage: '技能伤害',
        dropRate: '掉落率',
        damageReduction: '伤害减免',
        thorns: '反伤',
        lifesteal: '吸血',
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
      let result = [...this.inventory]

      // 按类型筛选
      if (this.currentFilter !== 'all') {
        if (this.currentFilter === 'skillBook') {
          result = result.filter(item => item.type === 'skillBook')
        } else if (this.currentFilter === 'set') {
          result = result.filter(item => item.setId)
        } else {
          result = result.filter(item => item.slotType === this.currentFilter)
        }
      }

      // 按品质筛选
      if (this.currentQuality !== 'all') {
        result = result.filter(item => {
          if (item.type === 'skillBook') {
            // 技能书使用rarity映射到品质
            const rarityToQuality = {
              common: 'white',
              uncommon: 'green',
              rare: 'blue',
              epic: 'purple',
              legendary: 'orange'
            }
            return rarityToQuality[item.rarity] === this.currentQuality
          }
          return item.quality === this.currentQuality
        })
      }

      // 排序
      if (this.currentSort !== 'default') {
        result.sort((a, b) => {
          let compareValue = 0

          if (this.currentSort === 'level') {
            const levelA = a.level || 0
            const levelB = b.level || 0
            compareValue = levelA - levelB
          } else if (this.currentSort === 'quality') {
            const qualityA = this.getItemQualityOrder(a)
            const qualityB = this.getItemQualityOrder(b)
            compareValue = qualityA - qualityB
          } else if (this.currentSort === 'name') {
            compareValue = a.name.localeCompare(b.name, 'zh-CN')
          }

          return this.sortAsc ? compareValue : -compareValue
        })
      }

      return result
    },
    playerLevel() {
      return gameState.player.level
    },
    playerGold() {
      return gameState.player.gold
    },
    canAffordEnhance() {
      if (!this.enhancingItem) return false
      return this.playerGold >= this.getEnhanceCostValue()
    },
    canEnhance() {
      if (!this.enhancingItem) return false
      if ((this.enhancingItem.enhanceLevel || 0) >= 10) return false
      return this.canAffordEnhance
    },
    lootFilter() {
      return gameState.lootFilter
    },
    inventoryLimit() {
      return getInventoryLimit()
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
      if (filterKey === 'set') {
        return this.inventory.filter(item => item.setId).length
      }
      return this.inventory.filter(item => item.slotType === filterKey).length
    },
    toggleSort(sortKey) {
      if (this.currentSort === sortKey) {
        // 同一个排序选项，切换升降序
        this.sortAsc = !this.sortAsc
      } else {
        // 新的排序选项，默认降序
        this.currentSort = sortKey
        this.sortAsc = false
      }
    },
    getItemQualityOrder(item) {
      if (item.type === 'skillBook') {
        const rarityToQuality = {
          common: 'white',
          uncommon: 'green',
          rare: 'blue',
          epic: 'purple',
          legendary: 'orange'
        }
        return this.qualityOrder[rarityToQuality[item.rarity]] || 0
      }
      return this.qualityOrder[item.quality] || 0
    },
    canEquip(item) {
      if (item.type === 'skillBook') return true
      if (!item.requiredLevel) return true
      return this.playerLevel >= item.requiredLevel
    },
    // 获取已装备的同部位装备
    getEquippedForSlot(slotType) {
      if (!slotType) return null
      return this.equipment[slotType] || null
    },
    // 获取对比需要显示的所有属性
    getAllCompareStats(newItem) {
      const equipped = this.getEquippedForSlot(newItem.slotType)
      const statsSet = new Set()
      if (newItem.stats) {
        Object.keys(newItem.stats).forEach(s => statsSet.add(s))
      }
      if (equipped && equipped.stats) {
        Object.keys(equipped.stats).forEach(s => statsSet.add(s))
      }
      return Array.from(statsSet)
    },
    // 获取装备的某个属性值（含强化）
    getItemStatValue(item, stat) {
      if (!item || !item.stats || !item.stats[stat]) return 0
      const base = item.stats[stat]
      const enhanced = this.getEnhancedValue(base, item.enhanceLevel || 0)
      return enhanced
    },
    // 获取属性差值显示
    getStatDiff(newItem, stat) {
      const equipped = this.getEquippedForSlot(newItem.slotType)
      const newValue = this.getItemStatValue(newItem, stat)
      const oldValue = equipped ? this.getItemStatValue(equipped, stat) : 0
      const diff = newValue - oldValue
      if (diff > 0) return `+${diff}`
      if (diff < 0) return `${diff}`
      return '0'
    },
    // 获取对比颜色类
    getCompareClass(newItem, stat, isNew) {
      const equipped = this.getEquippedForSlot(newItem.slotType)
      const newValue = this.getItemStatValue(newItem, stat)
      const oldValue = equipped ? this.getItemStatValue(equipped, stat) : 0
      if (newValue > oldValue) return 'better'
      if (newValue < oldValue) return 'worse'
      return 'same'
    },
    handleSlotClick(slotType) {
      if (this.equipment[slotType]) {
        const item = this.equipment[slotType]
        // 打造法宝使用单独的详情面板
        if (item.type === 'craftedArtifact') {
          this.viewingArtifact = item
          this.viewingArtifactSlot = slotType
          return
        }
        // 普通装备打开强化面板
        this.enhancingItem = item
        this.enhanceSlotType = slotType
        this.enhanceFromInventory = false
        this.enhanceResult = null
      }
    },
    openEnhanceForInventory(item) {
      // 从背包打开强化面板
      this.enhancingItem = item
      this.enhanceSlotType = null
      this.enhanceFromInventory = true
      this.enhanceResult = null
      this.selectedItem = null
    },
    handleEquip(item) {
      if (!this.canEquip(item)) return
      equipItem(item)
      this.selectedItem = null
    },
    getSellPrice(item) {
      if (item.type === 'skillBook') {
        const rarityPrice = { common: 10, uncommon: 25, rare: 60, epic: 150, legendary: 300 }
        return rarityPrice[item.rarity] || 10
      }
      // 装备出售价格 = 装备等级 * 品质系数
      const qualityMultiplier = { white: 1, green: 2, blue: 5, purple: 12, orange: 25 }
      const basePrice = (item.level || 1) * (qualityMultiplier[item.quality] || 1)
      // 强化等级额外加成
      const enhanceBonus = (item.enhanceLevel || 0) * 5
      return Math.floor(basePrice + enhanceBonus)
    },
    handleSell(item) {
      if (item.locked) {
        alert('该物品已锁定，无法出售')
        return
      }
      const price = this.getSellPrice(item)
      if (confirm(`确定出售【${item.name}】获得 ${price} 灵石吗？`)) {
        gameState.player.gold += price
        discardItem(item)
        this.selectedItem = null
      }
    },
    handleSellAll() {
      const unlocked = this.filteredInventory.filter(item => !item.locked)
      if (unlocked.length === 0) {
        alert('没有可出售的物品（所有物品已锁定）')
        return
      }
      // 计算总价
      let totalPrice = 0
      for (const item of unlocked) {
        totalPrice += this.getSellPrice(item)
      }
      const filterName = this.filters.find(f => f.key === this.currentFilter)?.name || '当前分类'
      if (confirm(`确定出售【${filterName}】下所有未锁定的 ${unlocked.length} 件物品吗？\n预计获得 ${totalPrice} 灵石`)) {
        gameState.player.gold += totalPrice
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
    getItemBgColor(item) {
      // 根据品质返回淡色背景
      const bgColors = {
        white: 'rgba(255, 255, 255, 0.05)',
        green: 'rgba(46, 204, 113, 0.15)',
        blue: 'rgba(52, 152, 219, 0.15)',
        purple: 'rgba(155, 89, 182, 0.15)',
        orange: 'rgba(230, 126, 34, 0.15)'
      }
      if (item.type === 'skillBook') {
        const rarityToQuality = {
          common: 'white',
          uncommon: 'green',
          rare: 'blue',
          epic: 'purple',
          legendary: 'orange'
        }
        return bgColors[rarityToQuality[item.rarity]] || bgColors.white
      }
      return bgColors[item.quality] || bgColors.white
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
      if (!this.enhancingItem) return 0
      return getEnhanceCost(this.enhancingItem.level, this.enhancingItem.enhanceLevel || 0)
    },
    getEnhanceRate() {
      if (!this.enhancingItem) return 0
      return getEnhanceSuccessRate(this.enhancingItem.enhanceLevel || 0)
    },
    getSuccessRateClass() {
      const rate = this.getEnhanceRate()
      if (rate >= 80) return 'rate-high'
      if (rate >= 50) return 'rate-mid'
      return 'rate-low'
    },
    getEnhanceButtonText() {
      if (!this.enhancingItem) return '强化'
      if ((this.enhancingItem.enhanceLevel || 0) >= 10) return '已满级'
      if (!this.canAffordEnhance) return '灵石不足'
      return `强化 (${this.getEnhanceCostValue()} 灵石)`
    },
    handleEnhance() {
      if (!this.canEnhance) return
      let result
      if (this.enhanceFromInventory) {
        // 从背包强化
        result = enhanceItem(this.enhancingItem)
      } else {
        // 从装备栏强化
        result = enhanceEquipment(this.enhanceSlotType)
        // 刷新enhancingItem以更新显示
        this.enhancingItem = this.equipment[this.enhanceSlotType]
      }
      this.enhanceResult = result
      // 3秒后清除结果提示
      setTimeout(() => {
        this.enhanceResult = null
      }, 3000)
    },
    handleUnequipFromEnhance() {
      if (this.enhanceSlotType) {
        unequipItem(this.enhanceSlotType)
        this.enhancingItem = null
        this.enhanceSlotType = null
      }
    },
    handleEquipFromEnhance() {
      if (this.enhancingItem && this.enhanceFromInventory) {
        equipItem(this.enhancingItem)
        this.enhancingItem = null
        this.enhanceFromInventory = false
      }
    },
    // 拾取筛选相关方法
    saveLootFilter() {
      updateLootFilter(this.lootFilter)
    },
    setMinQuality(quality) {
      this.lootFilter.minQuality = quality
      this.saveLootFilter()
    },
    getLootFilterHint() {
      const qualityNames = { white: '普通', green: '优秀', blue: '精良', purple: '史诗', orange: '传说' }
      const minName = qualityNames[this.lootFilter.minQuality]
      let hint = `当前设置：只拾取【${minName}】及以上品质的装备`
      if (this.lootFilter.autoSellFiltered) {
        hint += '，低品质装备自动卖出'
      } else {
        hint += '，低品质装备直接丢弃'
      }
      if (!this.lootFilter.pickupSkillBooks) {
        hint += '，不拾取技能书'
      }
      return hint
    },
    // 法宝属性值计算（含等级成长）
    getArtifactStatValue(artifact, stat, baseValue) {
      const levelBonus = 1 + (artifact.level - 1) * 0.05
      return Math.floor(baseValue * levelBonus)
    },
    // 获取法宝升级所需经验
    getArtifactExpToNext(artifact) {
      return getArtifactExpForLevel(artifact.level || 1)
    },
    // 法宝经验百分比
    getArtifactExpPercent(artifact) {
      const exp = artifact.exp || 0
      const expToNext = this.getArtifactExpToNext(artifact)
      return Math.min(100, (exp / expToNext) * 100)
    },
    // 卸下法宝
    handleUnequipArtifact() {
      if (this.viewingArtifactSlot) {
        unequipItem(this.viewingArtifactSlot)
        this.viewingArtifact = null
        this.viewingArtifactSlot = null
      }
    },
    // 格式化法宝被动技能效果
    formatArtifactSkillEffect(skill, artifactLevel) {
      const baseValue = skill.baseValue || skill.value || 0
      const levelBonus = (artifactLevel - 1) * (skill.growthPerLevel || 0)
      const totalValue = baseValue + levelBonus
      const effectFormats = {
        hpPercent: { name: '生命', suffix: '%' },
        attackPercent: { name: '攻击', suffix: '%' },
        defensePercent: { name: '防御', suffix: '%' },
        critRate: { name: '暴击率', suffix: '%' },
        critDamage: { name: '暴击伤害', suffix: '%' },
        lifesteal: { name: '吸血', suffix: '%' },
        damageReduction: { name: '减伤', suffix: '%' },
        penetration: { name: '穿透', suffix: '%' },
        healBonus: { name: '治疗加成', suffix: '%' },
        healReceivedBonus: { name: '受疗加成', suffix: '%' },
        debuffDamageBonus: { name: '负面伤害加成', suffix: '%' },
        killHealPercent: { name: '击杀回血', suffix: '%' },
        thorns: { name: '反伤', suffix: '%' },
        skillDamageBonus: { name: '技能伤害', suffix: '%' },
        revive: { name: '复活回血', suffix: '%' },
        allPercent: { name: '全属性', suffix: '%' },
        lowHpReduction: { name: '低血减伤', suffix: '%' },
        dodge: { name: '闪避', suffix: '%' }
      }
      const format = effectFormats[skill.effect]
      if (format) {
        return `${format.name} +${totalValue.toFixed(1)}${format.suffix}`
      }
      return `${skill.description || skill.effect} +${totalValue.toFixed(1)}`
    },
    // 格式化法宝主动技能效果
    formatArtifactActiveSkill(skill, artifactLevel) {
      const baseValue = skill.baseValue || skill.value || 0
      const levelBonus = (artifactLevel - 1) * (skill.growthPerLevel || 0)
      const totalValue = baseValue + levelBonus

      const effectDescriptions = {
        shield: `护盾 ${Math.floor(totalValue)}`,
        heal: `回复 ${totalValue.toFixed(1)}% 生命`,
        damageStun: `${Math.floor(totalValue)} 伤害 + 眩晕${skill.stunDuration || 1}回合`,
        aoeDamage: `群体 ${Math.floor(totalValue)} 伤害`,
        attackDebuff: `降低敌人 ${totalValue.toFixed(1)}% 攻击 ${skill.duration || 3}回合`,
        skipTurn: `敌人跳过 ${skill.duration || 1} 回合`,
        attackBuff: `攻击力 +${totalValue.toFixed(1)}% ${skill.duration || 3}回合`
      }

      const desc = effectDescriptions[skill.effect] || skill.description
      const cooldown = skill.cooldown ? `(CD:${skill.cooldown}回合)` : ''
      return `${desc} ${cooldown}`
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

.sell-all-btn {
  padding: 4px 10px;
  background: #b8860b;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.75em;
  cursor: pointer;
}

.sell-all-btn:hover {
  background: #daa520;
}

/* 筛选区域 */
.filter-section {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 10px;
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

/* 分类筛选 */
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.filter-tabs button {
  padding: 3px 8px;
  background: #1a1a2e;
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

/* 品质筛选按钮特殊样式 */
.quality-filters button.active {
  background: rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

/* 排序选项 */
.sort-tabs button {
  display: flex;
  align-items: center;
  gap: 2px;
}

.sort-arrow {
  font-size: 0.9em;
  color: #87ceeb;
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
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 6px;
  max-height: 520px;
  padding: 4px;
}

.inventory-item {
  position: relative;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a4a;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.inventory-item:hover,
.inventory-item.selected {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.inventory-item.selected {
  border-width: 3px;
}

.inventory-item.locked {
  border-style: dashed;
}

.inventory-item.cannot-equip {
  opacity: 0.6;
}

.item-icon-large {
  font-size: 1.8em;
}

.item-enhance {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #f39c12;
  color: #000;
  font-size: 0.65em;
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 3px;
}

.item-level-badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.6em;
  padding: 1px 4px;
  border-radius: 3px;
}

.lock-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.7em;
}

.empty-inventory {
  grid-column: 1 / -1;
  color: #555;
  text-align: center;
  padding: 40px 20px;
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

/* 装备对比区域 */
.compare-section {
  background: linear-gradient(135deg, #1a2a3a 0%, #2a3a4a 100%);
  border: 1px solid #4a6a8a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.compare-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #4a6a8a;
}

.compare-title {
  color: #87ceeb;
  font-size: 0.9em;
  font-weight: bold;
}

.compare-content {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.compare-column {
  flex: 1;
  text-align: center;
}

.compare-label {
  color: #888;
  font-size: 0.75em;
  margin-bottom: 4px;
}

.compare-item-name {
  font-size: 0.85em;
  font-weight: bold;
}

.compare-stats {
  background: #1a1a2e;
  border-radius: 6px;
  padding: 8px;
}

.compare-stat-row {
  display: flex;
  align-items: center;
  padding: 3px 0;
  font-size: 0.8em;
  border-bottom: 1px solid #2a2a4a;
}

.compare-stat-row:last-child {
  border-bottom: none;
}

.compare-stat-name {
  flex: 1;
  color: #888;
}

.compare-stat-new {
  width: 50px;
  text-align: right;
  font-weight: bold;
}

.compare-arrow {
  color: #666;
  padding: 0 8px;
}

.compare-stat-old {
  width: 50px;
  text-align: left;
  color: #888;
}

.compare-diff {
  width: 55px;
  text-align: right;
  font-size: 0.9em;
}

.compare-stat-new.better,
.compare-diff.better {
  color: #2ecc71;
}

.compare-stat-new.worse,
.compare-diff.worse {
  color: #e74c3c;
}

.compare-stat-new.same,
.compare-diff.same {
  color: #888;
}

.stats-title {
  color: #87ceeb;
  font-size: 0.85em;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #4a4a6a;
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

.sell-btn {
  background: #b8860b;
  color: white;
}

.sell-btn:hover:not(:disabled) {
  background: #daa520;
}

.sell-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.detail-actions .enhance-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.detail-actions .enhance-btn:hover {
  background: linear-gradient(135deg, #a569bd, #9b59b6);
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

/* 法宝技能提示样式 */
.tooltip-skills {
  background: #2a2a4a;
  border-radius: 6px;
  padding: 8px;
  margin-top: 6px;
}

.tooltip-skill-title {
  color: #ffd700;
  font-size: 0.75em;
  margin-bottom: 4px;
  font-weight: bold;
}

.tooltip-skill {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  padding: 2px 0;
}

.tooltip-skill .skill-name {
  color: #9b59b6;
}

.tooltip-skill .skill-value {
  color: #2ecc71;
}

.tooltip-skill .skill-desc {
  color: #aaa;
  font-size: 0.9em;
}

.tooltip-skill.active-skill {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.tooltip-skill.active-skill .skill-effect {
  color: #f39c12;
  font-size: 0.85em;
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

/* 头部操作按钮 */
.header-actions {
  display: flex;
  gap: 8px;
}

.settings-btn {
  padding: 4px 10px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  color: #888;
  font-size: 0.75em;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: #3a3a5a;
  color: #aaa;
}

.settings-btn.active {
  background: #27ae60;
  border-color: #2ecc71;
  color: white;
}

/* 拾取筛选面板 */
.loot-filter-panel {
  background: #1a1a2e;
  border: 1px solid #4a4a6a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.loot-filter-row {
  margin-bottom: 10px;
}

.loot-filter-row:last-child {
  margin-bottom: 0;
}

.loot-filter-options {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #3a3a5a;
}

/* 开关样式 */
.filter-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #aaa;
  font-size: 0.85em;
}

.filter-switch input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 40px;
  height: 20px;
  background: #4a4a6a;
  border-radius: 10px;
  transition: all 0.3s;
}

.switch-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: #888;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s;
}

.filter-switch input:checked + .switch-slider {
  background: #27ae60;
}

.filter-switch input:checked + .switch-slider::after {
  left: 22px;
  background: white;
}

.filter-option-label {
  color: #888;
  font-size: 0.85em;
  display: block;
  margin-bottom: 6px;
}

.quality-select {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quality-select button {
  padding: 4px 10px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  font-size: 0.75em;
  cursor: pointer;
  transition: all 0.2s;
}

.quality-select button:hover {
  background: #3a3a5a;
}

.quality-select button.active {
  background: rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

.loot-filter-hint {
  color: #888;
  font-size: 0.75em;
  padding: 8px;
  background: #2a2a4a;
  border-radius: 4px;
  margin-top: 10px;
  line-height: 1.4;
}

/* 法宝详情面板 */
.artifact-detail-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  max-width: 400px;
}

.artifact-header {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.artifact-info {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.artifact-quality {
  text-align: center;
  color: #aaa;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.artifact-level {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85em;
}

.artifact-level > span:first-child {
  color: #ffd700;
  font-weight: bold;
}

.exp-bar {
  width: 100%;
  height: 8px;
  background: #1a1a2e;
  border-radius: 4px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #9b59b6, #8e44ad);
  transition: width 0.3s;
}

.exp-text {
  color: #888;
  font-size: 0.8em;
  text-align: right;
}

.artifact-stats-section,
.artifact-skills-section {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.section-title {
  color: #ffd700;
  font-size: 0.85em;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #3a3a5a;
}

.artifact-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.artifact-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
}

.artifact-stat-row .stat-name {
  color: #aaa;
}

.artifact-stat-row .stat-value {
  font-weight: bold;
  color: #98fb98;
}

.artifact-skill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 0.85em;
}

.artifact-skill .skill-name {
  color: #9b59b6;
  font-weight: bold;
}

.artifact-skill .skill-effect {
  color: #2ecc71;
}

.artifact-skill.active {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.artifact-skill .skill-desc {
  color: #aaa;
  font-size: 0.9em;
}

.artifact-hint {
  color: #888;
  font-size: 0.8em;
  text-align: center;
  padding: 10px;
  background: rgba(155, 89, 182, 0.1);
  border-radius: 6px;
  margin-bottom: 12px;
}

.artifact-actions {
  display: flex;
  gap: 10px;
}

.artifact-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .equipment-panel {
    padding: 10px;
  }

  .panel-header h3 {
    font-size: 1em;
  }

  .equip-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .equip-slot {
    padding: 8px;
  }

  .slot-name {
    font-size: 0.7em;
  }

  .item-name {
    font-size: 0.65em;
  }

  .filter-tabs {
    flex-wrap: wrap;
    gap: 4px;
  }

  .filter-tabs button {
    padding: 4px 8px;
    font-size: 0.7em;
  }

  .inventory-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }

  .inventory-item {
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .equipment-panel {
    padding: 8px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .header-actions button {
    font-size: 0.7em;
    padding: 4px 8px;
  }

  .equip-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  .equip-slot {
    padding: 6px;
  }

  .slot-name {
    font-size: 0.65em;
  }

  .item-name {
    font-size: 0.6em;
  }

  .item-level {
    font-size: 0.6em;
  }

  .filter-tabs {
    gap: 3px;
  }

  .filter-tabs button {
    padding: 3px 6px;
    font-size: 0.65em;
  }

  .inventory-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }

  .inventory-item {
    padding: 4px;
    font-size: 0.7em;
  }

  /* 弹窗适配 */
  .item-detail-modal .item-detail,
  .item-detail-modal .enhance-panel,
  .artifact-detail-panel {
    width: 95vw;
    max-width: none;
    min-width: 0;
    padding: 15px;
  }

  .detail-header,
  .artifact-header {
    font-size: 1.1em;
  }

  .detail-stats,
  .artifact-stats-section {
    padding: 10px;
  }

  .stat-row {
    font-size: 0.8em;
  }

  .detail-actions,
  .artifact-actions {
    flex-direction: column;
    gap: 8px;
  }

  .detail-actions button,
  .artifact-actions button {
    padding: 10px;
    font-size: 0.85em;
  }
}
</style>
