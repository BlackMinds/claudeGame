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
        <span class="value skill">{{ equippedActiveCount }}/4主动 · {{ equippedPassiveCount }}/{{ maxPassiveSlots }}被动</span>
      </div>
      <div class="info-item clickable" @click="showPetPanel = true">
        <span class="label">宠物</span>
        <span class="value pet">{{ activePetName || '无' }}</span>
      </div>
      <div class="info-item">
        <span class="label">灵石</span>
        <span class="value gold">{{ player.gold }}</span>
      </div>
    </div>

    <div class="nav-actions">
      <button @click="showSkillPanel = true" class="nav-btn skill">技能</button>
      <button @click="showPetPanel = true" class="nav-btn pet">宠物</button>
      <button @click="showArtifactPanel = true" class="nav-btn artifact">法宝</button>
      <button @click="handleMeditationClick" class="nav-btn meditation">打坐</button>
      <button @click="showGuide = true" class="nav-btn guide">图鉴</button>
      <button @click="showSettings = true" class="nav-btn settings">设置</button>
      <button @click="handleSave" class="nav-btn save">保存</button>
      <!-- <button @click="handleLoad" class="nav-btn load">读取</button> -->
      <button @click="handleReset" class="nav-btn reset">重置</button>
      <button v-if="isDevEnvironment" @click="handleAddTestEquipment" class="nav-btn dev">测试装备</button>
      <button v-if="isDevEnvironment" @click="handleToggleExpMultiplier" class="nav-btn dev" :class="{ active: expMultiplier > 1 }">{{ expMultiplier > 1 ? '100x经验' : '1x经验' }}</button>
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
          <label>装备拾取筛选</label>
          <div class="loot-filter-settings">
            <label class="filter-switch">
              <input type="checkbox" v-model="lootFilter.enabled" @change="saveLootFilter">
              <span class="switch-slider"></span>
              启用拾取筛选
            </label>

            <div v-if="lootFilter.enabled" class="loot-filter-options">
              <div class="loot-option-row">
                <span class="option-label">最低品质:</span>
                <div class="quality-buttons">
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

              <label class="filter-switch">
                <input type="checkbox" v-model="lootFilter.autoSellFiltered" @change="saveLootFilter">
                <span class="switch-slider"></span>
                自动卖出低品质装备
              </label>

              <label class="filter-switch">
                <input type="checkbox" v-model="lootFilter.pickupSkillBooks" @change="saveLootFilter">
                <span class="switch-slider"></span>
                拾取技能书
              </label>

              <div class="filter-hint">
                {{ getLootFilterHint() }}
              </div>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <label>兑换码</label>
          <div class="redeem-section">
            <input
              type="text"
              v-model="redeemCode"
              placeholder="输入兑换码..."
              class="redeem-input"
              @keyup.enter="handleRedeem"
            />
            <button @click="handleRedeem" class="redeem-btn">兑换</button>
          </div>
          <div v-if="redeemResult" class="redeem-result" :class="{ success: redeemResult.success, error: !redeemResult.success }">
            {{ redeemResult.message }}
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

    <!-- 宠物面板弹窗 -->
    <div v-if="showPetPanel" class="modal-overlay" @click.self="showPetPanel = false">
      <div class="modal-content">
        <button class="modal-close" @click="showPetPanel = false">×</button>
        <PetPanel />
      </div>
    </div>

    <!-- 法宝打造面板弹窗 -->
    <div v-if="showArtifactPanel" class="modal-overlay" @click.self="showArtifactPanel = false">
      <div class="modal-content artifact-modal">
        <button class="modal-close" @click="showArtifactPanel = false">×</button>
        <ArtifactCraftPanel />
      </div>
    </div>

    <!-- 图鉴面板弹窗 -->
    <div v-if="showGuide" class="modal-overlay" @click.self="showGuide = false">
      <div class="guide-panel">
        <button class="modal-close" @click="showGuide = false">×</button>
        <h3>游戏图鉴</h3>

        <div class="guide-tabs">
          <button :class="{ active: guideTab === 'sets' }" @click="guideTab = 'sets'">套装</button>
          <button :class="{ active: guideTab === 'tower' }" @click="guideTab = 'tower'">锁妖塔</button>
          <button :class="{ active: guideTab === 'pets' }" @click="guideTab = 'pets'">宠物</button>
          <button :class="{ active: guideTab === 'petSkills' }" @click="guideTab = 'petSkills'">宠物技能</button>
          <button :class="{ active: guideTab === 'artifacts' }" @click="guideTab = 'artifacts'">法宝</button>
          <button :class="{ active: guideTab === 'materials' }" @click="guideTab = 'materials'">材料</button>
          <button :class="{ active: guideTab === 'realms' }" @click="guideTab = 'realms'">境界</button>
        </div>

        <div class="guide-content">
          <!-- 套装加成 -->
          <div v-if="guideTab === 'sets'" class="guide-section">
            <div v-for="(set, key) in equipmentSetsData" :key="key" class="set-item">
              <div class="set-header" :style="{ color: set.color }">
                {{ set.name }}
              </div>
              <div class="set-desc">{{ set.description }}</div>
              <div class="set-pieces">部件：任意装备</div>
              <div class="set-bonuses">
                <div v-for="(bonus, count) in set.bonuses" :key="count" class="bonus-row">
                  <span class="bonus-count">{{ count }}件：</span>
                  <span class="bonus-desc">{{ bonus.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 锁妖塔掉落 -->
          <div v-if="guideTab === 'tower'" class="guide-section">
            <div class="tower-info">
              <p class="tower-tip">锁妖塔需要10级才能进入，每层3只怪物</p>
            </div>
            <h4 class="section-title">层数奖励</h4>
            <div class="tower-drops">
              <div class="drop-item">
                <span class="drop-floor">10层</span>
                <span class="drop-reward">初级宠物蛋（品质上限精良，资质上限6）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">90层</span>
                <span class="drop-reward">资质丹（+0.05~0.09，上限9）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">100层</span>
                <span class="drop-reward">高级宠物蛋（品质上限史诗，资质上限7）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">110-170层</span>
                <span class="drop-reward">初级宠物技能书（开出初级技能）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">180-190层</span>
                <span class="drop-reward">中级宠物技能书（开出初/中级技能）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">190层</span>
                <span class="drop-reward">高级资质丹（+0.10~0.20，上限10）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">200层</span>
                <span class="drop-reward">至尊宠物蛋（品质上限传说，资质上限8）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">300/400层</span>
                <span class="drop-reward">高级宠物技能书（开出全档位技能）</span>
              </div>
              <div class="drop-item">
                <span class="drop-floor">400层+</span>
                <span class="drop-reward">超级材料（混沌精华、鸿蒙之气）</span>
              </div>
            </div>
            <h4 class="section-title">特殊机制</h4>
            <div class="tower-special">
              <div class="special-item">
                <span class="special-floor">200层+</span>
                <span class="special-desc">怪物可能使用<span class="debuff-text">禁疗</span>（禁止回复生命3回合）</span>
              </div>
              <div class="special-item">
                <span class="special-floor">200层+</span>
                <span class="special-desc">怪物可能使用<span class="debuff-text">重伤</span>（回复效果减少60%持续3回合）</span>
              </div>
            </div>
          </div>

          <!-- 宠物介绍 -->
          <div v-if="guideTab === 'pets'" class="guide-section">
            <div class="pets-list">
              <div v-for="pet in petTypesData" :key="pet.id" class="pet-info-item">
                <div class="pet-info-header">
                  <span class="pet-icon">{{ pet.icon }}</span>
                  <span class="pet-name">{{ pet.name }}</span>
                  <span class="pet-role" :class="getRoleClass(pet.role)">{{ pet.role }}</span>
                </div>
                <div class="pet-info-skills">
                  <span class="skills-label">固有技能：</span>
                  <span v-for="skillId in pet.fixedSkills" :key="skillId" class="skill-tag">
                    {{ getSkillNameById(skillId) }}
                  </span>
                </div>
                <div v-if="pet.hiddenSkill" class="pet-info-hidden">
                  <span class="hidden-label">隐藏技能：</span>
                  <span class="hidden-skill">{{ getSkillNameById(pet.hiddenSkill) }}</span>
                  <span class="hidden-tip">（10%概率觉醒）</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 宠物技能 -->
          <div v-if="guideTab === 'petSkills'" class="guide-section">
            <div class="skill-category">
              <h4>可学习技能（通过技能书获得）</h4>
              <div class="skills-grid">
                <div v-for="skill in learnableSkillsData" :key="skill.id" class="skill-info-item" :class="'tier-' + skill.tier">
                  <div class="skill-info-header">
                    <span class="skill-type-tag" :class="getSkillTypeClass(skill)">{{ getSkillTypeLabel(skill) }}</span>
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-tier">{{ getTierName(skill.tier) }}</span>
                  </div>
                  <div class="skill-info-desc">{{ skill.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 法宝 -->
          <div v-if="guideTab === 'artifacts'" class="guide-section">
            <h4 class="section-title">法宝品质</h4>
            <div class="artifact-qualities">
              <div v-for="(quality, key) in artifactQualitiesData" :key="key" class="quality-item">
                <div class="quality-header" :style="{ color: quality.color }">
                  {{ quality.name }}
                </div>
                <div class="quality-stats">
                  <span>等级上限: {{ quality.maxLevel }}</span>
                  <span>成长率: {{ quality.growthRate }}</span>
                  <span>被动槽: {{ quality.passiveSlots }}</span>
                  <span>主动槽: {{ quality.activeSlots }}</span>
                </div>
              </div>
            </div>
            <h4 class="section-title">品质需求</h4>
            <div class="quality-requirements">
              <div class="req-item"><span class="req-quality" style="color:#ffffff">凡品</span>：任意材料可出</div>
              <div class="req-item"><span class="req-quality" style="color:#2ecc71">灵品</span>：需要至少1个中级材料</div>
              <div class="req-item"><span class="req-quality" style="color:#9b59b6">仙品</span>：需要至少1个高级材料</div>
              <div class="req-item"><span class="req-quality" style="color:#e67e22">神品</span>：需要至少1个超级材料</div>
            </div>
            <h4 class="section-title">升级经验</h4>
            <div class="artifact-exp-info">
              <p>公式: 200 × 等级 × (1 + 等级 × 0.2)</p>
              <div class="exp-examples">
                <span>1级: 240</span>
                <span>10级: 6,000</span>
                <span>50级: 110,000</span>
                <span>100级: 420,000</span>
              </div>
            </div>
          </div>

          <!-- 材料 -->
          <div v-if="guideTab === 'materials'" class="guide-section">
            <h4 class="section-title">材料掉落地点</h4>
            <div class="materials-list">
              <div v-for="mat in materialsData" :key="mat.id" class="material-item">
                <div class="material-header">
                  <span class="material-icon">{{ mat.icon }}</span>
                  <span class="material-name" :style="{ color: getMaterialColor(mat.grade) }">{{ mat.name }}</span>
                  <span class="material-grade" :style="{ color: getMaterialColor(mat.grade) }">{{ getMaterialGradeName(mat.grade) }}</span>
                </div>
                <div class="material-drop">
                  <span v-if="mat.dropMaps">地图 {{ mat.dropMaps.join('、') }}</span>
                  <span v-if="mat.dropTowerFloor">锁妖塔 {{ mat.dropTowerFloor }}层+</span>
                </div>
              </div>
            </div>
            <h4 class="section-title">掉落概率</h4>
            <div class="drop-rates">
              <div class="rate-item"><span class="rate-grade" style="color:#2ecc71">低级材料</span>：15%</div>
              <div class="rate-item"><span class="rate-grade" style="color:#3498db">中级材料</span>：8%</div>
              <div class="rate-item"><span class="rate-grade" style="color:#9b59b6">高级材料</span>：3%</div>
              <div class="rate-item"><span class="rate-grade" style="color:#e67e22">超级材料</span>：0.5%</div>
            </div>
          </div>

          <!-- 境界 -->
          <div v-if="guideTab === 'realms'" class="guide-section">
            <h4 class="section-title">修炼道路</h4>
            <div class="cultivation-paths">
              <div class="path-item xian-path">
                <div class="path-header">仙修（平衡型）</div>
                <div class="path-stats">
                  <span>生命 +5%/级</span>
                  <span>攻击 +5%/级</span>
                  <span>防御 +5%/级</span>
                </div>
                <div class="path-desc">通过悟道与积累，将自身法则融入天地大道</div>
              </div>
              <div class="path-item mo-path">
                <div class="path-header">魔修（攻击型）</div>
                <div class="path-stats">
                  <span>生命 +2%/级</span>
                  <span>攻击 +8%/级</span>
                  <span>吸血 +2%/级</span>
                </div>
                <div class="path-desc">通过掠夺与极端情绪，以自身意志取代天地法则</div>
              </div>
            </div>
            <h4 class="section-title">境界列表（仙修）</h4>
            <div class="realms-list">
              <div v-for="(realm, index) in realmsData" :key="index" class="realm-item">
                <span class="realm-name">{{ realm.name }}</span>
                <span class="realm-level">Lv.{{ realm.level }}</span>
                <span class="realm-exp">修为: {{ realm.minExp }}</span>
              </div>
            </div>
            <h4 class="section-title">突破机制</h4>
            <div class="breakthrough-info">
              <p>修为达到下一境界要求后可尝试突破</p>
              <p>成功率 = 基础30% + 溢出修为加成（上限95%）</p>
              <p class="warning-text">失败损失20%修为</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打坐面板弹窗 -->
    <div v-if="showMeditation" class="modal-overlay" @click.self="showMeditation = false">
      <div class="meditation-panel">
        <button class="modal-close" @click="showMeditation = false">×</button>
        <h3>突破境界</h3>

        <div class="meditation-info">
          <!-- 修炼类型显示 -->
          <div class="cultivation-type-display" v-if="cultivationType !== 'none'">
            <span class="type-label">修炼道路：</span>
            <span class="type-value" :class="cultivationType">{{ cultivationType === 'xian' ? '仙修' : '魔修' }}</span>
          </div>

          <div class="realm-display">
            <div class="current-realm">
              <span class="label">当前境界</span>
              <span class="value">{{ currentRealm.name }}</span>
            </div>
            <div class="arrow">→</div>
            <div class="next-realm">
              <span class="label">下一境界</span>
              <span class="value">{{ nextRealmInfo ? nextRealmInfo.name : '已达巅峰' }}</span>
            </div>
          </div>

          <div class="exp-progress">
            <div class="exp-label">
              <span>修为进度</span>
              <span>{{ player.realmExp }} / {{ nextRealmInfo ? nextRealmInfo.minExp : '---' }}</span>
            </div>
            <div class="exp-bar">
              <div class="exp-fill" :style="{ width: realmExpPercent + '%' }"></div>
            </div>
          </div>

          <div class="success-rate" v-if="canBreakthrough && !needChoosePath">
            <span class="label">晋升成功率</span>
            <span class="value" :class="successRateClass">{{ breakthroughRate }}%</span>
          </div>

          <div class="breakthrough-tips">
            <p v-if="!canBreakthrough">修为不足，继续修炼以积累更多修为</p>
            <p v-else-if="needChoosePath">修为充足，请选择你的修炼道路</p>
            <p v-else>修为充足，可以尝试晋升。修为越多，成功率越高</p>
            <p class="warning" v-if="canBreakthrough && !needChoosePath">晋升失败将损失20%修为</p>
          </div>

          <div v-if="breakthroughResult" class="breakthrough-result" :class="breakthroughResult.success ? 'success' : 'fail'">
            {{ breakthroughResult.message }}
          </div>

          <!-- 修炼类型选择（第一次晋升时显示） -->
          <div v-if="showCultivationChoice || needChoosePath" class="cultivation-choice">
            <h4>选择修炼道路</h4>
            <p class="choice-warning">此选择不可更改，请慎重选择！</p>

            <div class="choice-options">
              <div class="choice-option xian" @click="chooseCultivation('xian')">
                <div class="choice-title">仙修</div>
                <div class="choice-desc">平衡型成长</div>
                <div class="choice-stats">
                  <span>生命 +5%/级</span>
                  <span>攻击 +5%/级</span>
                  <span>防御 +5%/级</span>
                </div>
                <div class="choice-feature">核心理念：通过悟道与积累，将自身法则逐步融入天地大道，最终实现超脱。全面提升</div>
              </div>

              <div class="choice-option mo" @click="chooseCultivation('mo')">
                <div class="choice-title">魔修</div>
                <div class="choice-desc">攻击型成长</div>
                <div class="choice-stats">
                  <span>生命 +2%/级</span>
                  <span>攻击 +8%/级</span>
                  <span>吸血 +2%/级</span>
                </div>
                <div class="choice-feature">核心理念：通过掠夺与极端情绪，强化自我意志，最终以自身意志取代、扭曲天地法则。</div>
              </div>
            </div>
          </div>

          <button
            v-if="!needChoosePath"
            class="breakthrough-btn"
            :disabled="!canBreakthrough"
            @click="handleBreakthrough"
          >
            {{ canBreakthrough ? '尝试晋升' : '修为不足' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { gameState, getCurrentRealm, getNextRealm, saveGame, loadGame, resetGame, exportSave, importSave, getActivePet, updateLootFilter, getMaxPassiveSlots, addTestEquipment, toggleExpMultiplier, getExpMultiplier, useRedeemCode, isMeditationUnlocked, getBreakthroughSuccessRate, attemptBreakthrough, getCultivationType, setCultivationType, needsChooseCultivationType } from '../../store/gameStore'
import { equipmentSets, petTypes, skills, getSkillById, craftedArtifactQualities, artifactMaterials, materialGrades, xianRealms } from '../../data/gameData'
import SkillPanel from './SkillPanel.vue'
import PetPanel from './PetPanel.vue'
import ArtifactCraftPanel from './ArtifactCraftPanel.vue'

export default {
  name: 'NavBar',
  components: {
    SkillPanel,
    PetPanel,
    ArtifactCraftPanel
  },
  data() {
    return {
      showSkillPanel: false,
      showPetPanel: false,
      showArtifactPanel: false,
      showMeditation: false,
      showCultivationChoice: false,
      showSettings: false,
      showGuide: false,
      guideTab: 'sets',
      showImportInput: false,
      importData: '',
      breakthroughResult: null,
      currentBgColor: 'default',
      customColor1: '#0a0a1a',
      customColor2: '#1a1a3a',
      colorPresets: [
        { name: 'default', label: '默认深蓝', gradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' },
        { name: 'dark', label: '纯黑', gradient: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)' },
        { name: 'light', label: '白底黑字', gradient: 'linear-gradient(180deg, #ffffff 0%, #f0f0f5 100%)', isLight: true },
        { name: 'purple', label: '紫色', gradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 100%)' },
        { name: 'green', label: '深绿', gradient: 'linear-gradient(180deg, #0a1a0a 0%, #1a3a1a 100%)' },
        { name: 'red', label: '暗红', gradient: 'linear-gradient(180deg, #1a0a0a 0%, #3a1a1a 100%)' },
        { name: 'brown', label: '古铜', gradient: 'linear-gradient(180deg, #1a1408 0%, #2d2315 100%)' },
        { name: 'ocean', label: '海洋', gradient: 'linear-gradient(180deg, #0a1520 0%, #152535 100%)' }
      ],
      qualityOptions: [
        { key: 'white', name: '普通', color: '#ffffff' },
        { key: 'green', name: '优秀', color: '#2ecc71' },
        { key: 'blue', name: '精良', color: '#3498db' },
        { key: 'purple', name: '史诗', color: '#9b59b6' },
        { key: 'orange', name: '传说', color: '#e67e22' }
      ],
      redeemCode: '',
      redeemResult: null
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
      this.applyBgColor(data.gradient, data.isLight || false)
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
    },
    maxPassiveSlots() {
      return getMaxPassiveSlots()
    },
    activePetName() {
      const pet = getActivePet()
      return pet ? pet.name : null
    },
    lootFilter() {
      return gameState.lootFilter
    },
    isDevEnvironment() {
      const hostname = window.location.hostname
      return hostname === 'localhost' || hostname === '127.0.0.1'
    },
    expMultiplier() {
      return getExpMultiplier()
    },
    meditationUnlocked() {
      return isMeditationUnlocked()
    },
    nextRealmInfo() {
      return getNextRealm()
    },
    realmExpPercent() {
      if (!this.nextRealmInfo) return 100
      return Math.min(100, (this.player.realmExp / this.nextRealmInfo.minExp) * 100)
    },
    canBreakthrough() {
      if (!this.nextRealmInfo) return false
      return this.player.realmExp >= this.nextRealmInfo.minExp
    },
    breakthroughRate() {
      return getBreakthroughSuccessRate()
    },
    successRateClass() {
      const rate = this.breakthroughRate
      if (rate >= 80) return 'high'
      if (rate >= 60) return 'medium'
      return 'low'
    },
    cultivationType() {
      return getCultivationType()
    },
    needChoosePath() {
      return needsChooseCultivationType() && this.canBreakthrough
    },
    equipmentSetsData() {
      return equipmentSets
    },
    petTypesData() {
      return petTypes
    },
    learnableSkillsData() {
      // 可学习技能ID范围：301-327
      return skills.filter(s => s.id >= 301 && s.id <= 327).sort((a, b) => a.tier - b.tier)
    },
    artifactQualitiesData() {
      return craftedArtifactQualities
    },
    materialsData() {
      return artifactMaterials
    },
    realmsData() {
      return xianRealms
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
        this.applyBgColor(preset.gradient, preset.isLight)
        localStorage.setItem('xiuxianBgColor', JSON.stringify({
          name: presetName,
          gradient: preset.gradient,
          isLight: preset.isLight || false
        }))
      }
    },
    applyCustomColor() {
      const gradient = `linear-gradient(180deg, ${this.customColor1} 0%, ${this.customColor2} 100%)`
      this.currentBgColor = 'custom'
      this.applyBgColor(gradient, false)
      localStorage.setItem('xiuxianBgColor', JSON.stringify({
        name: 'custom',
        gradient: gradient,
        color1: this.customColor1,
        color2: this.customColor2,
        isLight: false
      }))
    },
    applyBgColor(gradient, isLight = false) {
      const gameContainer = document.querySelector('.game-container')
      if (gameContainer) {
        gameContainer.style.background = gradient
        if (isLight) {
          gameContainer.classList.add('light-theme')
        } else {
          gameContainer.classList.remove('light-theme')
        }
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
    },
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
      let hint = `只拾取【${minName}】及以上品质装备`
      if (this.lootFilter.autoSellFiltered) {
        hint += '，低品质自动卖出'
      } else {
        hint += '，低品质直接丢弃'
      }
      if (!this.lootFilter.pickupSkillBooks) {
        hint += '，不拾取技能书'
      }
      return hint
    },
    handleAddTestEquipment() {
      addTestEquipment()
      alert('测试神器已添加到法宝栏位！')
    },
    handleToggleExpMultiplier() {
      const isOn = toggleExpMultiplier()
      if (isOn) {
        alert('百倍经验已开启！')
      } else {
        alert('百倍经验已关闭')
      }
    },
    handleRedeem() {
      if (!this.redeemCode.trim()) {
        this.redeemResult = { success: false, message: '请输入兑换码' }
        return
      }
      const result = useRedeemCode(this.redeemCode)
      this.redeemResult = result
      if (result.success) {
        this.redeemCode = ''
        // 3秒后清除成功提示
        setTimeout(() => {
          this.redeemResult = null
        }, 3000)
      }
    },
    handleMeditationClick() {
      if (!this.meditationUnlocked) {
        alert('需要通关锁妖塔10层才能解锁打坐功能')
        return
      }
      this.showMeditation = true
    },
    handleBreakthrough() {
      const result = attemptBreakthrough()
      this.breakthroughResult = result
      // 如果需要选择修炼类型，显示选择界面
      if (result.needChoose) {
        this.showCultivationChoice = true
      }
      // 3秒后清除提示
      setTimeout(() => {
        this.breakthroughResult = null
      }, 3000)
    },
    chooseCultivation(type) {
      if (confirm(`确定选择${type === 'xian' ? '仙修' : '魔修'}道路吗？此选择不可更改！`)) {
        const success = setCultivationType(type)
        if (success) {
          this.showCultivationChoice = false
          this.breakthroughResult = {
            success: true,
            message: `已选择${type === 'xian' ? '仙修' : '魔修'}道路，可以开始晋升了！`
          }
          setTimeout(() => {
            this.breakthroughResult = null
          }, 3000)
        }
      }
    },
    getPieceNames(pieces) {
      const names = {
        weapon: '武器', armor: '防具', helmet: '头盔', ring: '戒指',
        necklace: '项链', boots: '鞋子', artifact: '法宝'
      }
      return pieces.map(p => names[p] || p).join('、')
    },
    getRoleClass(role) {
      // 根据中文角色名返回CSS类
      if (['输出', '爆发', '群攻', '毁灭', '狂暴', '穿透'].includes(role)) return 'attacker'
      if (['坦克', '防御'].includes(role)) return 'defender'
      if (['治疗', '辅助', '续航', '增益'].includes(role)) return 'support'
      if (['控制', '持续伤害', '减益', '混乱'].includes(role)) return 'balanced'
      return 'balanced'
    },
    getSkillNameById(skillId) {
      const skill = getSkillById(skillId)
      return skill ? skill.name : '未知技能'
    },
    getTierName(tier) {
      const names = { 1: '初级', 2: '中级', 3: '高级' }
      return names[tier] || '未知'
    },
    getSkillTypeLabel(skill) {
      if (!skill) return ''
      // 被动技能：type 包含 Passive 或 cooldown 为 0
      if (skill.type && skill.type.includes('Passive')) return '被动'
      if (skill.cooldown === 0) return '被动'
      // 有冷却的都是主动技能
      if (skill.cooldown && skill.cooldown > 0) return '主动'
      return ''
    },
    getSkillTypeClass(skill) {
      if (!skill) return ''
      if (skill.type && skill.type.includes('Passive')) return 'passive'
      if (skill.cooldown === 0) return 'passive'
      if (skill.cooldown && skill.cooldown > 0) return 'active'
      return ''
    },
    getMaterialColor(grade) {
      const colors = {
        low: '#2ecc71',
        mid: '#3498db',
        high: '#9b59b6',
        super: '#e67e22'
      }
      return colors[grade] || '#ffffff'
    },
    getMaterialGradeName(grade) {
      const names = {
        low: '低级',
        mid: '中级',
        high: '高级',
        super: '超级'
      }
      return names[grade] || '未知'
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

.nav-btn.pet {
  background: #5a4a2a;
  color: #ffcc99;
}

.nav-btn.pet:hover {
  background: #6a5a3a;
}

.nav-btn.artifact {
  background: #4a2a5a;
  color: #cc99ff;
}

.nav-btn.artifact:hover {
  background: #5a3a6a;
}

.nav-btn.dev {
  background: #6a2a6a;
  color: #ff99ff;
}

.nav-btn.dev:hover {
  background: #8a3a8a;
}

.nav-btn.dev.active {
  background: #2a8a2a;
  color: #98fb98;
  box-shadow: 0 0 10px rgba(152, 251, 152, 0.5);
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

.info-item .value.pet {
  color: #ff9f43;
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

.modal-content.artifact-modal {
  max-width: 600px;
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

/* 装备筛选设置 */
.loot-filter-settings {
  background: #2a2a4a;
  border-radius: 8px;
  padding: 12px;
}

.loot-filter-options {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #4a4a6a;
}

.filter-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #aaa;
  font-size: 0.85em;
  margin-bottom: 10px;
}

.filter-switch:last-child {
  margin-bottom: 0;
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
  flex-shrink: 0;
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

.loot-option-row {
  margin-bottom: 12px;
}

.option-label {
  color: #888;
  font-size: 0.85em;
  display: block;
  margin-bottom: 8px;
}

.quality-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quality-buttons button {
  padding: 4px 10px;
  background: #1a1a2e;
  border: 1px solid #4a4a6a;
  border-radius: 4px;
  font-size: 0.75em;
  cursor: pointer;
  transition: all 0.2s;
}

.quality-buttons button:hover {
  background: #3a3a5a;
}

.quality-buttons button.active {
  background: rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

.filter-hint {
  color: #888;
  font-size: 0.75em;
  padding: 8px;
  background: #1a1a2e;
  border-radius: 4px;
  margin-top: 10px;
  line-height: 1.4;
}

/* 兑换码样式 */
.redeem-section {
  display: flex;
  gap: 10px;
}

.redeem-input {
  flex: 1;
  padding: 8px 12px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9em;
}

.redeem-input::placeholder {
  color: #666;
}

.redeem-input:focus {
  outline: none;
  border-color: #ffd700;
}

.redeem-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #e67e22, #d35400);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s;
}

.redeem-btn:hover {
  background: linear-gradient(135deg, #d35400, #e67e22);
}

.redeem-result {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85em;
}

.redeem-result.success {
  background: rgba(39, 174, 96, 0.2);
  border: 1px solid #27ae60;
  color: #2ecc71;
}

.redeem-result.error {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

/* 打坐按钮样式 */
.nav-btn.meditation {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.nav-btn.meditation:hover {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
}

/* 打坐面板样式 */
.meditation-panel {
  background: linear-gradient(180deg, #1a1a3a 0%, #2a2a4a 100%);
  border-radius: 12px;
  padding: 25px;
  width: 400px;
  max-width: 90vw;
  position: relative;
  border: 2px solid #9b59b6;
  box-shadow: 0 0 30px rgba(155, 89, 182, 0.3);
}

.meditation-panel h3 {
  color: #dda0dd;
  margin-bottom: 20px;
  font-size: 1.3em;
  text-align: center;
}

.meditation-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.realm-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.current-realm, .next-realm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.realm-display .label {
  color: #888;
  font-size: 0.85em;
}

.realm-display .value {
  color: #ffd700;
  font-size: 1.2em;
  font-weight: bold;
}

.realm-display .arrow {
  color: #9b59b6;
  font-size: 1.5em;
}

.exp-progress {
  background: #1a1a2e;
  padding: 15px;
  border-radius: 8px;
}

.exp-label {
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 0.9em;
  margin-bottom: 8px;
}

.exp-bar {
  height: 12px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #9b59b6, #e74c3c);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.success-rate {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #1a1a2e;
  border-radius: 8px;
}

.success-rate .label {
  color: #888;
}

.success-rate .value {
  font-size: 1.3em;
  font-weight: bold;
}

.success-rate .value.high {
  color: #2ecc71;
}

.success-rate .value.medium {
  color: #f39c12;
}

.success-rate .value.low {
  color: #e74c3c;
}

.breakthrough-tips {
  text-align: center;
  padding: 10px;
}

.breakthrough-tips p {
  color: #888;
  font-size: 0.85em;
  margin: 5px 0;
}

.breakthrough-tips .warning {
  color: #e74c3c;
}

.breakthrough-result {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  font-size: 1em;
  margin-bottom: 10px;
}

.breakthrough-result.success {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid #2ecc71;
  color: #2ecc71;
}

.breakthrough-result.fail {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.breakthrough-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.breakthrough-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(155, 89, 182, 0.5);
}

.breakthrough-btn:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}

/* 修炼类型显示 */
.cultivation-type-display {
  text-align: center;
  padding: 10px;
  background: #1a1a2e;
  border-radius: 8px;
}

.type-label {
  color: #888;
  margin-right: 10px;
}

.type-value {
  font-size: 1.2em;
  font-weight: bold;
}

.type-value.xian {
  color: #87ceeb;
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}

.type-value.mo {
  color: #e74c3c;
  text-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

/* 修炼类型选择 */
.cultivation-choice {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #ffd700;
}

.cultivation-choice h4 {
  color: #ffd700;
  text-align: center;
  margin: 0 0 10px 0;
  font-size: 1.1em;
}

.choice-warning {
  color: #e74c3c;
  text-align: center;
  font-size: 0.85em;
  margin-bottom: 15px;
}

.choice-options {
  display: flex;
  gap: 15px;
}

.choice-option {
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.choice-option.xian {
  background: linear-gradient(135deg, #1a3a5a, #2a5a8a);
  border: 2px solid #87ceeb;
}

.choice-option.xian:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(135, 206, 235, 0.5);
}

.choice-option.mo {
  background: linear-gradient(135deg, #3a1a1a, #5a2a2a);
  border: 2px solid #e74c3c;
}

.choice-option.mo:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
}

.choice-title {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 5px;
}

.choice-option.xian .choice-title {
  color: #87ceeb;
}

.choice-option.mo .choice-title {
  color: #e74c3c;
}

.choice-desc {
  color: #aaa;
  font-size: 0.85em;
  margin-bottom: 10px;
}

.choice-stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 10px;
}

.choice-stats span {
  color: #2ecc71;
  font-size: 0.8em;
}

.choice-feature {
  color: #ffd700;
  font-size: 0.85em;
  font-style: italic;
}

/* 图鉴按钮样式 */
.nav-btn.guide {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.nav-btn.guide:hover {
  background: linear-gradient(135deg, #d35400, #e67e22);
}

/* 图鉴面板样式 */
.guide-panel {
  background: linear-gradient(180deg, #1a1a3a 0%, #2a2a4a 100%);
  border-radius: 12px;
  padding: 20px;
  width: 600px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  border: 2px solid #e67e22;
  box-shadow: 0 0 30px rgba(230, 126, 34, 0.3);
}

.guide-panel h3 {
  color: #ffd700;
  margin-bottom: 15px;
  font-size: 1.3em;
  text-align: center;
}

.guide-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #4a4a6a;
  padding-bottom: 10px;
}

.guide-tabs button {
  flex: 1;
  padding: 8px 12px;
  background: #2a2a4a;
  border: 1px solid #4a4a6a;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
}

.guide-tabs button.active {
  background: #e67e22;
  color: white;
  border-color: #e67e22;
}

.guide-tabs button:hover:not(.active) {
  background: #3a3a5a;
  color: #ccc;
}

.guide-content {
  max-height: 55vh;
  overflow-y: auto;
}

.guide-section {
  padding: 10px 0;
}

/* 套装样式 */
.set-item {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #3a3a5a;
}

.set-header {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 5px;
}

.set-desc {
  color: #888;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.set-pieces {
  color: #87ceeb;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.set-bonuses {
  background: #2a2a4a;
  border-radius: 4px;
  padding: 8px;
}

.bonus-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 0.85em;
}

.bonus-row:last-child {
  margin-bottom: 0;
}

.bonus-count {
  color: #ffd700;
  min-width: 50px;
}

.bonus-desc {
  color: #2ecc71;
}

/* 锁妖塔掉落样式 */
.tower-info {
  background: #2a2a4a;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.tower-tip {
  color: #87ceeb;
  margin: 0;
  font-size: 0.9em;
  text-align: center;
}

.tower-drops {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drop-item {
  display: flex;
  gap: 15px;
  padding: 10px;
  background: #1a1a2e;
  border-radius: 6px;
  border-left: 3px solid #e67e22;
}

.drop-floor {
  color: #ffd700;
  font-weight: bold;
  min-width: 80px;
}

.drop-reward {
  color: #ccc;
  font-size: 0.9em;
}

/* 宠物介绍样式 */
.pets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pet-info-item {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #3a3a5a;
}

.pet-info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.pet-info-header .pet-icon {
  font-size: 1.5em;
}

.pet-info-header .pet-name {
  font-weight: bold;
  color: #fff;
  font-size: 1em;
}

.pet-info-header .pet-role {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-left: auto;
}

.pet-role.attacker {
  background: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

.pet-role.defender {
  background: rgba(52, 152, 219, 0.3);
  color: #3498db;
}

.pet-role.support {
  background: rgba(46, 204, 113, 0.3);
  color: #2ecc71;
}

.pet-role.balanced {
  background: rgba(155, 89, 182, 0.3);
  color: #9b59b6;
}

.pet-info-skills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.skills-label {
  color: #87ceeb;
  font-size: 0.85em;
}

.skill-tag {
  background: #4a2a6a;
  color: #d8b4fe;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.pet-info-hidden {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
}

.hidden-label {
  color: #f39c12;
}

.hidden-skill {
  color: #e67e22;
  font-weight: bold;
}

.hidden-tip {
  color: #666;
  font-size: 0.8em;
}

/* 宠物技能样式 */
.skill-category h4 {
  color: #ffd700;
  margin: 0 0 12px 0;
  font-size: 1em;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-info-item {
  background: #1a1a2e;
  border-radius: 6px;
  padding: 10px;
  border-left: 3px solid #888;
}

.skill-info-item.tier-1 {
  border-left-color: #888;
}

.skill-info-item.tier-2 {
  border-left-color: #3498db;
}

.skill-info-item.tier-3 {
  border-left-color: #9b59b6;
}

.skill-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.skill-info-header .skill-type-tag {
  font-size: 0.75em;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 6px;
}

.skill-info-header .skill-type-tag.active {
  background: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

.skill-info-header .skill-type-tag.passive {
  background: rgba(46, 204, 113, 0.3);
  color: #2ecc71;
}

.skill-info-header .skill-name {
  font-weight: bold;
  color: #fff;
  flex: 1;
}

.skill-info-header .skill-tier {
  font-size: 0.8em;
  padding: 2px 8px;
  border-radius: 4px;
  background: #2a2a4a;
}

.skill-info-item.tier-1 .skill-tier {
  color: #888;
}

.skill-info-item.tier-2 .skill-tier {
  color: #3498db;
}

.skill-info-item.tier-3 .skill-tier {
  color: #9b59b6;
}

.skill-info-desc {
  color: #aaa;
  font-size: 0.85em;
}

/* 图鉴通用样式 */
.section-title {
  color: #ffd700;
  font-size: 1em;
  margin: 15px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #3a3a5a;
}

.section-title:first-child {
  margin-top: 0;
}

/* 锁妖塔特殊机制 */
.tower-special {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.special-item {
  display: flex;
  gap: 15px;
  padding: 10px;
  background: #2a1a1a;
  border-radius: 6px;
  border-left: 3px solid #e74c3c;
}

.special-floor {
  color: #e74c3c;
  font-weight: bold;
  min-width: 80px;
}

.special-desc {
  color: #ccc;
  font-size: 0.9em;
}

.debuff-text {
  color: #e74c3c;
  font-weight: bold;
}

/* 法宝品质样式 */
.artifact-qualities {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quality-item {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #3a3a5a;
}

.quality-header {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 8px;
}

.quality-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #aaa;
  font-size: 0.9em;
}

.quality-requirements {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.req-item {
  padding: 8px 12px;
  background: #1a1a2e;
  border-radius: 6px;
  font-size: 0.9em;
  color: #ccc;
}

.req-quality {
  font-weight: bold;
}

.artifact-exp-info {
  background: #1a1a2e;
  padding: 12px;
  border-radius: 8px;
}

.artifact-exp-info p {
  margin: 0 0 10px 0;
  color: #87ceeb;
}

.exp-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #aaa;
  font-size: 0.9em;
}

/* 材料样式 */
.materials-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.material-item {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #3a3a5a;
}

.material-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.material-icon {
  font-size: 1.2em;
}

.material-name {
  font-weight: bold;
}

.material-grade {
  margin-left: auto;
  font-size: 0.8em;
}

.material-drop {
  color: #888;
  font-size: 0.85em;
}

.drop-rates {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.rate-item {
  background: #1a1a2e;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 0.9em;
  color: #ccc;
}

.rate-grade {
  font-weight: bold;
}

/* 境界样式 */
.cultivation-paths {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.path-item {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 15px;
  border: 2px solid #3a3a5a;
}

.path-item.xian-path {
  border-color: #3498db;
}

.path-item.mo-path {
  border-color: #e74c3c;
}

.path-header {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 10px;
  text-align: center;
}

.xian-path .path-header {
  color: #3498db;
}

.mo-path .path-header {
  color: #e74c3c;
}

.path-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #2ecc71;
  font-size: 0.9em;
}

.path-desc {
  color: #888;
  font-size: 0.85em;
  text-align: center;
}

.realms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.realm-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #1a1a2e;
  border-radius: 6px;
  font-size: 0.9em;
}

.realm-name {
  color: #ffd700;
}

.realm-level {
  color: #2ecc71;
}

.realm-exp {
  color: #888;
}

.breakthrough-info {
  background: #1a1a2e;
  padding: 12px;
  border-radius: 8px;
}

.breakthrough-info p {
  margin: 5px 0;
  color: #ccc;
  font-size: 0.9em;
}

.breakthrough-info .warning-text {
  color: #e74c3c;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    padding: 10px 15px;
    gap: 10px;
  }

  .nav-brand h1 {
    font-size: 1.3em;
  }

  .subtitle {
    display: none;
  }

  .nav-info {
    order: 3;
    width: 100%;
    justify-content: space-around;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 8px;
    border-top: 1px solid #3a3a5a;
  }

  .info-item {
    min-width: 50px;
  }

  .info-item .label {
    font-size: 0.7em;
  }

  .info-item .value {
    font-size: 0.9em;
  }

  .info-item .value.skill,
  .info-item .value.pet {
    font-size: 0.75em;
  }

  .nav-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .nav-btn {
    padding: 6px 10px;
    font-size: 0.75em;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 8px 10px;
    gap: 8px;
  }

  .nav-brand {
    gap: 5px;
  }

  .nav-brand h1 {
    font-size: 1.1em;
  }

  .nav-info {
    gap: 5px;
    padding-top: 6px;
  }

  .info-item {
    min-width: 45px;
  }

  .info-item .label {
    font-size: 0.65em;
  }

  .info-item .value {
    font-size: 0.8em;
  }

  .info-item .value.skill,
  .info-item .value.pet {
    font-size: 0.65em;
  }

  .nav-actions {
    gap: 4px;
  }

  .nav-btn {
    padding: 5px 8px;
    font-size: 0.7em;
  }

  /* 隐藏部分按钮，在极窄屏幕下 */
  .nav-btn.guide,
  .nav-btn.dev {
    display: none;
  }

  /* 弹窗适配 */
  .settings-panel {
    min-width: 280px;
    max-width: 95vw;
    padding: 15px;
    max-height: 85vh;
    overflow-y: auto;
  }

  .meditation-panel {
    width: 95vw;
    padding: 15px;
  }

  .guide-panel {
    width: 95vw;
    padding: 15px;
  }

  .guide-tabs {
    flex-wrap: wrap;
  }

  .guide-tabs button {
    flex: 1 1 45%;
    font-size: 0.8em;
    padding: 6px 8px;
  }

  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  /* 修炼选择适配 */
  .choice-options {
    flex-direction: column;
  }

  .choice-option {
    padding: 12px;
  }

  .choice-title {
    font-size: 1.1em;
  }

  .choice-stats span {
    font-size: 0.75em;
  }

  .choice-feature {
    font-size: 0.8em;
  }
}
</style>
