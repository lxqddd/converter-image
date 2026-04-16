import type { BrowserWindow } from 'electron'
import { app, ipcMain } from 'electron'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

let mainWindow: BrowserWindow | null = null

export function initUpdater(win: BrowserWindow) {
  mainWindow = win

  // 开发环境跳过更新检查
  if (!app.isPackaged) {
    console.log('[Updater] 开发环境，跳过自动更新')
    return
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowDowngrade = false
  autoUpdater.allowPrerelease = false

  // 事件监听
  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('update:checking')
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update:available', { version: info.version })
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update:progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update:downloaded', { version: info.version })
  })

  autoUpdater.on('error', (error: Error) => {
    mainWindow?.webContents.send('update:error', { message: error.message })
  })

  // 注册 IPC handlers
  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  ipcMain.handle('update:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return {
        available: result?.updateInfo.version !== app.getVersion(),
        version: result?.updateInfo.version,
      }
    }
    catch (error) {
      return { available: false, error: (error as Error).message }
    }
  })

  // 延迟 3 秒后首次检查更新
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[Updater] 检查更新失败:', err)
    })
  }, 3000)
}
