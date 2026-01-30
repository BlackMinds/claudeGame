// 安全防护模块

// 简单哈希函数
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// 计算数据校验和
export function calculateChecksum(data) {
  const key = 'xiuxian_integrity_2024'
  const str = JSON.stringify({
    level: data.level,
    gold: data.gold,
    exp: data.exp,
    realmId: data.realmId,
    realmExp: data.realmExp
  }) + key
  return simpleHash(str)
}

// 验证数据校验和
export function verifyChecksum(data, checksum) {
  return calculateChecksum(data) === checksum
}

// 数值合理性检查
export function validatePlayerData(player) {
  const errors = []

  // 等级检查 (1-60)
  if (player.level < 1 || player.level > 60) {
    errors.push('等级异常')
  }

  // 金币检查 (不能为负，上限1亿)
  if (player.gold < 0 || player.gold > 100000000) {
    errors.push('灵石异常')
  }

  // 经验检查 (不能为负)
  if (player.exp < 0 || player.realmExp < 0) {
    errors.push('经验异常')
  }

  // 境界检查 (1-9)
  if (player.realmId < 1 || player.realmId > 9) {
    errors.push('境界异常')
  }

  // 基础属性检查
  const maxBaseHp = 150 + 60 * 10 + 9 * 50 + 1000 // 基础+等级+境界+容错
  const maxBaseAtk = 15 + 60 * 3 + 9 * 15 + 500
  const maxBaseDef = 8 + 60 * 2 + 9 * 10 + 300

  if (player.baseHp < 100 || player.baseHp > maxBaseHp) {
    errors.push('生命值异常')
  }
  if (player.baseAttack < 10 || player.baseAttack > maxBaseAtk) {
    errors.push('攻击力异常')
  }
  if (player.baseDefense < 5 || player.baseDefense > maxBaseDef) {
    errors.push('防御力异常')
  }

  // 暴击率检查 (0-100)
  if (player.critRate < 0 || player.critRate > 100) {
    errors.push('暴击率异常')
  }

  // 背包检查 (最多50)
  if (player.inventory && player.inventory.length > 50) {
    errors.push('背包异常')
  }

  // 技能数量检查
  if (player.equippedActiveSkills && player.equippedActiveSkills.length > 4) {
    errors.push('主动技能数量异常')
  }
  if (player.equippedPassiveSkills && player.equippedPassiveSkills.length > 2) {
    errors.push('被动技能数量异常')
  }

  // 装备强化等级检查 (0-10)
  if (player.equipment) {
    for (const [slot, item] of Object.entries(player.equipment)) {
      if (item && item.enhanceLevel !== undefined) {
        if (item.enhanceLevel < 0 || item.enhanceLevel > 10) {
          errors.push(`${slot}强化等级异常`)
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 检测开发者工具
let devToolsOpen = false
let devToolsCheckInterval = null

function detectDevTools() {
  const threshold = 160
  const widthThreshold = window.outerWidth - window.innerWidth > threshold
  const heightThreshold = window.outerHeight - window.innerHeight > threshold

  if (widthThreshold || heightThreshold) {
    if (!devToolsOpen) {
      devToolsOpen = true
      onDevToolsOpen()
    }
  } else {
    devToolsOpen = false
  }
}

function onDevToolsOpen() {
  console.clear()
  console.log('%c警告！', 'color: red; font-size: 50px; font-weight: bold;')
  console.log('%c检测到开发者工具，修改数据可能导致存档损坏！', 'color: orange; font-size: 20px;')
}

// 禁用快捷键
function disableDevToolsShortcuts(e) {
  // F12
  if (e.keyCode === 123) {
    e.preventDefault()
    return false
  }
  // Ctrl+Shift+I (开发者工具)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
    e.preventDefault()
    return false
  }
  // Ctrl+Shift+J (控制台)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
    e.preventDefault()
    return false
  }
  // Ctrl+Shift+C (检查元素)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    e.preventDefault()
    return false
  }
  // Ctrl+U (查看源代码)
  if (e.ctrlKey && e.keyCode === 85) {
    e.preventDefault()
    return false
  }
}

// 禁用右键菜单
function disableContextMenu(e) {
  e.preventDefault()
  return false
}

// 初始化安全防护
export function initSecurity() {
  // 禁用快捷键
  document.addEventListener('keydown', disableDevToolsShortcuts)

  // 禁用右键
  document.addEventListener('contextmenu', disableContextMenu)

  // 定期检测开发者工具
  devToolsCheckInterval = setInterval(detectDevTools, 1000)

  // 控制台警告
  console.clear()
  console.log('%c修仙传', 'color: gold; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 4px #000;')
  console.log('%c警告：修改游戏数据可能导致存档损坏！', 'color: red; font-size: 16px;')

  // 防止通过控制台直接访问
  try {
    Object.defineProperty(window, 'gameState', {
      get: function() {
        console.log('%c检测到非法访问！', 'color: red; font-size: 20px;')
        return undefined
      },
      set: function() {
        console.log('%c检测到非法修改！', 'color: red; font-size: 20px;')
        return false
      }
    })
  } catch (e) {
    // 忽略错误
  }
}

// 清理安全防护（用于开发模式）
export function cleanupSecurity() {
  document.removeEventListener('keydown', disableDevToolsShortcuts)
  document.removeEventListener('contextmenu', disableContextMenu)
  if (devToolsCheckInterval) {
    clearInterval(devToolsCheckInterval)
  }
}
