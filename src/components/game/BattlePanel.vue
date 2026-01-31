<template>
  <div class="battle-panel">
    <div class="panel-header">
      <h3>战斗</h3>
      <div class="kill-count">击杀: {{ killCount }}</div>
    </div>

    <!-- 地图选择 -->
    <div class="map-select">
      <div class="map-select-row">
        <select v-model="selectedMapId" :disabled="isAutoBattle" @change="onMapChange">
          <option v-for="map in maps" :key="map.id" :value="map.id">
            {{ map.name }} (Lv.{{ map.requiredLevel }}+)
            {{ player.level < map.requiredLevel ? '🔒' : '' }}
          </option>
          <option value="tower" :disabled="!canEnterTower">
            {{ towerConfig.name }} (Lv.{{ towerConfig.requiredLevel }}+)
            {{ !canEnterTower ? '🔒' : '' }}
          </option>
        </select>
        <button class="drop-table-btn" @click="showDropTable = true">掉落表</button>
      </div>
      <!-- 锁妖塔层数选择 -->
      <div class="tower-floor-select" v-if="selectedMapId === 'tower'">
        <span class="floor-label">起始层数:</span>
        <select v-model.number="towerStartFloor" :disabled="isAutoBattle">
          <option v-for="floor in availableFloors" :key="floor" :value="floor">
            第 {{ floor }} 层
          </option>
        </select>
        <span class="highest-floor">最高: {{ towerHighestFloor }}层</span>
      </div>
      <!-- 当前塔层显示 -->
      <div class="current-tower-floor" v-if="isTowerMode && isInBattle">
        当前层数: <span class="floor-number">{{ towerFloor }}</span>
      </div>
      <div class="map-desc" v-if="selectedMap">
        {{ selectedMap.description }}
        <span class="level-range" v-if="selectedMapId !== 'tower'">怪物等级: {{ selectedMap.levelRange[0] }}-{{ selectedMap.levelRange[1] }}</span>
        <span class="level-range" v-else>怪物等级: 随层数增加</span>
      </div>
    </div>

    <!-- 战斗控制 -->
    <div class="battle-control">
      <button
        v-if="!isAutoBattle"
        @click="handleStartBattle"
        class="battle-btn start"
        :disabled="player.level < selectedMap.requiredLevel"
      >
        开始挂机
      </button>
      <button
        v-else
        @click="handleStopBattle"
        class="battle-btn stop"
      >
        停止挂机
      </button>
    </div>

    <!-- 战斗状态（固定高度） -->
    <div class="battle-status">
      <!-- 战斗中显示血量 -->
      <div class="battle-layout" v-if="isInBattle && monsters.length > 0">
        <!-- 左侧：怪物列表 -->
        <div class="battle-left">
          <div class="side-label">敌方</div>
          <div class="monsters-container">
            <div
              v-for="(monster, index) in monsters"
              :key="index"
              class="combatant monster-side"
              :class="{ dead: monster.currentHp <= 0 }"
              @mouseenter="showMonsterTooltip($event, monster)"
              @mouseleave="hideMonsterTooltip"
            >
              <div class="combatant-name">
                <span class="monster-index">{{ index + 1 }}.</span>
                Lv.{{ monster.level }} {{ monster.name }}
                <span v-if="monster.debuffs && monster.debuffs.vulnerable" class="debuff-icon" title="易伤">💔</span>
              </div>
              <div class="monster-debuffs" v-if="monster.debuffs && Object.keys(monster.debuffs).length > 0">
                <span v-if="monster.debuffs.vulnerable" class="debuff-tag">易伤{{monster.debuffs.vulnerable.duration}}回合</span>
              </div>
              <div class="hp-bar-wrap">
                <div class="hp-bar monster" :style="{ width: getMonsterHpPercent(monster) + '%' }"></div>
              </div>
              <div class="hp-text">{{ monster.currentHp }} / {{ monster.hp }}</div>
            </div>
          </div>
        </div>

        <!-- 中间VS -->
        <div class="vs">VS</div>

        <!-- 右侧：玩家和宠物 -->
        <div class="battle-right">
          <div class="side-label">我方</div>
          <div class="player-container">
            <div class="combatant player-side">
              <div class="combatant-name">{{ player.name }}</div>
              <div class="hp-bar-wrap">
                <div class="hp-bar player" :style="{ width: playerHpPercent + '%' }"></div>
              </div>
              <div class="hp-text">{{ playerCurrentHp }} / {{ maxHp }}</div>
            </div>

            <!-- 宠物状态 -->
            <div v-if="activePet" class="combatant pet-side" :class="{ dead: activePet.currentHp <= 0 }">
              <div class="combatant-name">
                <span class="pet-icon">{{ activePet.icon }}</span>
                {{ activePet.name }}
              </div>
              <div class="hp-bar-wrap">
                <div class="hp-bar pet" :style="{ width: petHpPercent + '%' }"></div>
              </div>
              <div class="hp-text">{{ activePet.currentHp }} / {{ activePet.baseHp }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 非战斗时显示占位 -->
      <div class="battle-idle" v-else>
        <div class="idle-text">等待战斗...</div>
      </div>
    </div>

    <!-- 战斗日志 -->
    <div class="battle-log" ref="battleLog">
      <div
        v-for="(log, index) in battleLog"
        :key="index"
        class="log-line"
        :class="log.type"
      >
        {{ log.message }}
      </div>
      <div v-if="battleLog.length === 0" class="log-empty">
        选择地图后点击开始挂机...
      </div>
    </div>

    <!-- 怪物属性提示框 -->
    <div
      v-if="tooltipMonster"
      class="monster-tooltip"
      :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
    >
      <div class="tooltip-header">
        <span class="tooltip-name">Lv.{{ tooltipMonster.level }} {{ tooltipMonster.name }}</span>
      </div>
      <div class="tooltip-stats">
        <div class="stat-row">
          <span class="stat-label">生命值</span>
          <span class="stat-value hp">{{ tooltipMonster.currentHp }} / {{ tooltipMonster.hp }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">攻击力</span>
          <span class="stat-value atk">{{ tooltipMonster.attack }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">防御力</span>
          <span class="stat-value def">{{ tooltipMonster.defense }}</span>
        </div>
      </div>
      <div class="tooltip-special">
        <div class="stat-row">
          <span class="stat-label">暴击率</span>
          <span class="stat-value crit">{{ (tooltipMonster.critRate || 0).toFixed(1) }}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">闪避率</span>
          <span class="stat-value dodge">{{ (tooltipMonster.dodge || 0).toFixed(1) }}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">穿透</span>
          <span class="stat-value pen">{{ (tooltipMonster.penetration || 0).toFixed(1) }}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">吸血</span>
          <span class="stat-value lifesteal">{{ (tooltipMonster.lifesteal || 0).toFixed(1) }}%</span>
        </div>
      </div>
      <div class="tooltip-skills" v-if="tooltipMonster.skills && tooltipMonster.skills.length > 0">
        <div class="skills-title">技能</div>
        <div v-for="skill in tooltipMonster.skills" :key="skill.id" class="skill-item">
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-desc">{{ skill.description }}</span>
        </div>
      </div>
      <div class="tooltip-buffs" v-if="hasBuffs(tooltipMonster)">
        <div class="buffs-title">增益效果</div>
        <div v-for="(buff, key) in tooltipMonster.buffs" :key="key" class="buff-item buff">
          {{ getBuffName(key) }}: {{ formatBuffValue(buff) }}
        </div>
      </div>
      <div class="tooltip-debuffs" v-if="hasDebuffs(tooltipMonster)">
        <div class="debuffs-title">减益效果</div>
        <div v-for="(debuff, key) in tooltipMonster.debuffs" :key="key" class="buff-item debuff">
          {{ getDebuffName(key) }}: {{ formatDebuffValue(debuff) }}
        </div>
      </div>
    </div>

    <!-- 掉落表弹窗 -->
    <div v-if="showDropTable" class="modal-overlay" @click.self="showDropTable = false">
      <div class="drop-table-modal">
        <div class="modal-header">
          <h3>掉落表</h3>
          <button class="modal-close" @click="showDropTable = false">×</button>
        </div>
        <div class="drop-table-content">
          <div v-for="map in maps" :key="map.id" class="map-drop-section">
            <div class="map-drop-header" :class="{ locked: player.level < map.requiredLevel }">
              <span class="map-name">{{ map.name }}</span>
              <span class="map-level">Lv.{{ map.requiredLevel }}+</span>
            </div>
            <div class="drop-list">
              <!-- 装备掉落 -->
              <div class="drop-category">装备</div>
              <div class="drop-item equip-drop">
                <span class="drop-name">Lv.{{ map.levelRange[0] }}-{{ map.levelRange[1] }}装备</span>
                <span class="drop-rate">{{ getEquipDropRate(map) }}%</span>
                <span class="drop-type">随机部位</span>
              </div>
              <!-- 技能书掉落 -->
              <div class="drop-category">技能书</div>
              <div v-if="getMapDrops(map.id).length === 0" class="no-drops">
                无技能书掉落
              </div>
              <div
                v-for="drop in getMapDrops(map.id)"
                :key="drop.id"
                class="drop-item"
                :style="{ color: drop.color }"
              >
                <span class="drop-name">{{ drop.name }}</span>
                <span class="drop-rate">{{ (drop.dropRate * 100).toFixed(1) }}%</span>
                <span class="drop-type">{{ drop.type === 'passive' ? '被动' : '主动' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { maps, skills, skillRarityConfig, towerConfig } from '../../data/gameData'
import {
  gameState,
  getPlayerStats,
  startAutoBattle,
  stopAutoBattle,
  getActivePet
} from '../../store/gameStore'

export default {
  name: 'BattlePanel',
  data() {
    return {
      maps,
      showDropTable: false,
      towerConfig,
      tooltipMonster: null,
      tooltipX: 0,
      tooltipY: 0
    }
  },
  computed: {
    player() {
      return gameState.player
    },
    isAutoBattle() {
      return gameState.battle.isAutoBattle
    },
    isInBattle() {
      return gameState.battle.isInBattle
    },
    monsters() {
      return gameState.battle.currentMonsters
    },
    playerCurrentHp() {
      return gameState.battle.playerCurrentHp
    },
    maxHp() {
      return getPlayerStats().maxHp
    },
    battleLog() {
      return gameState.battle.battleLog
    },
    killCount() {
      return gameState.battle.killCount
    },
    selectedMapId: {
      get() {
        return gameState.battle.selectedMapId
      },
      set(val) {
        gameState.battle.selectedMapId = val
        // 切换到非锁妖塔地图时，关闭塔模式
        if (val !== 'tower') {
          gameState.battle.isTowerMode = false
        }
      }
    },
    selectedMap() {
      if (this.selectedMapId === 'tower') {
        return {
          name: towerConfig.name,
          description: towerConfig.description,
          requiredLevel: towerConfig.requiredLevel,
          levelRange: [this.towerFloor + 5, this.towerFloor + 10]
        }
      }
      return maps.find(m => m.id === this.selectedMapId)
    },
    playerHpPercent() {
      return (this.playerCurrentHp / this.maxHp) * 100
    },
    // 宠物相关
    activePet() {
      return getActivePet()
    },
    petHpPercent() {
      if (!this.activePet) return 0
      return (this.activePet.currentHp / this.activePet.baseHp) * 100
    },
    // 锁妖塔相关
    isTowerMode() {
      return gameState.battle.isTowerMode
    },
    towerFloor() {
      return gameState.battle.towerFloor
    },
    towerHighestFloor() {
      return gameState.battle.towerHighestFloor
    },
    towerStartFloor: {
      get() {
        return gameState.battle.towerStartFloor
      },
      set(val) {
        gameState.battle.towerStartFloor = val
        gameState.battle.towerFloor = val
      }
    },
    // 可选择的起始层数列表
    availableFloors() {
      const floors = []
      for (let i = 1; i <= this.towerHighestFloor; i++) {
        floors.push(i)
      }
      return floors
    },
    canEnterTower() {
      return this.player.level >= towerConfig.requiredLevel
    }
  },
  watch: {
    battleLog() {
      this.$nextTick(() => {
        if (this.$refs.battleLog) {
          this.$refs.battleLog.scrollTop = this.$refs.battleLog.scrollHeight
        }
      })
    }
  },
  beforeDestroy() {
    stopAutoBattle()
  },
  methods: {
    handleStartBattle() {
      // 如果选择锁妖塔，设置塔模式
      if (this.selectedMapId === 'tower') {
        gameState.battle.isTowerMode = true
        gameState.battle.towerFloor = this.towerStartFloor
      } else {
        gameState.battle.isTowerMode = false
      }
      startAutoBattle()
    },
    handleStopBattle() {
      stopAutoBattle()
    },
    onMapChange() {
      // 切换到锁妖塔时，确保起始层数合理
      if (this.selectedMapId === 'tower') {
        gameState.battle.towerStartFloor = Math.min(this.towerStartFloor, this.towerHighestFloor)
      }
    },
    getMonsterHpPercent(monster) {
      if (!monster) return 0
      return Math.max(0, (monster.currentHp / monster.hp) * 100)
    },
    getMapDrops(mapId) {
      return skills
        .filter(skill => skill.dropFromMaps && skill.dropFromMaps.includes(mapId) && skill.dropRate > 0)
        .map(skill => ({
          id: skill.id,
          name: skill.name + '技能书',
          type: skill.type,
          dropRate: skill.dropRate,
          color: skillRarityConfig[skill.rarity]?.color || '#ffffff',
          rarity: skill.rarity
        }))
        .sort((a, b) => b.dropRate - a.dropRate)
    },
    getEquipDropRate(map) {
      // 装备掉落率基于怪物等级: Math.min(25, 8 + lvl * 0.3)
      const avgLevel = (map.levelRange[0] + map.levelRange[1]) / 2
      return Math.min(25, 8 + avgLevel * 0.3).toFixed(1)
    },
    showMonsterTooltip(event, monster) {
      this.tooltipMonster = monster
      // 计算tooltip位置
      const rect = event.target.getBoundingClientRect()
      this.tooltipX = rect.right + 10
      this.tooltipY = rect.top
      // 防止超出屏幕右边
      if (this.tooltipX + 280 > window.innerWidth) {
        this.tooltipX = rect.left - 290
      }
      // 防止超出屏幕底部
      if (this.tooltipY + 300 > window.innerHeight) {
        this.tooltipY = window.innerHeight - 310
      }
    },
    hideMonsterTooltip() {
      this.tooltipMonster = null
    },
    hasBuffs(monster) {
      return monster.buffs && Object.keys(monster.buffs).length > 0
    },
    hasDebuffs(monster) {
      return monster.debuffs && Object.keys(monster.debuffs).length > 0
    },
    getBuffName(key) {
      const names = {
        attack: '攻击提升',
        attackBuff: '攻击提升',
        defense: '防御提升',
        defenseBuff: '防御提升',
        critRate: '暴击提升',
        critBuff: '暴击提升',
        shield: '护盾',
        lifesteal: '吸血',
        dodge: '闪避提升',
        hp: '生命提升',
        regen: '生命回复'
      }
      return names[key] || key
    },
    getDebuffName(key) {
      const names = {
        vulnerable: '易伤',
        weakened: '虚弱',
        poisoned: '中毒',
        frozen: '冰冻',
        stunned: '眩晕',
        marked: '标记',
        bleed: '流血',
        burn: '灼烧',
        slow: '减速'
      }
      return names[key] || key
    },
    formatBuffValue(buff) {
      // buff 可能是数值或对象
      if (typeof buff === 'number') {
        return `+${buff}%`
      } else if (typeof buff === 'object' && buff !== null) {
        const value = buff.value !== undefined ? `+${buff.value}%` : ''
        const duration = buff.duration !== undefined ? ` (${buff.duration}回合)` : ''
        return value + duration
      }
      return ''
    },
    formatDebuffValue(debuff) {
      // debuff 可能是数值或对象
      if (typeof debuff === 'number') {
        return `${debuff}%`
      } else if (typeof debuff === 'object' && debuff !== null) {
        const value = debuff.value !== undefined ? `${debuff.value}%` : ''
        const duration = debuff.duration !== undefined ? ` (${debuff.duration}回合)` : ''
        return value + duration
      }
      return ''
    }
  }
}
</script>

<style scoped>
.battle-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #4a4a6a;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-header h3 {
  margin: 0;
  color: #ff6b6b;
  font-size: 1.1em;
}

.kill-count {
  color: #98fb98;
  font-size: 0.9em;
}

.map-select {
  margin-bottom: 12px;
}

.map-select select {
  width: 100%;
  padding: 10px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  color: #fff;
  font-size: 0.95em;
  cursor: pointer;
}

.map-select select:disabled {
  opacity: 0.6;
}

.map-desc {
  margin-top: 6px;
  color: #888;
  font-size: 0.8em;
}

.level-range {
  display: block;
  color: #87ceeb;
  margin-top: 2px;
}

.battle-control {
  margin-bottom: 12px;
}

.battle-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.2s;
}

.battle-btn.start {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.battle-btn.start:hover:not(:disabled) {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.battle-btn.start:disabled {
  background: #555;
  cursor: not-allowed;
}

.battle-btn.stop {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  color: white;
}

.battle-btn.stop:hover {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.battle-status {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  min-height: 220px;
  max-height: 220px;
  overflow: hidden;
}

.battle-idle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 196px;
}

.idle-text {
  color: #555;
  font-size: 0.9em;
}

.battle-layout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.battle-left,
.battle-right {
  flex: 1;
  min-width: 0;
}

.side-label {
  text-align: center;
  font-size: 0.75em;
  color: #888;
  margin-bottom: 6px;
  font-weight: bold;
}

.battle-left .side-label {
  color: #ff6b6b;
}

.battle-right .side-label {
  color: #54a0ff;
}

.monsters-container,
.player-container {
  min-height: 170px;
  max-height: 170px;
  overflow-y: auto;
  overflow-x: hidden;
}

.debuff-icon {
  margin-left: 4px;
  font-size: 0.9em;
}

.monster-debuffs {
  margin-bottom: 2px;
}

.debuff-tag {
  display: inline-block;
  background: #8b0000;
  color: #ffcccc;
  font-size: 0.7em;
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 2px;
}

.combatant {
  text-align: center;
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 6px;
  transition: opacity 0.3s;
}

.monster-side {
  min-height: 52px;
}

.combatant:last-child {
  margin-bottom: 0;
}

.combatant.dead {
  opacity: 0.4;
  background: #1a1a1a;
}

.combatant-name {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.monster-index {
  color: #ffd700;
  margin-right: 4px;
}

.skill-count {
  color: #f39c12;
  font-size: 0.8em;
  margin-left: 4px;
}

.monster-side .combatant-name {
  color: #ff6b6b;
}

.player-side .combatant-name {
  color: #54a0ff;
}

.player-side {
  background: #1a1a3a;
  border: 1px solid #4a4a6a;
  min-height: 52px;
}

.hp-bar-wrap {
  height: 14px;
  background: #1a1a2e;
  border-radius: 7px;
  overflow: hidden;
  margin-bottom: 2px;
}

.hp-bar {
  height: 100%;
  transition: width 0.2s;
}

.hp-bar.monster {
  background: linear-gradient(90deg, #c0392b, #e74c3c);
}

.hp-bar.player {
  background: linear-gradient(90deg, #2980b9, #3498db);
}

.hp-bar.pet {
  background: linear-gradient(90deg, #e67e22, #f39c12);
}

.pet-side {
  background: #2a3a2a;
  border: 1px solid #4a6a4a;
  min-height: 52px;
}

.pet-side .combatant-name {
  color: #f39c12;
}

.pet-side .pet-icon {
  margin-right: 4px;
}

.hp-text {
  font-size: 0.75em;
  color: #888;
  font-variant-numeric: tabular-nums;
  min-width: 80px;
}

.vs {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  font-weight: bold;
  font-size: 1em;
  padding: 0 4px;
  min-width: 30px;
  align-self: center;
}

.battle-log {
  background: #0d0d1a;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  padding: 10px;
  overflow-y: auto;
  font-size: 0.8em;
  height: 450px;
  max-height: 450px;
}

.log-line {
  padding: 2px 0;
  border-bottom: 1px solid #1a1a2e;
}

.log-line.success { color: #2ecc71; }
.log-line.danger { color: #e74c3c; }
.log-line.warning { color: #f39c12; }
.log-line.normal { color: #95a5a6; }
.log-line.critical {
  color: #ff4757;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 71, 87, 0.5);
}
.log-line.heal { color: #7bed9f; }
.log-line.buff { color: #70a1ff; }
.log-line.debuff { color: #ff6b81; }
.log-line.info { color: #a29bfe; }

.log-empty {
  color: #555;
  text-align: center;
  padding: 20px;
}

.map-select-row {
  display: flex;
  gap: 8px;
}

.map-select-row select {
  flex: 1;
}

.drop-table-btn {
  padding: 8px 12px;
  background: #4a4a6a;
  border: 1px solid #6a6a8a;
  border-radius: 6px;
  color: #fff;
  font-size: 0.85em;
  cursor: pointer;
  white-space: nowrap;
}

.drop-table-btn:hover {
  background: #5a5a7a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.drop-table-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4a4a6a;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #4a4a6a;
}

.modal-header h3 {
  margin: 0;
  color: #ffd700;
  font-size: 1.1em;
}

.modal-close {
  width: 28px;
  height: 28px;
  background: #e74c3c;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.1em;
  cursor: pointer;
}

.modal-close:hover {
  background: #c0392b;
}

.drop-table-content {
  padding: 15px;
  overflow-y: auto;
  flex: 1;
}

.map-drop-section {
  margin-bottom: 15px;
  background: #2a2a4a;
  border-radius: 8px;
  overflow: hidden;
}

.map-drop-section:last-child {
  margin-bottom: 0;
}

.map-drop-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #3a3a5a;
  font-weight: bold;
}

.map-drop-header.locked {
  opacity: 0.5;
}

.map-name {
  color: #87ceeb;
}

.map-level {
  color: #f39c12;
  font-size: 0.85em;
}

.drop-list {
  padding: 8px 12px;
}

.no-drops {
  color: #666;
  font-size: 0.85em;
  font-style: italic;
}

.drop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #3a3a5a;
  font-size: 0.9em;
}

.drop-item:last-child {
  border-bottom: none;
}

.drop-name {
  flex: 1;
  font-weight: bold;
}

.drop-rate {
  color: #98fb98;
  margin: 0 10px;
  font-size: 0.85em;
}

.drop-type {
  color: #888;
  font-size: 0.8em;
  background: #1a1a2e;
  padding: 2px 6px;
  border-radius: 4px;
}

.drop-category {
  color: #ffd700;
  font-size: 0.8em;
  font-weight: bold;
  margin: 8px 0 4px 0;
  padding-bottom: 4px;
  border-bottom: 1px dashed #4a4a6a;
}

.drop-category:first-child {
  margin-top: 0;
}

.equip-drop {
  color: #87ceeb !important;
}

/* 锁妖塔相关样式 */
.tower-floor-select {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background: #2a2a4a;
  border-radius: 6px;
}

.tower-floor-select .floor-label {
  color: #ffd700;
  font-size: 0.9em;
}

.tower-floor-select select {
  flex: 1;
  padding: 6px 10px;
  background: #1a1a2e;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9em;
}

.tower-floor-select .highest-floor {
  color: #98fb98;
  font-size: 0.85em;
  white-space: nowrap;
}

.current-tower-floor {
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #4a1a5e 0%, #2a1a4e 100%);
  border: 1px solid #8a4a9a;
  border-radius: 6px;
  color: #e0b0ff;
  font-weight: bold;
  text-align: center;
}

.current-tower-floor .floor-number {
  color: #ffd700;
  font-size: 1.2em;
}

/* 怪物属性提示框样式 */
.monster-tooltip {
  position: fixed;
  z-index: 2000;
  background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4a 100%);
  border: 2px solid #e74c3c;
  border-radius: 10px;
  padding: 12px;
  min-width: 250px;
  max-width: 280px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.tooltip-header {
  border-bottom: 1px solid #4a4a6a;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.tooltip-name {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 1.1em;
}

.tooltip-stats {
  margin-bottom: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 0.9em;
}

.stat-label {
  color: #888;
}

.stat-value {
  font-weight: bold;
}

.stat-value.hp { color: #e74c3c; }
.stat-value.atk { color: #f39c12; }
.stat-value.def { color: #3498db; }
.stat-value.crit { color: #e74c3c; }
.stat-value.dodge { color: #2ecc71; }
.stat-value.pen { color: #9b59b6; }
.stat-value.lifesteal { color: #e91e63; }

.tooltip-special {
  border-top: 1px dashed #4a4a6a;
  padding-top: 8px;
  margin-top: 8px;
}

.tooltip-skills {
  border-top: 1px solid #4a4a6a;
  padding-top: 8px;
  margin-bottom: 8px;
}

.skills-title, .buffs-title, .debuffs-title {
  color: #ffd700;
  font-size: 0.85em;
  font-weight: bold;
  margin-bottom: 5px;
}

.skill-item {
  padding: 4px 0;
  border-bottom: 1px dashed #3a3a5a;
}

.skill-item:last-child {
  border-bottom: none;
}

.skill-name {
  color: #87ceeb;
  font-weight: bold;
  font-size: 0.85em;
  display: block;
}

.skill-desc {
  color: #aaa;
  font-size: 0.75em;
  display: block;
  margin-top: 2px;
}

.tooltip-buffs, .tooltip-debuffs {
  border-top: 1px solid #4a4a6a;
  padding-top: 8px;
  margin-top: 8px;
}

.buff-item {
  font-size: 0.8em;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 3px;
}

.buff-item.buff {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.buff-item.debuff {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.monster-side {
  cursor: pointer;
}

.monster-side:hover {
  background: rgba(255, 107, 107, 0.1);
}
</style>
