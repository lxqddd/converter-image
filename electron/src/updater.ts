import { BrowserWindow, ipcMain } from 'electron'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

export function setupUpdater() {
  // 检查更新
  ipcMain.handle('updater:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      if (!result) {
        return { hasUpdate: false }
      }
      return {
        hasUpdate: true,
        version: result.updateInfo.version,
        releaseNotes: result.updateInfo.releaseNotes,
      }
    }
    catch (error) {
      return { hasUpdate: false, error: error instanceof Error ? error.message : '检查更新失败' }
    }
  })

  // 下载更新
  ipcMain.handle('updater:download', () => {
    return new Promise((resolve) => {
      autoUpdater.downloadUpdate()
      autoUpdater.on('download-progress', (progressInfo) => {
        sendToRenderer('updater:download-progress', {
          percent: Math.round(progressInfo.percent),
          bytesPerSecond: progressInfo.bytesPerSecond,
          transferred: progressInfo.transferred,
          total: progressInfo.total,
        })
      })
      autoUpdater.on('update-downloaded', () => {
        sendToRenderer('updater:downloaded')
        resolve({ success: true })
      })
      autoUpdater.on('error', (error) => {
        resolve({ success: false, error: error?.message ?? '下载失败' })
      })
    })
  })

  // 安装更新（退出并重启）
  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall()
  })
}

function sendToRenderer(channel: string, ...args: any[]) {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send(channel, ...args)
  }
}
