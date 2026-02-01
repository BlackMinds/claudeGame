// Preload script for Electron
// 这里可以安全地暴露一些 Node.js API 给渲染进程

const { contextBridge } = require('electron')

// 暴露一个安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true
})
