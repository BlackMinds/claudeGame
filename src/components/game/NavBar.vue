<template>
  <nav class="navbar">
    <div class="nav-brand">
      <h1>修仙传</h1>
      <span class="subtitle">文字RPG</span>
    </div>

    <div class="nav-info">
      <div class="info-item">
        <span class="label">等级</span>
        <span class="value level">Lv.{{ player.level }}</span>
      </div>
      <div class="info-item">
        <span class="label">境界</span>
        <span class="value realm">{{ currentRealm.name }}</span>
      </div>
      <div class="info-item clickable" @click="showSkillPanel = true">
        <span class="label">技能</span>
        <span class="value skill">{{ equippedActiveCount }}/4主动 · {{ equippedPassiveCount }}/2被动</span>
      </div>
      <div class="info-item">
        <span class="label">灵石</span>
        <span class="value gold">{{ player.gold }}</span>
      </div>
    </div>

    <div class="nav-actions">
      <button @click="showSkillPanel = true" class="nav-btn skill">技能</button>
      <button @click="showSettings = true" class="nav-btn settings">设置</button>
      <button @click="handleSave" class="nav-btn save">保存</button>
      <!-- <button @click="handleLoad" class="nav-btn load">读取</button> -->
      <button @click="handleReset" class="nav-btn reset">重置</button>
    </div>

    <!-- 设置面板 -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="settings-panel">
        <button class="modal-close" @click="showSettings = false">×</button>
        <h3>游戏设置</h3>

        <div class="setting-item">
          <label>背景颜色</label>
          <div class="color-presets">
            <div
              v-for="preset in colorPresets"
              :key="preset.name"
              class="color-preset"
              :style="{ background: preset.gradient }"
              :class="{ active: currentBgColor === preset.name }"
              @click="setBgColor(preset.name)"
              :title="preset.label"
            ></div>
          </div>
        </div>

        <div class="setting-item">
          <label>自定义颜色</label>
          <div class="custom-color">
            <input type="color" v-model="customColor1" @change="applyCustomColor" />
            <span>到</span>
            <input type="color" v-model="customColor2" @change="applyCustomColor" />
          </div>
        </div>

        <div class="setting-item">
          <label>存档管理</label>
          <div class="save-management">
            <button @click="handleExport" class="mgmt-btn export">导出存档</button>
            <button @click="showImportInput = true" class="mgmt-btn import">导入存档</button>
          </div>
          <div v-if="showImportInput" class="import-section">
            <textarea v-model="importData" placeholder="粘贴存档数据..."></textarea>
            <div class="import-actions">
              <button @click="handleImport" class="mgmt-btn confirm">确认导入</button>
              <button @click="showImportInput = false; importData = ''" class="mgmt-btn cancel">取消</button>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="auto-save-hint">自动保存已开启，每次操作自动保存</div>
        </div>
      </div>
    </div>

    <!-- 技能面板弹窗 -->
    <div v-if="showSkillPanel" class="modal-overlay" @click.self="showSkillPanel = false">
      <div class="modal-content">
        <button class="modal-close" @click="showSkillPanel = false">×</button>
        <SkillPanel />
      </div>
    </div>
  </nav>
</template>

<script>
import { gameState, getCurrentRealm, saveGame, loadGame, resetGame, exportSave, importSave } from '../../store/gameStore'
import SkillPanel from './SkillPanel.vue'

export default {
  name: 'NavBar',
  components: {
    SkillPanel
  },
  data() {
    return {
      showSkillPanel: false,
      showSettings: false,
      showImportInput: false,
      importData: '',
      currentBgColor: 'default',
      customColor1: '#0a0a1a',
      customColor2: '#1a1a3a',
      colorPresets: [
        { name: 'default', label: '默认深蓝', gradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' },
        { name: 'dark', label: '纯黑', gradient: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)' },
        { name: 'purple', label: '紫色', gradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 100%)' },
        { name: 'green', label: '深绿', gradient: 'linear-gradient(180deg, #0a1a0a 0%, #1a3a1a 100%)' },
        { name: 'red', label: '暗红', gradient: 'linear-gradient(180deg, #1a0a0a 0%, #3a1a1a 100%)' },
        { name: 'brown', label: '古铜', gradient: 'linear-gradient(180deg, #1a1408 0%, #2d2315 100%)' },
        { name: 'ocean', label: '海洋', gradient: 'linear-gradient(180deg, #0a1520 0%, #152535 100%)' },
        { name: 'sunset', label: '日落', gradient: 'linear-gradient(180deg, #1a1020 0%, #2a1530 100%)' }
      ]
    }
  },
  mounted() {
    // 加载保存的背景色
    const savedBg = localStorage.getItem('xiuxianBgColor')
    if (savedBg) {
      const data = JSON.parse(savedBg)
      this.currentBgColor = data.name
      if (data.name === 'custom') {
        this.customColor1 = data.color1
        this.customColor2 = data.color2
      }
      this.applyBgColor(data.gradient)
    }
  },
  computed: {
    player() {
      return gameState.player
    },
    currentRealm() {
      return getCurrentRealm()
    },
    equippedActiveCount() {
      return gameState.player.equippedActiveSkills.length
    },
    equippedPassiveCount() {
      return gameState.player.equippedPassiveSkills.length
    }
  },
  methods: {
    handleSave() {
      saveGame()
    },
    handleLoad() {
      if (confirm('确定要读取存档吗？当前未保存的进度将丢失！')) {
        const success = loadGame()
        if (success) {
          alert('存档读取成功！')
        } else {
          alert('没有找到存档或存档已损坏！')
        }
      }
    },
    handleReset() {
      if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
        resetGame()
      }
    },
    setBgColor(presetName) {
      const preset = this.colorPresets.find(p => p.name === presetName)
      if (preset) {
        this.currentBgColor = presetName
        this.applyBgColor(preset.gradient)
        localStorage.setItem('xiuxianBgColor', JSON.stringify({
          name: presetName,
          gradient: preset.gradient
        }))
      }
    },
    applyCustomColor() {
      const gradient = `linear-gradient(180deg, ${this.customColor1} 0%, ${this.customColor2} 100%)`
      this.currentBgColor = 'custom'
      this.applyBgColor(gradient)
      localStorage.setItem('xiuxianBgColor', JSON.stringify({
        name: 'custom',
        gradient: gradient,
        color1: this.customColor1,
        color2: this.customColor2
      }))
    },
    applyBgColor(gradient) {
      const gameContainer = document.querySelector('.game-container')
      if (gameContainer) {
        gameContainer.style.background = gradient
      }
    },
    handleExport() {
      const data = exportSave()
      if (data) {
        navigator.clipboard.writeText(data).then(() => {
          alert('存档已复制到剪贴板！')
        }).catch(() => {
          // 如果剪贴板失败，显示数据让用户手动复制
          prompt('请复制以下存档数据：', data)
        })
      } else {
        alert('导出存档失败！')
      }
    },
    handleImport() {
      if (!this.importData.trim()) {
        alert('请粘贴存档数据！')
        return
      }
      if (confirm('导入存档将覆盖当前进度，确定继续吗？')) {
        const success = importSave(this.importData.trim())
        if (success) {
          alert('存档导入成功！')
          this.showImportInput = false
          this.importData = ''
          this.showSettings = false
        } else {
          alert('存档数据无效或已损坏！')
        }
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #4a4a6a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.nav-brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8em;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.subtitle {
  color: #888;
  font-size: 0.9em;
}

.nav-info {
  display: flex;
  gap: 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-item .label {
  font-size: 0.8em;
  color: #888;
}

.info-item .value {
  font-size: 1.1em;
  color: #e0e0e0;
  font-weight: bold;
}

.info-item .value.level {
  color: #ff9f43;
}

.info-item .value.realm {
  color: #87ceeb;
}

.info-item .value.gold {
  color: #ffd700;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.nav-btn {
  padding: 8px 20px;
  border: 1px solid #4a4a6a;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
}

.nav-btn.save {
  background: #2a5a2a;
  color: #98fb98;
}

.nav-btn.save:hover {
  background: #3a7a3a;
}

.nav-btn.load {
  background: #2a4a6a;
  color: #87ceeb;
}

.nav-btn.load:hover {
  background: #3a6a8a;
}

.nav-btn.reset {
  background: #5a2a2a;
  color: #ff9999;
}

.nav-btn.reset:hover {
  background: #7a3a3a;
}

.nav-btn.skill {
  background: #4a2a6a;
  color: #d8b4fe;
}

.nav-btn.skill:hover {
  background: #5a3a7a;
}

.info-item.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.info-item.clickable:hover {
  transform: scale(1.05);
}

.info-item .value.skill {
  color: #d8b4fe;
  font-size: 0.9em;
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

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #e74c3c;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  z-index: 10;
}

.modal-close:hover {
  background: #c0392b;
}

.nav-btn.settings {
  background: #3a3a5a;
  color: #c0c0c0;
}

.nav-btn.settings:hover {
  background: #4a4a6a;
}

.settings-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4a4a6a;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  position: relative;
}

.settings-panel h3 {
  margin: 0 0 20px 0;
  color: #ffd700;
  font-size: 1.2em;
  text-align: center;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  color: #87ceeb;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.color-preset {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-preset:hover {
  transform: scale(1.1);
  border-color: #fff;
}

.color-preset.active {
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-color input[type="color"] {
  width: 50px;
  height: 35px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: transparent;
}

.custom-color span {
  color: #888;
  font-size: 0.85em;
}

.save-management {
  display: flex;
  gap: 10px;
}

.mgmt-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
}

.mgmt-btn.export {
  background: #2a5a2a;
  color: #98fb98;
}

.mgmt-btn.export:hover {
  background: #3a7a3a;
}

.mgmt-btn.import {
  background: #2a4a6a;
  color: #87ceeb;
}

.mgmt-btn.import:hover {
  background: #3a6a8a;
}

.mgmt-btn.confirm {
  background: #27ae60;
  color: white;
}

.mgmt-btn.confirm:hover {
  background: #2ecc71;
}

.mgmt-btn.cancel {
  background: #5a3a3a;
  color: #ff9999;
}

.mgmt-btn.cancel:hover {
  background: #7a4a4a;
}

.import-section {
  margin-top: 10px;
}

.import-section textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  color: #fff;
  font-size: 0.85em;
  resize: none;
  margin-bottom: 8px;
}

.import-section textarea::placeholder {
  color: #666;
}

.import-actions {
  display: flex;
  gap: 10px;
}

.auto-save-hint {
  color: #98fb98;
  font-size: 0.85em;
  text-align: center;
  padding: 8px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(39, 174, 96, 0.3);
}
</style>
