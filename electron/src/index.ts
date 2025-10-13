import path from 'node:path'
import { dialog, ipcMain } from 'electron'
import * as fs from 'fs-extra'
import { convertImageFormat } from './converterImage'

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'])

function normalizeTargetFormat(targetFormat: string) {
  return targetFormat.startsWith('.') ? targetFormat : `.${targetFormat}`
}

async function handleCoverImage(filePath: string, type: string, quality: number) {
  const targetFormat = normalizeTargetFormat(type)
  const basename = path.dirname(filePath)
  const name = path.extname(filePath)
  const filenameWithoutExt = path.basename(filePath, name)
  const outputPath = path.join(basename, `${filenameWithoutExt}-压缩${targetFormat}`)
  return await convertImageFormat(filePath, outputPath, targetFormat, {
    backgroundColor: { r: 255, g: 255, b: 255 },
    quality,
  })
}

async function compressDirectory(sourceDir: string, targetFormat: string, quality: number) {
  const normalizedFormat = normalizeTargetFormat(targetFormat)
  const outputDir = `${sourceDir}-压缩`
  if (await fs.pathExists(outputDir)) {
    await fs.remove(outputDir)
  }
  await fs.ensureDir(outputDir)

  const results: { success: boolean, message?: string[], error?: string }[] = []

  async function traverse(currentSourceDir: string, currentOutputDir: string) {
    const entries = await fs.readdir(currentSourceDir)
    for (const entry of entries) {
      const sourcePath = path.join(currentSourceDir, entry)
      const stat = await fs.stat(sourcePath)
      const destinationPath = path.join(currentOutputDir, entry)
      if (stat.isDirectory()) {
        await fs.ensureDir(destinationPath)
        await traverse(sourcePath, destinationPath)
        continue
      }

      const ext = path.extname(sourcePath).toLowerCase()
      if (!SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
        await fs.copy(sourcePath, destinationPath)
        continue
      }

      const fileBaseName = path.basename(sourcePath, ext)
      const imageOutputPath = path.join(currentOutputDir, `${fileBaseName}${normalizedFormat}`)
      const convertResult = await convertImageFormat(sourcePath, imageOutputPath, normalizedFormat, {
        backgroundColor: { r: 255, g: 255, b: 255 },
        quality,
      })
      results.push(convertResult)
    }
  }

  await traverse(sourceDir, outputDir)
  return { outputDir, results }
}

async function handleCoverDirectory(filePaths: string[], type: string, quality: number) {
  const tasks = []
  for (const filePath of filePaths) {
    tasks.push(compressDirectory(filePath, type, quality))
  }
  const outputs = await Promise.all(tasks)
  return outputs
}

export function handleOpenDialog() {
  ipcMain.handle('open:dialog', async (_event, targetType: string, compressQuality: number, type: 'file' | 'directory') => {
    const res = await dialog.showOpenDialog({
      properties: type === 'file' ? ['openFile'] : ['openDirectory'],
    })
    if (res.canceled) {
      return false
    }
    if (type === 'file') {
      return await handleCoverImage(res.filePaths[0], targetType, compressQuality)
    }
    const result = await handleCoverDirectory(res.filePaths, targetType, compressQuality)
    return result
  })
}
