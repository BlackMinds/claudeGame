<template>
  <div class="game-container">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主内容区域 -->
    <div class="game-content">
      <!-- 左侧装备面板 -->
      <div class="left-panel">
        <EquipmentPanel />
      </div>

      <!-- 中间战斗面板 -->
      <div class="center-panel">
        <BattlePanel />
      </div>

      <!-- 右侧属性面板 -->
      <div class="right-panel">
        <AttributePanel />
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'
import AttributePanel from './AttributePanel.vue'
import BattlePanel from './BattlePanel.vue'
import EquipmentPanel from './EquipmentPanel.vue'
import { loadGame, addLog, getPlayerStats, gameState } from '../../store/gameStore'

export default {
  name: 'GameMain',
  components: {
    NavBar,
    AttributePanel,
    BattlePanel,
    EquipmentPanel
  },
  mounted() {
    if (loadGame()) {
      addLog('欢迎回来！', 'success')
    } else {
      addLog('欢迎来到修仙世界！', 'normal')
    }
    gameState.battle.playerCurrentHp = getPlayerStats().maxHp
  }
}
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%);
  display: flex;
  flex-direction: column;
  transition: background 0.3s;
}

.game-content {
  flex: 1;
  display: flex;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
}

.left-panel {
  width: 738px;
  flex-shrink: 0;
  overflow-y: auto;
}

.center-panel {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
}

.right-panel {
  width: 260px;
  flex-shrink: 0;
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .game-content {
    flex-wrap: wrap;
  }

  .left-panel,
  .right-panel {
    width: calc(50% - 8px);
  }

  .center-panel {
    width: 100%;
    order: -1;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
  }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .game-content {
    padding: 5px;
    gap: 8px;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
    min-height: auto;
  }

  .center-panel {
    min-height: 350px;
  }
}
</style>

<!-- 浅色主题全局样式 -->
<style>
.game-container.light-theme {
  color: #1a1a2e;
}

.game-container.light-theme .navbar {
  background: linear-gradient(135deg, #e8e8f0 0%, #d0d0e0 100%);
  border-bottom-color: #b0b0c0;
}

.game-container.light-theme .nav-brand h1 {
  color: #8b6914;
  text-shadow: none;
}

.game-container.light-theme .subtitle {
  color: #666;
}

.game-container.light-theme .info-item .label {
  color: #666;
}

.game-container.light-theme .info-item .value {
  color: #333;
}

.game-container.light-theme .info-item .value.level {
  color: #c77800;
}

.game-container.light-theme .info-item .value.realm {
  color: #2980b9;
}

.game-container.light-theme .info-item .value.gold {
  color: #b8860b;
}

.game-container.light-theme .nav-btn {
  border-color: #b0b0c0;
}

.game-container.light-theme .attribute-panel,
.game-container.light-theme .battle-panel,
.game-container.light-theme .equipment-panel {
  background: linear-gradient(135deg, #f5f5fa 0%, #e8e8f0 100%);
  border-color: #c0c0d0;
  color: #333;
}

.game-container.light-theme .panel-header h3 {
  color: #8b6914;
}

.game-container.light-theme .stat-row,
.game-container.light-theme .stat-item {
  color: #333;
}

.game-container.light-theme .stat-label {
  color: #666;
}

.game-container.light-theme .equip-slot {
  background: #e0e0ea;
  border-color: #c0c0d0;
}

.game-container.light-theme .equip-slot.equipped {
  background: #d8f0d8;
  border-color: #5a9a5a;
}

.game-container.light-theme .inventory-item {
  background: #e0e0ea;
  border-color: #c0c0d0;
}

.game-container.light-theme .inventory-item:hover {
  background: #d0d0e0;
}

.game-container.light-theme .filter-section {
  background: #e0e0ea;
}

.game-container.light-theme .filter-tabs button {
  background: #f5f5fa;
  border-color: #c0c0d0;
  color: #666;
}

.game-container.light-theme .filter-tabs button.active {
  background: #d0d0e0;
  color: #333;
}

.game-container.light-theme .map-selector,
.game-container.light-theme .monster-info,
.game-container.light-theme .battle-log {
  background: #e0e0ea;
  border-color: #c0c0d0;
}

.game-container.light-theme .battle-log {
  color: #333;
}

.game-container.light-theme .log-entry {
  border-bottom-color: #d0d0e0;
}

.game-container.light-theme .hp-bar-bg {
  background: #c0c0d0;
}

.game-container.light-theme .settings-panel {
  background: linear-gradient(135deg, #f5f5fa 0%, #e8e8f0 100%);
  border-color: #c0c0d0;
}

.game-container.light-theme .settings-panel h3 {
  color: #8b6914;
}

.game-container.light-theme .setting-item label {
  color: #2980b9;
}

.game-container.light-theme .loot-filter-settings {
  background: #e0e0ea;
}

.game-container.light-theme .filter-hint {
  background: #f5f5fa;
  color: #666;
}

.game-container.light-theme .item-detail-modal .item-detail,
.game-container.light-theme .item-detail-modal .enhance-panel {
  background: linear-gradient(135deg, #f5f5fa 0%, #e8e8f0 100%);
}

.game-container.light-theme .detail-stats,
.game-container.light-theme .enhance-stats,
.game-container.light-theme .enhance-details {
  background: #e0e0ea;
}

.game-container.light-theme .stat-name {
  color: #666;
}

.game-container.light-theme .item-tooltip {
  background: #f5f5fa;
  border-color: #c0c0d0;
}

.game-container.light-theme .tooltip-quality,
.game-container.light-theme .tooltip-req {
  color: #666;
}

.game-container.light-theme .tooltip-stats {
  background: #e0e0ea;
}

.game-container.light-theme .modal-content,
.game-container.light-theme .skill-panel,
.game-container.light-theme .pet-panel {
  background: linear-gradient(135deg, #f5f5fa 0%, #e8e8f0 100%);
  border-color: #c0c0d0;
  color: #333;
}

.game-container.light-theme .skill-item,
.game-container.light-theme .pet-item {
  background: #e0e0ea;
  border-color: #c0c0d0;
}

.game-container.light-theme .skill-item:hover,
.game-container.light-theme .pet-item:hover {
  background: #d0d0e0;
}

.game-container.light-theme .auto-save-hint {
  background: rgba(39, 174, 96, 0.15);
  color: #1e7e34;
}
</style>
