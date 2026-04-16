# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 项目概述

Electron 桌面应用，用于批量图片格式转换和压缩（JPG、JPEG、PNG、WebP）。技术栈为 Vue 3 + TypeScript + Vite，使用 `sharp`（libvips 原生绑定）进行图像处理。界面为中文。

## 常用命令

```bash
npm run dev          # 启动开发服务器（Vite + Electron）
npm run build        # 类型检查 (vue-tsc) → 打包 (vite build) → 构建安装包 (electron-builder)
npm run preview      # 预览生产构建
npm run postinstall  # 为 Electron 重新编译原生依赖（npm install 后自动执行）
```

项目未配置测试运行器或 lint 脚本。

## 架构

采用双进程 Electron 架构，通过 IPC 通信：

**主进程**（`electron/`）
- `main.ts` — 应用入口：创建 BrowserWindow、注册 Sharp 二进制路径、设置 IPC
- `preload.ts` — contextBridge，向渲染进程暴露 `ipcRenderer`（on/off/send/invoke）
- `src/index.ts` — IPC 处理器（`open:dialog`）：弹出文件/目录选择器，编排转换流程
- `src/converterImage.ts` — 核心逻辑：基于 sharp 的格式转换与质量压缩
- `src/sharpPaths.ts` — 解析平台相关的 sharp 原生二进制路径（开发与生产环境）

**渲染进程**（`src/`）
- `main.ts` — Vue 应用启动，加载 Element Plus
- `App.vue` — 单文件界面：格式选择、质量选择、文件/目录选择器、结果展示
- 通过 `window.ipcRenderer.invoke('open:dialog', ...)` 与主进程通信

**数据流：** App.vue → preload 桥接 → IPC `open:dialog` 处理器 → sharp 转换 → 结果返回渲染进程

## 关键技术细节

- **Sharp 原生二进制**需要特殊处理：从 Vite 打包中排除（vite 配置中的 `external`）、ASAR 解包、作为 `extraResources` 打入 electron-builder 安装包。平台相关路径通过 `sharpPaths.ts` 中的环境变量注册。
- **Element Plus** 组件通过 `unplugin-vue-components` 和 `unplugin-auto-import` 自动导入（生成 `components.d.ts` 和 `auto-imports.d.ts`）。
- **ESLint** 使用 `@antfu/eslint-config`，启用 Vue 支持（`no-console` 已关闭）。
- **CI/CD**（`.github/workflows/build.yml`）：由 `v*` 标签触发，在 Windows/macOS/Linux 上构建（Node 20），自动创建 GitHub Release。
- **electron-builder.json5** 定义打包配置：Mac（DMG）、Windows（NSIS）、Linux（AppImage），输出目录为 `release/{version}/`。

## 包管理器
- 安装依赖必须使用 npm，禁止使用 yarn 和 pnpm
