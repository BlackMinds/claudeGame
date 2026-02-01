const { app, BrowserWindow } = require('electron')
const path = require('path')

// 禁用硬件加速（可选，某些系统上可以提高稳定性）
// app.disableHardwareAcceleration()

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,  // 禁用后台节流，保证最小化时挂机正常
      preload: path.join(__dirname, 'preload.js')
    },
    title: '修仙物语',
    autoHideMenuBar: true
  })

  // 开发模式下连接 Vite 开发服务器
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // 生产模式下加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
