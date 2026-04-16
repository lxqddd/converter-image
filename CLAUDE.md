# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

基于 **Electron + Vue 3 + TypeScript + Vite** 构建的图片格式转换桌面应用。使用 `sharp` 库进行图像处理，`element-plus` 提供 UI 组件。支持 jpg/jpeg、png、webp 格式之间的相互转换，可配置压缩质量。

## 常用命令

- **开发**: `pnpm dev` — 启动 Vite 开发服务器及 Electron
- **构建**: `pnpm build` — 类型检查 (`vue-tsc`) → Vite 构建 → `electron-builder` 打包
- **代码检查**: `npx eslint .` — 使用 `@antfu/eslint-config`，已启用 Vue 支持
- **安装后处理**: `pnpm postinstall` — 执行 `electron-builder install-app-deps`（sharp 等原生模块必需）

## 架构

```
electron/main.ts          → Electron 主进程：创建窗口、注册 sharp 二进制文件、初始化 IPC
electron/preload.ts       → 通过 contextBridge 将 ipcRenderer 暴露给渲染进程
electron/src/
  index.ts                → IPC 处理：文件/目录选择对话框 + 批量图片转换调度
  converterImage.ts       → 核心 sharp 处理管线：格式转换，支持质量/背景色配置
  sharpPaths.ts           → 平台相关的 sharp 原生二进制文件路径解析（darwin/win32/linux, arm64/x64）
src/
  main.ts                 → Vue 应用入口，引入 element-plus 样式
  App.vue                 → 单文件 UI：格式选择、质量设置、文件/目录选择按钮、结果展示
```

### IPC 通信流程

1. 渲染进程 (`App.vue`) 调用 `window.ipcRenderer.invoke('open:dialog', targetType, quality, type)`
2. 主进程 (`electron/src/index.ts`) 处理 `open:dialog` → 打开系统文件/目录选择器
3. 单文件模式：`handleCoverImage()` → 在同目录下生成带 `-压缩` 后缀的文件
4. 目录模式：`handleCoverDirectory()` → 创建 `{dir}-压缩` 输出目录，递归转换所有图片
5. 转换结果（成功/失败及文件大小信息）返回渲染进程

### Sharp 原生二进制文件处理

`sharp` 依赖平台特定的原生二进制文件（如 `@img/sharp-darwin-arm64` 等）。生产构建中：
- 通过 `electron-builder.json5` 中的 `asarUnpack` 配置将二进制文件从 asar 包中解压
- 运行时通过 `registerSharpBinaries()` 设置环境变量（`SHARP_DARWIN_X64_PATH` 等）来定位路径
- 所有 sharp 平台包在 Vite 配置中已外部化，并通过 `extraResources` 打包

### 构建产物

构建后在 `release/{version}/` 目录下生成各平台安装包：
- **macOS**: DMG
- **Windows**: NSIS 安装程序 (x64)
- **Linux**: AppImage

## 核心依赖

- **sharp** — 图像处理（原生模块，需要特殊的构建处理）
- **element-plus** — Vue UI 组件库（通过 `unplugin-vue-components` 自动导入）
- **fs-extra** — 增强的文件系统操作，用于目录遍历和文件管理

## 注意事项

- `index.html` 中的应用标题为"图片压缩工具"；构建配置中的产品名为 "converter image"
- Element Plus 组件自动导入，Vue 文件中无需手动引入（参见 `components.d.ts`）
- TypeScript 已启用严格模式，包含 `noUnusedLocals` 和 `noUnusedParameters` 检查
