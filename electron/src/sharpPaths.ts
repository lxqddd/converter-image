import path from 'node:path'

const PLATFORM_BINARIES: Record<string, { envVar: string, filename: string }[]> = {
  darwin: [
    { envVar: 'SHARP_DARWIN_X64_PATH', filename: 'sharp-darwin-x64.node' },
    { envVar: 'SHARP_DARWIN_ARM64_PATH', filename: 'sharp-darwin-arm64.node' },
  ],
  win32: [
    { envVar: 'SHARP_WIN32_X64_PATH', filename: 'sharp-win32-x64.node' },
  ],
  linux: [
    { envVar: 'SHARP_LINUX_X64_PATH', filename: 'sharp-linux-x64.node' },
    { envVar: 'SHARP_LINUX_ARM64_PATH', filename: 'sharp-linux-arm64.node' },
  ],
}

function createBinaryRoot() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (isDevelopment) {
    return path.join(process.cwd(), 'node_modules/sharp/build/Release')
  }
  return path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'sharp', 'build', 'Release')
}

export function registerSharpBinaries() {
  const entries = PLATFORM_BINARIES[process.platform]
  if (!entries) {
    return
  }

  const binaryRoot = createBinaryRoot()
  for (const { envVar, filename } of entries) {
    process.env[envVar] = path.join(binaryRoot, filename)
  }
}

