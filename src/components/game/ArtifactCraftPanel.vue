<template>
  <div class="artifact-craft-panel">
    <div class="panel-header">
      <h3>法宝工坊</h3>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'materials' }"
        @click="activeTab = 'materials'"
      >材料背包</button>
      <button
        :class="{ active: activeTab === 'craft' }"
        @click="activeTab = 'craft'"
      >打造法宝</button>
      <button
        :class="{ active: activeTab === 'artifacts' }"
        @click="activeTab = 'artifacts'"
      >我的法宝</button>
    </div>

    <!-- 材料背包 -->
    <div v-if="activeTab === 'materials'" class="materials-tab">
      <div v-if="materials.length === 0" class="empty-hint">
        还没有材料，击杀怪物可获得材料
      </div>
      <div class="materials-grid">
        <div
          v-for="mat in materials"
          :key="mat.id"
          class="material-card"
          :class="mat.grade"
        >
          <div class="material-icon">{{ mat.icon }}</div>
          <div class="material-info">
            <div class="material-name" :style="{ color: getGradeColor(mat.grade) }">
              {{ mat.name }}
            </div>
            <div class="material-grade">[{{ getGradeName(mat.grade) }}]</div>
            <div class="material-count">x{{ mat.count }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打造法宝 -->
    <div v-if="activeTab === 'craft'" class="craft-tab">
      <div class="craft-section">
        <div class="section-title">
          选择材料
          <span class="material-limit-hint">(最多{{ maxMaterialTypes }}种，每种最多{{ maxPerMaterial }}个 | 已选{{ selectedMaterialTypes }}种)</span>
        </div>
        <div class="craft-materials-grid">
          <div
            v-for="mat in materials"
            :key="mat.id"
            class="craft-material-card"
            :class="{ selected: selectedMaterials[mat.id] > 0 }"
            @click="toggleMaterial(mat)"
          >
            <div class="material-icon">{{ mat.icon }}</div>
            <div class="material-name" :style="{ color: getGradeColor(mat.grade) }">
              {{ mat.name }}
            </div>
            <div class="material-count">
              拥有: {{ mat.count }}
              <span v-if="selectedMaterials[mat.id]" class="selected-count">
                (已选: {{ selectedMaterials[mat.id] }})
              </span>
            </div>
            <div class="material-controls" v-if="selectedMaterials[mat.id] > 0">
              <button @click.stop="decreaseMaterial(mat)">-</button>
              <span>{{ selectedMaterials[mat.id] }}</span>
              <button @click.stop="increaseMaterial(mat)">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="craft-preview">
        <div class="section-title">预览</div>
        <div class="preview-quality" :style="{ color: previewQuality.color }">
          预计品质: {{ previewQuality.name }}
        </div>
        <div class="preview-info">
          <div>最高等级: {{ previewQuality.maxLevel }}级</div>
          <div>被动技能: {{ previewQuality.passiveSlots }}个</div>
          <div>主动技能: {{ previewQuality.activeSlots }}个</div>
          <div>成长倍率: {{ previewQuality.growthRate }}x</div>
        </div>
        <div class="craft-name-input">
          <label>法宝名称(可选):</label>
          <input v-model="customArtifactName" placeholder="留空则随机生成" />
        </div>
        <button
          class="craft-btn"
          :disabled="!canCraft"
          @click="doCraft"
        >
          开始打造
        </button>
      </div>
    </div>

    <!-- 我的法宝 -->
    <div v-if="activeTab === 'artifacts'" class="artifacts-tab">
      <div v-if="craftedArtifacts.length === 0" class="empty-hint">
        还没有打造法宝，去打造标签页制作一个吧
      </div>
      <div
        v-for="artifact in craftedArtifacts"
        :key="artifact.id"
        class="artifact-card"
        :class="{ equipped: equippedArtifactId === artifact.id }"
        :style="{ borderColor: artifact.qualityColor }"
      >
        <div class="artifact-header">
          <div class="artifact-name" :style="{ color: artifact.qualityColor }">
            [{{ artifact.qualityName }}] {{ artifact.name }}
          </div>
          <div class="artifact-level">
            Lv.{{ artifact.level }}/{{ artifact.maxLevel }}
          </div>
        </div>

        <div class="artifact-exp">
          <div class="exp-bar-wrap">
            <div class="exp-bar" :style="{ width: getArtifactExpPercent(artifact) + '%' }"></div>
          </div>
        </div>

        <div class="artifact-stats">
          <div class="stat-row">
            <span>攻击: +{{ getArtifactStats(artifact).stats.attack }}</span>
            <span>防御: +{{ getArtifactStats(artifact).stats.defense }}</span>
            <span>生命: +{{ getArtifactStats(artifact).stats.hp }}</span>
          </div>
        </div>

        <div class="artifact-skills">
          <div class="skills-section" v-if="artifact.passiveSkills && artifact.passiveSkills.length > 0">
            <div class="skills-title">被动技能:</div>
            <div
              v-for="skill in artifact.passiveSkills"
              :key="skill.id"
              class="skill-item passive"
            >
              {{ skill.name }}: {{ getSkillValue(skill, artifact.level) }}
            </div>
          </div>
          <div class="skills-section" v-if="artifact.activeSkills && artifact.activeSkills.length > 0">
            <div class="skills-title">主动技能:</div>
            <div
              v-for="skill in artifact.activeSkills"
              :key="skill.id"
              class="skill-item active"
            >
              {{ skill.name }} (CD:{{ skill.cooldown }})
            </div>
          </div>
        </div>

        <div class="artifact-actions">
          <button
            v-if="equippedArtifactId !== artifact.id"
            class="equip-btn"
            @click="equipArtifact(artifact.id)"
          >装备</button>
          <button
            v-else
            class="unequip-btn"
            @click="unequipArtifact"
          >卸下</button>
          <button
            class="dismantle-btn"
            @click="dismantleArtifact(artifact.id)"
            :disabled="equippedArtifactId === artifact.id"
          >分解</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  artifactMaterials,
  materialGrades,
  craftedArtifactQualities,
  getArtifactExpForLevel,
  getCraftedArtifactStats
} from '../../data/gameData'
import {
  gameState,
  getAllMaterials,
  getMaterialCount,
  doCraftArtifact,
  equipCraftedArtifact,
  unequipCraftedArtifact,
  dismantleCraftedArtifact,
  getCraftedArtifacts
} from '../../store/gameStore'

export default {
  name: 'ArtifactCraftPanel',
  data() {
    return {
      activeTab: 'materials',
      selectedMaterials: {},
      customArtifactName: ''
    }
  },
  computed: {
    materials() {
      return getAllMaterials()
    },
    craftedArtifacts() {
      return getCraftedArtifacts()
    },
    equippedArtifactId() {
      return gameState.player.equippedCraftedArtifact
    },
    totalSelectedWeight() {
      let weight = 0
      for (const [matId, count] of Object.entries(this.selectedMaterials)) {
        if (count > 0) {
          const mat = artifactMaterials.find(m => m.id === matId)
          if (mat) {
            weight += materialGrades[mat.grade].weight * count
          }
        }
      }
      return weight
    },
    highestSelectedGrade() {
      const gradeOrder = ['low', 'mid', 'high', 'super']
      let highestIndex = -1
      for (const [matId, count] of Object.entries(this.selectedMaterials)) {
        if (count > 0) {
          const mat = artifactMaterials.find(m => m.id === matId)
          if (mat) {
            const index = gradeOrder.indexOf(mat.grade)
            if (index > highestIndex) {
              highestIndex = index
            }
          }
        }
      }
      return highestIndex >= 0 ? gradeOrder[highestIndex] : 'low'
    },
    previewQuality() {
      // 基于最高材料等级决定品质
      const grade = this.highestSelectedGrade
      const gradeToQuality = {
        'super': { ...craftedArtifactQualities.divine, name: '神品' },
        'high': { ...craftedArtifactQualities.immortal, name: '仙品' },
        'mid': { ...craftedArtifactQualities.spirit, name: '灵品' },
        'low': { ...craftedArtifactQualities.common, name: '凡品' }
      }
      return gradeToQuality[grade] || { ...craftedArtifactQualities.common, name: '凡品' }
    },
    canCraft() {
      return this.totalSelectedWeight > 0
    },
    // 已选择的材料种类数
    selectedMaterialTypes() {
      return Object.values(this.selectedMaterials).filter(count => count > 0).length
    },
    // 最大材料种类数
    maxMaterialTypes() {
      return 3
    },
    // 每种材料最大数量
    maxPerMaterial() {
      return 50
    }
  },
  methods: {
    getGradeColor(grade) {
      return materialGrades[grade]?.color || '#ffffff'
    },
    getGradeName(grade) {
      return materialGrades[grade]?.name || grade
    },
    toggleMaterial(mat) {
      if (!this.selectedMaterials[mat.id]) {
        // 检查是否已达到最大材料种类数
        if (this.selectedMaterialTypes >= this.maxMaterialTypes) {
          return // 已达到3种材料上限
        }
        this.$set(this.selectedMaterials, mat.id, 1)
      } else if (this.selectedMaterials[mat.id] >= Math.min(mat.count, this.maxPerMaterial)) {
        this.$set(this.selectedMaterials, mat.id, 0)
      } else {
        this.$set(this.selectedMaterials, mat.id, this.selectedMaterials[mat.id] + 1)
      }
    },
    increaseMaterial(mat) {
      const maxCount = Math.min(mat.count, this.maxPerMaterial)
      if (this.selectedMaterials[mat.id] < maxCount) {
        this.$set(this.selectedMaterials, mat.id, this.selectedMaterials[mat.id] + 1)
      }
    },
    decreaseMaterial(mat) {
      if (this.selectedMaterials[mat.id] > 0) {
        this.$set(this.selectedMaterials, mat.id, this.selectedMaterials[mat.id] - 1)
      }
    },
    doCraft() {
      const materials = []
      for (const [matId, count] of Object.entries(this.selectedMaterials)) {
        if (count > 0) {
          materials.push({ id: matId, count })
        }
      }
      if (materials.length === 0) return

      const artifact = doCraftArtifact(materials, this.customArtifactName || null)
      if (artifact) {
        this.selectedMaterials = {}
        this.customArtifactName = ''
        this.activeTab = 'artifacts'
      }
    },
    equipArtifact(artifactId) {
      equipCraftedArtifact(artifactId)
    },
    unequipArtifact() {
      unequipCraftedArtifact()
    },
    dismantleArtifact(artifactId) {
      if (confirm('确定要分解这个法宝吗？将有50%几率返还部分材料。')) {
        dismantleCraftedArtifact(artifactId)
      }
    },
    getArtifactExpPercent(artifact) {
      const expNeeded = getArtifactExpForLevel(artifact.level)
      return Math.min(100, (artifact.exp / expNeeded) * 100)
    },
    getArtifactStats(artifact) {
      return getCraftedArtifactStats(artifact) || { stats: { attack: 0, defense: 0, hp: 0 } }
    },
    getSkillValue(skill, level) {
      const value = skill.baseValue + (level - 1) * skill.growthPerLevel
      const effectName = this.getEffectDisplayName(skill.effect)
      return `${effectName} +${value.toFixed(1)}%`
    },
    getEffectDisplayName(effect) {
      const names = {
        hpPercent: '生命',
        attackPercent: '攻击',
        defensePercent: '防御',
        critRate: '暴击率',
        critDamage: '暴击伤害',
        lifesteal: '吸血',
        damageReduction: '减伤',
        penetration: '穿透',
        dodge: '闪避',
        thorns: '反伤',
        healBonus: '治疗加成',
        healReceivedBonus: '受疗加成',
        debuffDamageBonus: '控制额外伤害',
        killHealPercent: '击杀回复',
        allPercent: '全属性',
        revive: '复活生命',
        lowHpReduction: '低血减伤'
      }
      return names[effect] || effect
    }
  }
}
</script>

<style scoped>
.artifact-craft-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  padding: 15px;
  color: #fff;
  max-height: 80vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #4a4a6a;
  padding-bottom: 10px;
}

.panel-header h3 {
  margin: 0;
  color: #ffd700;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.tabs button {
  flex: 1;
  padding: 8px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 5px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #3a3a5a;
}

.tabs button.active {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: #fff;
  border-color: #bb8fce;
}

.empty-hint {
  text-align: center;
  color: #888;
  padding: 30px;
}

/* 材料背包 */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.material-card {
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.material-card.low { border-color: #2ecc71; }
.material-card.mid { border-color: #3498db; }
.material-card.high { border-color: #9b59b6; }
.material-card.super { border-color: #e67e22; }

.material-icon {
  font-size: 2em;
  margin-bottom: 5px;
}

.material-name {
  font-weight: bold;
  font-size: 0.9em;
}

.material-grade {
  font-size: 0.8em;
  color: #888;
}

.material-count {
  font-size: 0.9em;
  color: #ffd700;
  margin-top: 5px;
}

/* 打造标签 */
.craft-section {
  margin-bottom: 20px;
}

.section-title {
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #4a4a6a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.material-limit-hint {
  color: #888;
  font-size: 0.75em;
  font-weight: normal;
}

.craft-materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.craft-material-card {
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.craft-material-card:hover {
  border-color: #9b59b6;
}

.craft-material-card.selected {
  border-color: #ffd700;
  background: #3a3a5a;
}

.craft-material-card .material-icon {
  font-size: 1.5em;
}

.craft-material-card .material-name {
  font-size: 0.8em;
}

.craft-material-card .material-count {
  font-size: 0.75em;
  color: #aaa;
}

.selected-count {
  color: #ffd700;
}

.material-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.material-controls button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: #4a4a6a;
  color: #fff;
  cursor: pointer;
}

.material-controls button:hover {
  background: #5a5a7a;
}

/* 预览区 */
.craft-preview {
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 8px;
  padding: 15px;
}

.preview-quality {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
}

.preview-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  font-size: 0.9em;
  color: #aaa;
  margin-bottom: 15px;
}

.craft-name-input {
  margin-bottom: 15px;
}

.craft-name-input label {
  display: block;
  color: #888;
  font-size: 0.85em;
  margin-bottom: 5px;
}

.craft-name-input input {
  width: 100%;
  padding: 8px;
  background: #1a1a2e;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  color: #fff;
}

.craft-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.craft-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
}

.craft-btn:disabled {
  background: #4a4a6a;
  cursor: not-allowed;
}

/* 法宝列表 */
.artifact-card {
  background: #2a2a4a;
  border: 2px solid #4a4a6a;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}

.artifact-card.equipped {
  background: linear-gradient(135deg, #2a3a4a 0%, #1a2a3a 100%);
}

.artifact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.artifact-name {
  font-weight: bold;
}

.artifact-level {
  font-size: 0.85em;
  color: #98fb98;
}

.artifact-exp {
  margin-bottom: 8px;
}

.exp-bar-wrap {
  height: 6px;
  background: #1a1a2e;
  border-radius: 3px;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s;
}

.artifact-stats {
  font-size: 0.85em;
  color: #aaa;
  margin-bottom: 8px;
}

.stat-row {
  display: flex;
  gap: 15px;
}

.artifact-skills {
  margin-bottom: 10px;
}

.skills-section {
  margin-bottom: 5px;
}

.skills-title {
  font-size: 0.8em;
  color: #ffd700;
  margin-bottom: 3px;
}

.skill-item {
  font-size: 0.85em;
  padding: 3px 8px;
  border-radius: 4px;
  margin: 2px 0;
}

.skill-item.passive {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.skill-item.active {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.artifact-actions {
  display: flex;
  gap: 8px;
}

.artifact-actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.equip-btn {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: #fff;
}

.equip-btn:hover {
  background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
}

.unequip-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: #fff;
}

.dismantle-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: #fff;
}

.dismantle-btn:disabled {
  background: #4a4a6a;
  cursor: not-allowed;
}
</style>
