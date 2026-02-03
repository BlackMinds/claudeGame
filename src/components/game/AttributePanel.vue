<template>
  <div class="attribute-panel">
    <div class="panel-header">
      <div class="name-level">
        <h2 class="player-name" @click="openNameEdit" title="点击修改名字">{{ player.name }}</h2>
        <span class="level-badge">Lv.{{ player.level }}</span>
      </div>
      <div class="realm-badge">{{ currentRealm.name }}</div>
    </div>

    <!-- 经验条区域 -->
    <div class="exp-section">
      <div class="exp-row">
        <div class="exp-label">
          <span>等级</span>
          <span v-if="isAtMaxLevel" class="max-level">MAX</span>
          <span v-else>{{ player.exp }} / {{ expToNextLevel }}</span>
        </div>
        <div class="exp-bar-container">
          <div class="exp-bar level-exp" :style="{ width: levelExpPercent + '%' }"></div>
        </div>
      </div>

      <div class="exp-row">
        <div class="exp-label">
          <span>修为</span>
          <span>{{ player.realmExp }} / {{ nextRealmExp }}</span>
        </div>
        <div class="exp-bar-container">
          <div class="exp-bar realm-exp" :style="{ width: realmExpPercent + '%' }"></div>
        </div>
      </div>

    </div>
    <!-- 修改名字弹窗 -->
    <div v-if="showNameEdit" class="modal-overlay" @click.self="showNameEdit = false">
      <div class="name-edit-modal">
        <h3>修改名字</h3>
        <input
          type="text"
          v-model="newName"
          maxlength="12"
          placeholder="请输入新名字"
          @keyup.enter="confirmNameChange"
          ref="nameInput"
        />
        <div class="name-hint">最多12个字符</div>
        <div class="name-edit-actions">
          <button class="confirm-btn" @click="confirmNameChange">确认</button>
          <button class="cancel-btn" @click="showNameEdit = false">取消</button>
        </div>
      </div>
    </div>

    <div class="attributes">
      <div class="attr-group">
        <h3>基础属性</h3>
        <div class="attr-item">
          <span class="attr-icon hp-icon"></span>
          <span class="attr-name">生命值</span>
          <span class="attr-value">{{ stats.maxHp }}</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon atk-icon"></span>
          <span class="attr-name">攻击力</span>
          <span class="attr-value">{{ stats.attack }}</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon def-icon"></span>
          <span class="attr-name">防御力</span>
          <span class="attr-value">{{ stats.defense }}</span>
        </div>
      </div>

      <div class="attr-group">
        <h3>战斗属性</h3>
        <div class="attr-item">
          <span class="attr-icon crit-icon"></span>
          <span class="attr-name">暴击率</span>
          <span class="attr-value">{{ stats.critRate.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon crit-dmg-icon"></span>
          <span class="attr-name">暴击伤害</span>
          <span class="attr-value">{{ (150 + stats.critDamage).toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon crit-res-icon"></span>
          <span class="attr-name">抗暴击</span>
          <span class="attr-value">{{ stats.critResist.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon pen-icon"></span>
          <span class="attr-name">穿透</span>
          <span class="attr-value">{{ stats.penetration.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon dodge-icon"></span>
          <span class="attr-name">闪避率</span>
          <span class="attr-value">{{ stats.dodge.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon hit-icon"></span>
          <span class="attr-name">命中率</span>
          <span class="attr-value">{{ stats.hit.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon lifesteal-icon"></span>
          <span class="attr-name">吸血</span>
          <span class="attr-value">{{ stats.lifesteal.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon drop-icon"></span>
          <span class="attr-name">掉落率</span>
          <span class="attr-value">+{{ stats.dropRate.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon damage-reduce-icon"></span>
          <span class="attr-name">减伤</span>
          <span class="attr-value">{{ stats.damageReduction.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon thorns-icon"></span>
          <span class="attr-name">反伤</span>
          <span class="attr-value">{{ stats.thorns.toFixed(1) }}%</span>
        </div>
      </div>

      <div class="attr-group">
        <div class="attr-item">
          <span class="attr-icon hp-bonus-icon"></span>
          <span class="attr-name">生命加成</span>
          <span class="attr-value bonus">+{{ totalBonus.hpBonus.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon atk-bonus-icon"></span>
          <span class="attr-name">攻击加成</span>
          <span class="attr-value bonus">+{{ totalBonus.attackBonus.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon def-bonus-icon"></span>
          <span class="attr-name">防御加成</span>
          <span class="attr-value bonus">+{{ totalBonus.defenseBonus.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon heal-icon"></span>
          <span class="attr-name">治疗加成</span>
          <span class="attr-value bonus">+{{ totalBonus.healBonus.toFixed(1) }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon heal-recv-icon"></span>
          <span class="attr-name">受治疗加成</span>
          <span class="attr-value bonus">+{{ totalBonus.healReceivedBonus.toFixed(1) }}%</span>
        </div>
      </div>

      <div class="attr-group">
        <h3>主动技能 ({{ equippedActiveSkills.length }}/4)</h3>
        <div v-if="equippedActiveSkills.length === 0" class="no-skills">暂无装备</div>
        <div v-else class="equipped-skills-list">
          <div v-for="skill in equippedActiveSkills" :key="skill.id" class="equipped-skill-item">
            <span class="skill-name" :style="{ color: skill.rarityColor }">{{ skill.name }}</span>
            <span class="skill-level">Lv.{{ skill.currentLevel }}</span>
            <span class="skill-dmg">{{ (skill.damageMultiplier * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </div>

      <div class="attr-group">
        <h3>被动技能 ({{ equippedPassiveSkills.length }}/{{ maxPassiveSlots }})</h3>
        <div v-if="equippedPassiveSkills.length === 0" class="no-skills">暂无装备</div>
        <div v-else class="equipped-skills-list">
          <div v-for="skill in equippedPassiveSkills" :key="skill.id" class="equipped-skill-item passive">
            <span class="skill-name" :style="{ color: skill.rarityColor }">{{ skill.name }}</span>
            <span class="skill-level">Lv.{{ skill.currentLevel }}</span>
            <span class="skill-bonus">{{ getPassiveBonusText(skill) }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { gameState, getCurrentRealm, getEquippedActiveSkillsWithDetails, getEquippedPassiveSkillsWithDetails, getPlayerStats, getExpToNextLevel, getNextRealm, getMaxPassiveSlots, isMaxLevel, getPassiveSkillBonus, getEquippedCraftedArtifact, getSetBonuses, saveGame } from '../../store/gameStore'
import { getCraftedArtifactStats, getTalentEffects } from '../../data/gameData'
import { skillRarityConfig } from '../../data/gameData'

export default {
  name: 'AttributePanel',
  data() {
    return {
      showNameEdit: false,
      newName: '',
      statNames: {
        hp: '生命',
        attack: '攻击',
        defense: '防御',
        critRate: '暴击',
        critResist: '抗暴',
        critDamage: '暴伤',
        dodge: '闪避',
        hit: '命中',
        penetration: '穿透',
        skillDamage: '技伤',
        lifesteal: '吸血',
        damageReduction: '减伤',
        thorns: '反伤',
        hpRegen: '回复',
        hpPercent: '生命',
        attackPercent: '攻击',
        defensePercent: '防御',
        conditionalDamageReduction: '条件减伤',
        lowHpDefenseBonus: '低血防御',
        fatalReflect: '致命反伤'
      },
      // 百分比类型的属性
      percentStats: ['hpPercent', 'attackPercent', 'defensePercent', 'conditionalDamageReduction', 'lowHpDefenseBonus', 'fatalReflect']
    }
  },
  computed: {
    player() {
      return gameState.player
    },
    currentRealm() {
      return getCurrentRealm()
    },
    equippedActiveSkills() {
      const skills = getEquippedActiveSkillsWithDetails()
      return skills.map(skill => ({
        ...skill,
        rarityColor: skillRarityConfig[skill.rarity]?.color || '#ffffff'
      }))
    },
    equippedPassiveSkills() {
      const skills = getEquippedPassiveSkillsWithDetails()
      return skills.map(skill => ({
        ...skill,
        rarityColor: skillRarityConfig[skill.rarity]?.color || '#ffffff'
      }))
    },
    maxPassiveSlots() {
      return getMaxPassiveSlots()
    },
    stats() {
      // 引用 talentsVersion 以建立 Vue 响应式依赖
      const _ = gameState.player.talentsVersion
      return getPlayerStats()
    },
    expToNextLevel() {
      return getExpToNextLevel()
    },
    levelExpPercent() {
      if (this.isAtMaxLevel) return 100
      return Math.min(100, (this.player.exp / this.expToNextLevel) * 100)
    },
    isAtMaxLevel() {
      return isMaxLevel()
    },
    nextRealmExp() {
      const next = getNextRealm()
      return next ? next.minExp : 'MAX'
    },
    realmExpPercent() {
      const next = getNextRealm()
      if (!next) return 100
      const prev = this.currentRealm.minExp
      return Math.min(100, ((this.player.realmExp - prev) / (next.minExp - prev)) * 100)
    },
    // 总百分比加成（包含境界、被动技能、套装、法宝、天赋等）
    totalBonus() {
      // 引用 talentsVersion 以建立 Vue 响应式依赖
      const _ = gameState.player.talentsVersion
      const stats = getPlayerStats()
      const realm = this.currentRealm
      const passiveStats = getPassiveSkillBonus()
      const setBonuses = this.setBonus
      const artPassive = this.artifactBonus
      const talentEffects = getTalentEffects(gameState.player.talents)

      return {
        hpBonus: (realm.hpBonus || 0) + (setBonuses.hp || 0) + (passiveStats.hpPercent || 0) + (artPassive.hpPercent || 0) + (artPassive.allPercent || 0) + (talentEffects.hpPercent || 0),
        attackBonus: (realm.attackBonus || 0) + (setBonuses.attack || 0) + (passiveStats.attackPercent || 0) + (artPassive.attackPercent || 0) + (artPassive.allPercent || 0) + (talentEffects.attackPercent || 0),
        defenseBonus: (realm.defenseBonus || 0) + (setBonuses.defense || 0) + (passiveStats.defensePercent || 0) + (artPassive.defensePercent || 0) + (artPassive.allPercent || 0) + (talentEffects.defensePercent || 0),
        lifesteal: stats.lifesteal || 0,
        healBonus: stats.healBonus || 0,
        healReceivedBonus: stats.healReceivedBonus || 0
      }
    },
    // 套装加成
    setBonus() {
      return getSetBonuses().bonuses || {}
    },
    // 法宝加成
    artifactBonus() {
      const artifact = getEquippedCraftedArtifact()
      if (!artifact) return {}
      const artStats = getCraftedArtifactStats(artifact)
      return artStats?.passiveEffects || {}
    }
  },
  methods: {
    getPassiveBonusText(skill) {
      if (!skill.bonusStats) return ''
      const texts = []
      for (const [stat, value] of Object.entries(skill.bonusStats)) {
        const name = this.statNames[stat] || stat
        // 百分比类型的属性显示%
        if (this.percentStats.includes(stat)) {
          texts.push(`${name}+${value}%`)
        } else {
          texts.push(`${name}+${value}`)
        }
      }
      return texts.join(' ')
    },
    openNameEdit() {
      this.newName = this.player.name
      this.showNameEdit = true
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus()
          this.$refs.nameInput.select()
        }
      })
    },
    confirmNameChange() {
      const trimmedName = this.newName.trim()
      if (trimmedName && trimmedName.length <= 12) {
        gameState.player.name = trimmedName
        saveGame()
        this.showNameEdit = false
      }
    }
  }
}
</script>

<style scoped>
.attribute-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #4a4a6a;
  border-radius: 10px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #4a4a6a;
}

.name-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header h2 {
  margin: 0;
  color: #ffd700;
  font-size: 1.2em;
}

.player-name {
  cursor: pointer;
  transition: all 0.2s;
}

.player-name:hover {
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  transform: scale(1.02);
}

/* 修改名字弹窗 */
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

.name-edit-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 20px;
  min-width: 280px;
  text-align: center;
}

.name-edit-modal h3 {
  color: #ffd700;
  margin: 0 0 15px 0;
  font-size: 1.1em;
}

.name-edit-modal input {
  width: 100%;
  padding: 10px 12px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  color: #fff;
  font-size: 1em;
  text-align: center;
  box-sizing: border-box;
}

.name-edit-modal input:focus {
  outline: none;
  border-color: #ffd700;
}

.name-hint {
  color: #888;
  font-size: 0.8em;
  margin-top: 8px;
}

.name-edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.name-edit-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.confirm-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.cancel-btn {
  background: #4a4a6a;
  color: #ccc;
}

.cancel-btn:hover {
  background: #5a5a7a;
}

.level-badge {
  background: linear-gradient(135deg, #ff9f43, #ee8e32);
  padding: 2px 8px;
  border-radius: 10px;
  color: white;
  font-size: 0.75em;
  font-weight: bold;
}

.realm-badge {
  background: linear-gradient(135deg, #4a90d9, #357abd);
  padding: 4px 12px;
  border-radius: 15px;
  color: white;
  font-size: 0.8em;
}

.attributes {
  flex: 1;
  overflow-y: auto;
}

.attr-group {
  margin-bottom: 12px;
}

.attr-group h3 {
  color: #87ceeb;
  font-size: 0.85em;
  margin: 0 0 8px 0;
  padding-bottom: 5px;
  border-bottom: 1px dashed #3a3a5a;
}

.attr-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #2a2a4a;
}

.attr-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 3px;
}

.hp-icon { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); }
.atk-icon { background: linear-gradient(135deg, #ff9f43, #ee8e32); }
.def-icon { background: linear-gradient(135deg, #54a0ff, #4392e6); }
.crit-icon { background: linear-gradient(135deg, #ff6b6b, #ff4757); }
.crit-dmg-icon { background: linear-gradient(135deg, #ff4757, #c0392b); }
.crit-res-icon { background: linear-gradient(135deg, #5f27cd, #4a1fb8); }
.skill-icon { background: linear-gradient(135deg, #00d2d3, #00b8b9); }
.pen-icon { background: linear-gradient(135deg, #6c5ce7, #5b4cdb); }
.dodge-icon { background: linear-gradient(135deg, #1dd1a1, #10b897); }
.hit-icon { background: linear-gradient(135deg, #feca57, #f9b62a); }
.lifesteal-icon { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.drop-icon { background: linear-gradient(135deg, #f39c12, #e67e22); }
.damage-reduce-icon { background: linear-gradient(135deg, #3498db, #2980b9); }
.thorns-icon { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
.hp-bonus-icon { background: linear-gradient(135deg, #e91e63, #c2185b); }
.atk-bonus-icon { background: linear-gradient(135deg, #ff5722, #e64a19); }
.def-bonus-icon { background: linear-gradient(135deg, #2196f3, #1976d2); }
.lifesteal-bonus-icon { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }
.heal-icon { background: linear-gradient(135deg, #4caf50, #388e3c); }
.heal-recv-icon { background: linear-gradient(135deg, #8bc34a, #689f38); }

.attr-name {
  flex: 1;
  color: #aaa;
  font-size: 0.8em;
}

.attr-value {
  color: #fff;
  font-weight: bold;
  font-size: 0.85em;
}

.attr-value.bonus {
  color: #2ecc71;
}

.no-skills {
  color: #666;
  font-size: 0.75em;
  font-style: italic;
}

.equipped-skills-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.equipped-skill-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  background: #1a1a2e;
  border-radius: 4px;
  font-size: 0.75em;
}

.equipped-skill-item .skill-name {
  flex: 1;
  font-weight: bold;
}

.equipped-skill-item .skill-level {
  color: #ffd700;
}

.equipped-skill-item .skill-dmg {
  color: #ff6b6b;
}

.equipped-skill-item.passive {
  background: #1a2a3a;
}

.equipped-skill-item .skill-bonus {
  color: #98fb98;
  font-size: 0.9em;
}

.exp-section {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #4a4a6a;
}

.exp-row {
  margin-bottom: 8px;
}

.exp-row:last-child {
  margin-bottom: 0;
}

.exp-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
  color: #aaa;
  font-size: 0.75em;
}

.exp-bar-container {
  height: 8px;
  background: #2a2a4a;
  border-radius: 4px;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.exp-bar.level-exp {
  background: linear-gradient(90deg, #ff9f43, #feca57);
}

.exp-bar.realm-exp {
  background: linear-gradient(90deg, #4a90d9, #87ceeb);
}

.max-level {
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .attribute-panel {
    padding: 10px;
  }

  .panel-header h2 {
    font-size: 1em;
  }

  .level-badge {
    font-size: 0.7em;
    padding: 2px 6px;
  }

  .realm-badge {
    font-size: 0.75em;
    padding: 3px 10px;
  }

  .attr-group h3 {
    font-size: 0.8em;
  }

  .attr-item {
    padding: 3px 0;
  }

  .attr-name {
    font-size: 0.75em;
  }

  .attr-value {
    font-size: 0.8em;
  }
}

@media (max-width: 480px) {
  .attribute-panel {
    padding: 8px;
  }

  .panel-header {
    margin-bottom: 10px;
    padding-bottom: 8px;
  }

  .name-level {
    gap: 5px;
  }

  .panel-header h2 {
    font-size: 0.9em;
  }

  .level-badge {
    font-size: 0.65em;
    padding: 1px 5px;
  }

  .realm-badge {
    font-size: 0.7em;
    padding: 2px 8px;
  }

  .attr-group {
    margin-bottom: 8px;
  }

  .attr-group h3 {
    font-size: 0.75em;
    margin-bottom: 5px;
  }

  .attr-icon {
    width: 14px;
    height: 14px;
    margin-right: 4px;
  }

  .attr-name {
    font-size: 0.7em;
  }

  .attr-value {
    font-size: 0.75em;
  }

  .equipped-skill-item {
    padding: 3px 5px;
    font-size: 0.7em;
  }

  .exp-section {
    margin-top: 8px;
    padding-top: 8px;
  }

  .exp-label {
    font-size: 0.7em;
  }

  .exp-bar-container {
    height: 6px;
  }
}
</style>
