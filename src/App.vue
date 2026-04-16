<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, onUnmounted, ref } from 'vue'

const targetTypeArr = ['.jpg', '.jpeg', '.png', '.webp']
const compressQualityArr = [50, 60, 70, 80, 90]

const transformData = ref({
  targetType: '.jpg',
  compressQuality: 90,
  type: 'file',
})

const resultData = ref<any>([])
async function handleSelect(type: 'file' | 'directory') {
  transformData.value.type = type
  const res = await window.ipcRenderer.invoke('open:dialog', transformData.value.targetType, transformData.value.compressQuality, transformData.value.type)
  if (!res) {
    ElMessage.error('取消选择')
    return
  }
  if (res.success || (res.length && res[0].outputDir)) {
    ElMessage.success('处理完成')
    resultData.value = res
  }
  else {
    ElMessage.error('处理失败')
  }
}

// ========== 自动更新 ==========
const downloadPercent = ref(0)
const downloading = ref(false)
const updateDownloaded = ref(false)
const isNewVersion = ref(false)

function onDownloadProgress(_event: any, info: { percent: number }) {
  downloadPercent.value = info.percent
}
function onDownloaded() {
  downloading.value = false
  updateDownloaded.value = true
}

onMounted(() => {
  window.ipcRenderer.on('updater:download-progress', onDownloadProgress)
  window.ipcRenderer.on('updater:downloaded', onDownloaded)
  checkForUpdate()
})

onUnmounted(() => {
  window.ipcRenderer.off('updater:download-progress', onDownloadProgress)
  window.ipcRenderer.off('updater:downloaded', onDownloaded)
})

async function checkForUpdate() {
  const res: any = await window.ipcRenderer.invoke('updater:check')
  if (!res.hasUpdate)
    return

  isNewVersion.value = true
  try {
    await ElMessageBox.confirm(
      `发现新版本 v${res.version}，是否立即下载更新？`,
      '更新提示',
      { confirmButtonText: '立即更新', cancelButtonText: '稍后', type: 'info' },
    )
    startDownload()
  }
  catch {
    // 用户点击稍后
  }
}

async function startDownload() {
  downloading.value = true
  downloadPercent.value = 0
  const res: any = await window.ipcRenderer.invoke('updater:download')
  if (res.success) {
    ElMessage.success('下载完成，点击"重启安装"完成更新')
  }
  else {
    downloading.value = false
    ElMessage.error(`下载失败: ${res.error}`)
  }
}

async function installUpdate() {
  await window.ipcRenderer.invoke('updater:install')
}
</script>

<template>
  <div style="display: flex; flex-direction: column;">
    <div>
      <el-form>
        <el-form-item label="目标类型" prop="targetType">
          <el-radio-group v-model="transformData.targetType">
            <el-radio v-for="item in targetTypeArr" :key="item" :label="item" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="压缩质量" prop="compressQuality">
          <el-radio-group v-model="transformData.compressQuality">
            <el-radio v-for="item in compressQualityArr" :key="item" :label="item" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div>
        <el-button type="primary" @click="handleSelect('file')">
          选择图片
        </el-button>
        <el-button type="primary" @click="handleSelect('directory')">
          选择目录
        </el-button>
      </div>
    </div>

    <!-- 更新进度 -->
    <div v-if="downloading" style="padding: 12px 0;">
      <div style="font-size: 13px; margin-bottom: 6px;">
        正在下载更新... {{ downloadPercent }}%
      </div>
      <el-progress :percentage="downloadPercent" :stroke-width="8" />
    </div>

    <!-- 下载完成，等待安装 -->
    <div v-if="updateDownloaded" style="padding: 12px 0;">
      <el-button type="success" @click="installUpdate">
        重启安装
      </el-button>
    </div>

    <div style="flex: 1; min-height: 0px; overflow-y: auto; font-size: 12px;">
      <template v-if="resultData.success">
        <div v-for="item in resultData.message" :key="item">
          {{ item }}
        </div>
      </template>
      <template v-else-if="resultData.length">
        <div v-for="dir in resultData" :key="dir.outputDir">
          <div>输出目录：{{ dir.outputDir }}</div>
          <div v-for="item in dir.results" :key="item.message[0]">
            {{ item.success ? item.message[0] : item.error }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
