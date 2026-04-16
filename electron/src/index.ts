import path from 'node:path'
import { dialog, ipcMain } from 'electron'
import * as fs from 'fs-extra'
import { convertImageFormat } from './converterImage'

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'])
const VALID_TARGET_FORMATS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MIN_QUALITY = 1
const MAX_QUALITY = 100

function normalizeTargetFormat(targetFormat: string) {
  return targetFormat.startsWith('.') ? targetFormat : `.${targetFormat}`
}

function validateInputs(targetType: string, quality: number) {
  const format = normalizeTargetFormat(targetType)
  if (!VALID_TARGET_FORMATS.has(format)) {
    throw new Error(`不支持的目标格式: ${format}`)
  }
  if (!Number.isInteger(quality) || quality < MIN_QUALITY || quality > MAX_QUALITY) {
    throw new Error(`质量参数无效: ${quality}，有效范围 ${MIN_QUALITY}-${MAX_QUALITY}`)
  }
  return format
}

async function handleCoverImage(filePath: string, type: string, quality: number) {
  const targetFormat = validateInputs(type, quality)
  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const filenameWithoutExt = path.basename(filePath, ext)
  const outputPath = path.join(dir, `${filenameWithoutExt}-压缩${targetFormat}`)
  return await convertImageFormat(filePath, outputPath, targetFormat, {
    backgroundColor: { r: 255, g: 255, b: 255 },
    quality,
  })
}

async function compressDirectory(sourceDir: string, targetFormat: string, quality: number) {
  const normalizedFormat = normalizeTargetFormat(targetFormat)
  const outputDir = `${sourceDir}-压缩`

  const results: { success: boolean, message?: string[], error?: string }[] = []

  async function traverse(currentSourceDir: string, currentOutputDir: string) {
    const entries = await fs.readdir(currentSourceDir)
    const tasks: Promise<void>[] = []
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
      tasks.push(
        convertImageFormat(sourcePath, imageOutputPath, normalizedFormat, {
          backgroundColor: { r: 255, g: 255, b: 255 },
          quality,
        }).then((result) => { results.push(result) }),
      )
    }
    await Promise.all(tasks)
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
    try {
      validateInputs(targetType, compressQuality)
    }
    catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '参数错误' }
    }

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
