import Vue from 'vue'
import App from './App.vue'
import { initSecurity } from './utils/security'
import { devAddMaterials, toggleExpMultiplier, addTestEquipment } from './store/gameStore'

import './assets/main.css'

// 初始化安全防护
initSecurity()

// 开发环境暴露测试函数到全局
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.devAddMaterials = devAddMaterials
  window.toggleExpMultiplier = toggleExpMultiplier
  window.addTestEquipment = addTestEquipment
  console.log('开发模式：可用命令 - devAddMaterials("super"), toggleExpMultiplier(), addTestEquipment()')
}

new Vue({
  render: (h) => h(App)
}).$mount('#app')
