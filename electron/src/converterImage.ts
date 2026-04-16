import path from 'node:path'
import * as fs from 'fs-extra'
import sharp from 'sharp'

/**
 * 支持的输入图片格式
 */
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff']

/**
 * 支持的输出图片格式
 */
const ALLOWED_OUTPUT_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']

/**
 * 转换单张图片格式
 */
export async function convertImageFormat(inputPath: string, outputPath: string, targetFormat: string, options: { backgroundColor?: { r: number, g: number, b: number }, quality?: number } = {}) {
  try {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`文件不存在: ${inputPath}`)
    }
    const inputExt = path.extname(inputPath).toLowerCase()
    if (!SUPPORTED_FORMATS.includes(inputExt)) {
      throw new Error(`不支持的输入格式: ${inputExt}`)
    }
    const outputExt = path.extname(outputPath).toLowerCase()
    if (!ALLOWED_OUTPUT_FORMATS.includes(outputExt)) {
      throw new Error(`不支持的输出格式: ${outputExt}`)
    }

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    await fs.ensureDir(outputDir)

    let pipeline = sharp(inputPath)
    if (targetFormat === '.jpg' || targetFormat === '.jpeg') {
      pipeline = pipeline.flatten({
        background: options.backgroundColor ?? { r: 255, g: 255, b: 255 },
      })
    }
    switch (targetFormat) {
      case '.jpg':
      case '.jpeg':
        pipeline = pipeline.jpeg({ quality: options.quality ?? 90, mozjpeg: true })
        break
      case '.png':
        pipeline = pipeline.png({ compressionLevel: Math.round((100 - (options.quality ?? 90)) / 100 * 9) })
        break
      case '.webp':
        pipeline = pipeline.webp({ quality: options.quality ?? 90 })
        break
    }
    await pipeline.toFile(outputPath)

    const inputSize = (await fs.stat(inputPath)).size / 1024
    const outputSize = (await fs.stat(outputPath)).size / 1024

    return { success: true, message: [`转换成功 ${outputPath} 原始大小: ${inputSize.toFixed(2)} KB -> 转换后大小: ${outputSize.toFixed(2)} KB`] }
  }
  catch (error) {
    console.error(`转换失败 ${path.basename(inputPath)}: ${error instanceof Error ? error.message : '未知错误'}`)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}
