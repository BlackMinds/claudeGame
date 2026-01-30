<template>
  <div class="pet-panel">
    <div class="panel-header">
      <h3>宠物</h3>
      <span class="pet-count">{{ pets.length }}/{{ petLimit }}</span>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'pets' }"
        @click="activeTab = 'pets'"
      >我的宠物</button>
      <button
        :class="{ active: activeTab === 'eggs' }"
        @click="activeTab = 'eggs'"
      >宠物蛋</button>
      <button
        :class="{ active: activeTab === 'pills' }"
        @click="activeTab = 'pills'"
      >资质丹</button>
    </div>

    <!-- 宠物列表 -->
    <div v-if="activeTab === 'pets'" class="pet-list">
      <div v-if="pets.length === 0" class="empty-hint">
        还没有宠物，通关锁妖塔可获得宠物蛋
      </div>
      <div
        v-for="pet in pets"
        :key="pet.id"
        class="pet-card"
        :class="{ active: pet.isActive }"
        @click="selectPet(pet)"
      >
        <div class="pet-icon">{{ pet.icon }}</div>
        <div class="pet-info">
          <div class="pet-name" :style="{ color: pet.qualityColor }">
            <span class="quality-tag">[{{ pet.qualityName }}]</span>
            {{ pet.name }}
            <span v-if="pet.isActive" class="active-tag">出战中</span>
          </div>
          <div class="pet-level">Lv.{{ pet.level }} · 资质{{ formatAptitude(pet.aptitude) }}</div>
          <div class="pet-exp">
            <div class="exp-bar-wrap">
              <div class="exp-bar" :style="{ width: getPetExpPercent(pet) + '%' }"></div>
            </div>
            <span class="exp-text">{{ pet.exp }}/{{ pet.expToNext }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 宠物蛋列表 -->
    <div v-if="activeTab === 'eggs'" class="egg-list">
      <div v-if="petEggs.length === 0" class="empty-hint">
        没有宠物蛋，通关锁妖塔10/100/200层可获得
      </div>
      <div
        v-for="(egg, index) in petEggs"
        :key="egg.id"
        class="egg-card"
        :style="{ borderColor: egg.qualityColor }"
      >
        <div class="egg-icon">🥚</div>
        <div class="egg-info">
          <div class="egg-name" :style="{ color: egg.qualityColor }">{{ egg.name }}</div>
          <div class="egg-desc">来自锁妖塔第{{ egg.towerFloor }}层</div>
        </div>
        <button class="hatch-btn" @click="hatchEgg(index)">孵化</button>
      </div>
    </div>

    <!-- 资质丹列表 -->
    <div v-if="activeTab === 'pills'" class="pill-list">
      <div v-if="aptitudePills.length === 0" class="empty-hint">
        没有资质丹，通关锁妖塔90/190层可获得
      </div>
      <div
        v-for="(pill, index) in aptitudePills"
        :key="pill.id"
        class="pill-card"
        :style="{ borderColor: pill.color }"
      >
        <div class="pill-icon">💊</div>
        <div class="pill-info">
          <div class="pill-name" :style="{ color: pill.color }">{{ pill.name }}</div>
          <div class="pill-desc">
            资质+{{ pill.minBoost.toFixed(2) }}~{{ pill.maxBoost.toFixed(2) }}
            <span class="pill-limit">（上限{{ pill.maxAptitude || (pill.tier === 1 ? 9 : 10) }}）</span>
          </div>
        </div>
        <button
          class="use-pill-btn"
          @click="selectPillToUse(index)"
          :disabled="!selectedPetId"
        >使用</button>
      </div>
      <div v-if="aptitudePills.length > 0 && !selectedPetId" class="pill-hint">
        请先在"我的宠物"标签页中选择一只宠物
      </div>
    </div>

    <!-- 选中宠物详情 -->
    <div v-if="selectedPet" class="pet-detail">
      <div class="detail-header">
        <span class="pet-icon-large">{{ selectedPet.icon }}</span>
        <div class="detail-name" :style="{ color: selectedPet.qualityColor }">
          {{ selectedPet.name }}
        </div>
        <div class="detail-level">Lv.{{ selectedPet.level }}</div>
      </div>

      <div class="aptitude-bar">
        <span class="apt-label">资质</span>
        <div class="apt-bar-wrap">
          <div class="apt-bar" :style="{ width: (selectedPet.aptitude / 10 * 100) + '%' }"></div>
        </div>
        <span class="apt-value" :class="getAptitudeClass(selectedPet.aptitude)">{{ formatAptitude(selectedPet.aptitude) }}</span>
      </div>

      <div class="detail-stats">
        <div class="stat-row">
          <span class="stat-label">生命</span>
          <span class="stat-value">{{ selectedPet.stats.maxHp }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">攻击</span>
          <span class="stat-value">{{ selectedPet.stats.attack }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">防御</span>
          <span class="stat-value">{{ selectedPet.stats.defense }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">暴击率</span>
          <span class="stat-value">{{ selectedPet.critRate }}%</span>
        </div>
      </div>

      <div class="detail-skills" v-if="selectedPet.skills && selectedPet.skills.length > 0">
        <div class="skills-title">技能</div>
        <div class="skill-list">
          <div v-for="skillId in selectedPet.skills" :key="skillId" class="skill-item">
            {{ getSkillName(skillId) }}
          </div>
        </div>
      </div>

      <div class="detail-actions">
        <button
          v-if="!selectedPet.isActive"
          class="action-btn deploy"
          @click="handleDeploy"
        >出战</button>
        <button
          v-else
          class="action-btn recall"
          @click="handleRecall"
        >收回</button>
        <button
          class="action-btn release"
          @click="handleRelease"
          :disabled="selectedPet.isActive"
        >放生</button>
      </div>
    </div>

    <!-- 当前出战宠物状态 -->
    <div v-if="activePet" class="active-pet-status">
      <div class="status-title">出战宠物</div>
      <div class="active-pet-info">
        <span class="pet-icon">{{ activePet.icon }}</span>
        <span class="pet-name" :style="{ color: activePet.qualityColor }">{{ activePet.name }}</span>
        <span class="pet-hp">HP: {{ activePet.currentHp }}/{{ activePet.baseHp }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  gameState,
  getPetsWithDetails,
  getActivePet,
  deployPet,
  recallPet,
  releasePet,
  usePetEgg,
  useAptitudePill
} from '../../store/gameStore'
import { getSkillById } from '../../data/gameData'

export default {
  name: 'PetPanel',
  data() {
    return {
      activeTab: 'pets',
      selectedPetId: null,
      petLimit: 10
    }
  },
  computed: {
    pets() {
      return getPetsWithDetails()
    },
    activePet() {
      return getActivePet()
    },
    selectedPet() {
      if (!this.selectedPetId) return null
      return this.pets.find(p => p.id === this.selectedPetId)
    },
    petEggs() {
      return gameState.player.inventory.filter(item => item.type === 'petEgg')
    },
    aptitudePills() {
      return gameState.player.inventory.filter(item => item.type === 'aptitudePill')
    }
  },
  methods: {
    selectPet(pet) {
      this.selectedPetId = pet.id
    },
    getPetExpPercent(pet) {
      if (!pet.expToNext) return 0
      return Math.min(100, (pet.exp / pet.expToNext) * 100)
    },
    getSkillName(skillId) {
      const skill = getSkillById(skillId)
      return skill ? skill.name : '未知技能'
    },
    handleDeploy() {
      if (this.selectedPetId) {
        deployPet(this.selectedPetId)
      }
    },
    handleRecall() {
      recallPet()
    },
    handleRelease() {
      if (this.selectedPetId && confirm('确定要放生这只宠物吗？')) {
        releasePet(this.selectedPetId)
        this.selectedPetId = null
      }
    },
    hatchEgg(inventoryIndex) {
      // 找到对应的背包索引
      const eggs = gameState.player.inventory
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.type === 'petEgg')

      if (eggs[inventoryIndex]) {
        usePetEgg(eggs[inventoryIndex].idx)
      }
    },
    formatAptitude(aptitude) {
      return aptitude.toFixed(2)
    },
    getAptitudeClass(aptitude) {
      if (aptitude >= 9) return 'apt-legendary'
      if (aptitude >= 7) return 'apt-epic'
      if (aptitude >= 5) return 'apt-rare'
      if (aptitude >= 3) return 'apt-common'
      return 'apt-low'
    },
    selectPillToUse(pillIndex) {
      if (!this.selectedPetId) {
        return
      }
      // 找到对应的背包索引
      const pills = gameState.player.inventory
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.type === 'aptitudePill')

      if (pills[pillIndex]) {
        useAptitudePill(pills[pillIndex].idx, this.selectedPetId)
      }
    }
  }
}
</script>

<style scoped>
.pet-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #4a4a6a;
  border-radius: 10px;
  padding: 15px;
  max-height: 75vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h3 {
  margin: 0;
  color: #ffd700;
  font-size: 1.1em;
}

.pet-count {
  color: #87ceeb;
  font-size: 0.9em;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tabs button {
  flex: 1;
  padding: 8px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button.active {
  background: #3a3a6a;
  color: #fff;
  border-color: #6a6a8a;
}

.tabs button:hover {
  background: #3a3a5a;
}

.pet-list, .egg-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.empty-hint {
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 0.9em;
}

.pet-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #2a2a4a;
  border: 1px solid #3a3a5a;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.pet-card:hover {
  background: #3a3a5a;
}

.pet-card.active {
  border-color: #ffd700;
  background: #3a3a4a;
}

.pet-icon {
  font-size: 2em;
}

.pet-info {
  flex: 1;
}

.pet-name {
  font-weight: bold;
  font-size: 0.95em;
}

.quality-tag {
  font-size: 0.8em;
  opacity: 0.8;
}

.active-tag {
  background: #27ae60;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-left: 5px;
}

.pet-level {
  color: #87ceeb;
  font-size: 0.85em;
}

.pet-exp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.exp-bar-wrap {
  flex: 1;
  height: 6px;
  background: #1a1a2e;
  border-radius: 3px;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  background: linear-gradient(90deg, #9b59b6, #8e44ad);
  transition: width 0.3s;
}

.exp-text {
  color: #888;
  font-size: 0.75em;
  min-width: 80px;
  text-align: right;
}

.egg-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #2a2a4a;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  margin-bottom: 8px;
}

.egg-icon {
  font-size: 2em;
}

.egg-info {
  flex: 1;
}

.egg-name {
  font-weight: bold;
}

.egg-desc {
  color: #888;
  font-size: 0.8em;
}

.hatch-btn {
  padding: 6px 15px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.hatch-btn:hover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.pet-detail {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.pet-icon-large {
  font-size: 2.5em;
}

.detail-name {
  font-size: 1.2em;
  font-weight: bold;
}

.detail-level {
  color: #87ceeb;
  margin-left: auto;
}

.detail-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background: #1a1a2e;
  border-radius: 4px;
}

.stat-label {
  color: #888;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}

.detail-skills {
  margin-bottom: 15px;
}

.skills-title {
  color: #ffd700;
  font-size: 0.9em;
  margin-bottom: 8px;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-item {
  padding: 4px 10px;
  background: #4a2a6a;
  color: #d8b4fe;
  border-radius: 4px;
  font-size: 0.85em;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
}

.action-btn.deploy {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.action-btn.deploy:hover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.action-btn.recall {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.action-btn.recall:hover {
  background: linear-gradient(135deg, #e67e22, #f39c12);
}

.action-btn.release {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.action-btn.release:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.active-pet-status {
  background: #2a3a4a;
  border: 1px solid #4a6a8a;
  border-radius: 8px;
  padding: 10px;
}

.status-title {
  color: #87ceeb;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.active-pet-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-pet-info .pet-icon {
  font-size: 1.5em;
}

.active-pet-info .pet-name {
  font-weight: bold;
}

.active-pet-info .pet-hp {
  color: #e74c3c;
  margin-left: auto;
  font-size: 0.9em;
}

/* 资质条样式 */
.aptitude-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 8px 10px;
  background: #1a1a2e;
  border-radius: 6px;
}

.apt-label {
  color: #ffd700;
  font-size: 0.9em;
  min-width: 30px;
}

.apt-bar-wrap {
  flex: 1;
  height: 10px;
  background: #2a2a4a;
  border-radius: 5px;
  overflow: hidden;
}

.apt-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #9b59b6, #e67e22);
  transition: width 0.3s;
}

.apt-value {
  font-weight: bold;
  min-width: 40px;
  text-align: right;
}

.apt-low { color: #888; }
.apt-common { color: #ffffff; }
.apt-rare { color: #3498db; }
.apt-epic { color: #9b59b6; }
.apt-legendary { color: #e67e22; }

/* 资质丹列表样式 */
.pill-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.pill-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #2a2a4a;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  margin-bottom: 8px;
}

.pill-icon {
  font-size: 2em;
}

.pill-info {
  flex: 1;
}

.pill-name {
  font-weight: bold;
}

.pill-desc {
  color: #888;
  font-size: 0.8em;
}

.pill-limit {
  color: #666;
}

.use-pill-btn {
  padding: 6px 15px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.use-pill-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
}

.use-pill-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pill-hint {
  color: #888;
  font-size: 0.85em;
  text-align: center;
  padding: 10px;
  background: #1a1a2e;
  border-radius: 6px;
}
</style>
