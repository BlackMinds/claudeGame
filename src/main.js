import Vue from 'vue'
import App from './App.vue'
import { initSecurity } from './utils/security'

import './assets/main.css'

// 初始化安全防护
initSecurity()

new Vue({
  render: (h) => h(App)
}).$mount('#app')
