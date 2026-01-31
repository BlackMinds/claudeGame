<template>
  <div class="attribute-panel">
    <div class="panel-header">
      <div class="name-level">
        <h2>{{ player.name }}</h2>
        <span class="level-badge">Lv.{{ player.level }}</span>
      </div>
      <div class="realm-badge">{{ currentRealm.name }}</div>
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
          <span class="attr-name">忽视防御</span>
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
      </div>

      <div class="attr-group">
        <h3>境界加成</h3>
        <div class="attr-item">
          <span class="attr-icon hp-bonus-icon"></span>
          <span class="attr-name">生命加成</span>
          <span class="attr-value bonus">+{{ realmBonus.hpBonus }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon atk-bonus-icon"></span>
          <span class="attr-name">攻击加成</span>
          <span class="attr-value bonus">+{{ realmBonus.attackBonus }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon def-bonus-icon"></span>
          <span class="attr-name">防御加成</span>
          <span class="attr-value bonus">+{{ realmBonus.defenseBonus }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon lifesteal-bonus-icon"></span>
          <span class="attr-name">吸血加成</span>
          <span class="attr-value bonus">+{{ realmBonus.lifestealBonus }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon heal-icon"></span>
          <span class="attr-name">治疗加成</span>
          <span class="attr-value bonus">+{{ realmBonus.healBonus }}%</span>
        </div>
        <div class="attr-item">
          <span class="attr-icon heal-recv-icon"></span>
          <span class="attr-name">受治疗加成</span>
          <span class="attr-value bonus">+{{ realmBonus.healReceivedBonus }}%</span>
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
  </div>
</template>

<script>
import { gameState, getCurrentRealm, getEquippedActiveSkillsWithDetails, getEquippedPassiveSkillsWithDetails, getPlayerStats, getExpToNextLevel, getNextRealm, getMaxPassiveSlots, isMaxLevel } from '../../store/gameStore'
import { skillRarityConfig } from '../../data/gameData'

export default {
  name: 'AttributePanel',
  data() {
    return {
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
        hpRegen: '回复'
      }
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
    realmBonus() {
      const realm = this.currentRealm
      return {
        hpBonus: realm.hpBonus || 0,
        attackBonus: realm.attackBonus || 0,
        defenseBonus: realm.defenseBonus || 0,
        lifestealBonus: realm.lifestealBonus || 0,
        healBonus: realm.healBonus || 0,
        healReceivedBonus: realm.healReceivedBonus || 0
      }
    }
  },
  methods: {
    getPassiveBonusText(skill) {
      if (!skill.bonusStats) return ''
      const texts = []
      for (const [stat, value] of Object.entries(skill.bonusStats)) {
        const name = this.statNames[stat] || stat
        texts.push(`${name}+${value}`)
      }
      return texts.join(' ')
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
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #4a4a6a;
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
</style>
