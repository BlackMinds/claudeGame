<template>
  <div class="game-container">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主内容区域 -->
    <div class="game-content">
      <!-- 左侧属性面板 -->
      <div class="left-panel">
        <AttributePanel />
      </div>

      <!-- 中间战斗面板 -->
      <div class="center-panel">
        <BattlePanel />
      </div>

      <!-- 右侧装备面板 -->
      <div class="right-panel">
        <EquipmentPanel />
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
}

.game-content {
  flex: 1;
  display: flex;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
}

.center-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.right-panel {
  width: 320px;
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
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
  }
}
</style>
