<template>
  <div class="talent-panel">
    <div class="panel-header">
      <h3>天赋树</h3>
      <div class="talent-points">
        <span class="points-label">可用点数:</span>
        <span class="points-value">{{ availablePoints }}</span>
        <span class="points-total">/ {{ totalPoints }}</span>
      </div>
    </div>

    <div class="talent-hint">
      每25级获得1点天赋点，点击天赋图标加点
    </div>

    <!-- 天赋分支 -->
    <div class="talent-branches">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="talent-branch"
        :style="{ '--branch-color': branch.color }"
      >
        <div class="branch-header">
          <span class="branch-icon">{{ branch.icon }}</span>
          <span class="branch-name">{{ branch.name }}</span>
          <span class="branch-points">{{ getBranchUsedPoints(branch.id) }}/30</span>
        </div>
        <div class="branch-desc">{{ branch.description }}</div>

        <div class="talents-list">
          <div
            v-for="talent in branch.talents"
            :key="talent.id"
            class="talent-item"
            :class="{
              'is-ultimate': talent.isUltimate,
              'can-add': canAdd(branch.id, talent.id),
              'maxed': getTalentPoints(branch.id, talent.id) >= talent.maxPoints,
              'locked': talent.isUltimate && getBranchUsedPoints(branch.id) < talent.requirePoints
            }"
            @click="addPoint(branch.id, talent.id)"
          >
            <div class="talent-icon">{{ talent.icon }}</div>
            <div class="talent-info">
              <div class="talent-name">
                {{ talent.name }}
                <span v-if="talent.isUltimate" class="ultimate-badge">终极</span>
              </div>
              <div class="talent-points-display">
                {{ getTalentPoints(branch.id, talent.id) }}/{{ talent.maxPoints }}
              </div>
            </div>
            <div class="talent-effect">
              {{ talent.effectDesc(getTalentPoints(branch.id, talent.id)) }}
            </div>
            <div v-if="talent.isUltimate && getBranchUsedPoints(branch.id) < talent.requirePoints" class="talent-lock">
              需投入{{ talent.requirePoints }}点
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="talent-actions">
      <button class="reset-btn" @click="handleReset" :disabled="totalUsedPoints === 0">
        重置天赋 (免费)
      </button>
    </div>

    <!-- 当前效果总览 -->
    <div class="talent-summary" v-if="totalUsedPoints > 0">
      <div class="summary-title">当前天赋效果</div>
      <div class="summary-effects">
        <span v-if="effects.attackPercent" class="effect-item">攻击+{{ effects.attackPercent }}%</span>
        <span v-if="effects.hpPercent" class="effect-item">生命+{{ effects.hpPercent }}%</span>
        <span v-if="effects.defensePercent" class="effect-item">防御+{{ effects.defensePercent }}%</span>
        <span v-if="effects.critRate" class="effect-item">暴击+{{ effects.critRate }}%</span>
        <span v-if="effects.critDamage" class="effect-item">爆伤+{{ effects.critDamage }}%</span>
        <span v-if="effects.penetration" class="effect-item">穿透+{{ effects.penetration }}%</span>
        <span v-if="effects.skillDamage" class="effect-item">技能伤害+{{ effects.skillDamage }}%</span>
        <span v-if="effects.blockRate" class="effect-item">格挡+{{ effects.blockRate }}%</span>
        <span v-if="effects.damageReduction" class="effect-item">减伤+{{ effects.damageReduction }}%</span>
        <span v-if="effects.hpRegen" class="effect-item">回复+{{ effects.hpRegen }}%</span>
        <span v-if="effects.lifesteal" class="effect-item">吸血+{{ effects.lifesteal }}%</span>
        <span v-if="effects.dodge" class="effect-item">闪避+{{ effects.dodge }}%</span>
        <span v-if="effects.thorns" class="effect-item">反伤+{{ effects.thorns }}%</span>
        <span v-if="effects.critResist" class="effect-item">抗暴+{{ effects.critResist }}%</span>
        <span v-if="effects.hit" class="effect-item">命中+{{ effects.hit }}%</span>
        <span v-if="effects.executeDamage" class="effect-item special">斩杀+{{ effects.executeDamage }}%</span>
        <span v-if="effects.reviveChance" class="effect-item special">复活{{ effects.reviveChance }}%</span>
        <span v-if="effects.shadowStrikeDamage" class="effect-item special">暗影+{{ effects.shadowStrikeDamage }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  gameState,
  getAvailableTalentPoints,
  getTotalTalentPoints,
  allocateTalentPoint,
  resetTalents,
  getTalentAllocation,
  talentTree,
  addLog
} from '../../store/gameStore'
import { getTalentEffects, getBranchPoints, getTotalUsedPoints } from '../../data/gameData'

export default {
  name: 'TalentPanel',
  data() {
    return {
      gameState
    }
  },
  computed: {
    branches() {
      return Object.values(talentTree)
    },
    availablePoints() {
      return getAvailableTalentPoints()
    },
    totalPoints() {
      return getTotalTalentPoints()
    },
    totalUsedPoints() {
      return getTotalUsedPoints(gameState.player.talents)
    },
    allocation() {
      return getTalentAllocation()
    },
    effects() {
      return getTalentEffects(gameState.player.talents)
    }
  },
  methods: {
    getTalentPoints(branchId, talentId) {
      return this.allocation[branchId]?.[talentId] || 0
    },
    getBranchUsedPoints(branchId) {
      return getBranchPoints(this.allocation, branchId)
    },
    canAdd(branchId, talentId) {
      const branch = talentTree[branchId]
      const talent = branch.talents.find(t => t.id === talentId)
      if (!talent) return false

      const currentPoints = this.getTalentPoints(branchId, talentId)
      if (currentPoints >= talent.maxPoints) return false
      if (this.availablePoints <= 0) return false

      if (talent.isUltimate) {
        const branchPoints = this.getBranchUsedPoints(branchId)
        if (branchPoints < talent.requirePoints) return false
      }

      return true
    },
    addPoint(branchId, talentId) {
      if (!this.canAdd(branchId, talentId)) return

      const result = allocateTalentPoint(branchId, talentId)
      if (result.success) {
        addLog(result.message, 'success')
      }
    },
    handleReset() {
      if (this.totalUsedPoints === 0) return

      if (confirm('确定要重置所有天赋吗？')) {
        resetTalents()
      }
    }
  }
}
</script>

<style scoped>
.talent-panel {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.panel-header h3 {
  margin: 0;
  color: #f39c12;
}

.talent-points {
  font-size: 14px;
}

.points-label {
  color: #888;
}

.points-value {
  color: #2ecc71;
  font-weight: bold;
  font-size: 18px;
  margin: 0 5px;
}

.points-total {
  color: #666;
}

.talent-hint {
  font-size: 12px;
  color: #666;
  margin-bottom: 15px;
  text-align: center;
}

.talent-branches {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.talent-branch {
  flex: 1;
  min-width: 0;
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.9));
  border: 1px solid var(--branch-color, #444);
  border-radius: 8px;
  padding: 10px;
}

.branch-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.branch-icon {
  font-size: 18px;
}

.branch-name {
  font-weight: bold;
  color: var(--branch-color, #fff);
  flex: 1;
  font-size: 14px;
}

.branch-points {
  font-size: 11px;
  color: #888;
}

.branch-desc {
  font-size: 10px;
  color: #666;
  margin-bottom: 8px;
}

.talents-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.talent-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid #333;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.talent-item:hover {
  background: rgba(60, 60, 60, 0.8);
}

.talent-item.can-add {
  border-color: var(--branch-color, #2ecc71);
  box-shadow: 0 0 5px rgba(46, 204, 113, 0.3);
}

.talent-item.can-add:hover {
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
}

.talent-item.maxed {
  border-color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

.talent-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.talent-item.is-ultimate {
  border-width: 2px;
  background: linear-gradient(135deg, rgba(50, 40, 30, 0.9), rgba(30, 25, 20, 0.9));
}

.talent-item.is-ultimate.maxed {
  background: linear-gradient(135deg, rgba(80, 60, 20, 0.9), rgba(50, 40, 15, 0.9));
}

.talent-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.talent-info {
  flex: 1;
  min-width: 0;
}

.talent-name {
  font-weight: bold;
  color: #ddd;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ultimate-badge {
  font-size: 9px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: #000;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: bold;
}

.talent-points-display {
  font-size: 10px;
  color: #888;
}

.talent-effect {
  font-size: 10px;
  color: #2ecc71;
  text-align: right;
  min-width: 60px;
  flex-shrink: 0;
}

.talent-item.locked .talent-effect {
  color: #666;
}

.talent-lock {
  width: 100%;
  font-size: 10px;
  color: #e74c3c;
  text-align: center;
  margin-top: 2px;
}

.talent-actions {
  margin-top: 15px;
  text-align: center;
}

.reset-btn {
  background: linear-gradient(135deg, #c0392b, #96281b);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.reset-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.reset-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.talent-summary {
  margin-top: 15px;
  padding: 10px;
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #333;
  border-radius: 6px;
}

.summary-title {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.summary-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.effect-item {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border-radius: 3px;
}

.effect-item.special {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}
</style>
