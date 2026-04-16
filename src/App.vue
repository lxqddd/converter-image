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

interface ConvertResult {
  success: boolean
  message?: string[]
  error?: string
}

interface DirectoryResult {
  outputDir: string
  results: ConvertResult[]
}

const fileResult = ref<ConvertResult | null>(null)
const dirResults = ref<DirectoryResult[]>([])

async function handleSelect(type: 'file' | 'directory') {
  transformData.value.type = type
  fileResult.value = null
  dirResults.value = []
  const res = await window.ipcRenderer.invoke('open:dialog', transformData.value.targetType, transformData.value.compressQuality, transformData.value.type)
  if (!res) {
    ElMessage.error('取消选择')
    return
  }
  if (type === 'file') {
    if (res.success) {
      ElMessage.success('处理完成')
      fileResult.value = res
    }
    else {
      ElMessage.error(`处理失败: ${res.error ?? '未知错误'}`)
    }
  }
  else {
    if (Array.isArray(res) && res.length > 0) {
      ElMessage.success('处理完成')
      dirResults.value = res
    }
    else {
      ElMessage.error('处理失败')
    }
  }
}

// 自动更新相关
function handleUpdateDownloaded(_event: Electron.IpcRendererEvent, info: { version: string }) {
  ElMessageBox.confirm(
    `新版本 ${info.version} 已下载完成，需要重启应用以完成安装。是否立即重启？`,
    '发现新版本',
    {
      confirmButtonText: '立即重启',
      cancelButtonText: '稍后重启',
      type: 'success',
    },
  ).then(() => {
    window.ipcRenderer.invoke('update:install')
  }).catch(() => {
    ElMessage.info('将在您退出应用时自动安装更新')
  })
}

function handleUpdateError(_event: Electron.IpcRendererEvent, info: { message: string }) {
  console.error('Update error:', info.message)
}

onMounted(() => {
  window.ipcRenderer.on('update:downloaded', handleUpdateDownloaded)
  window.ipcRenderer.on('update:error', handleUpdateError)
})

onUnmounted(() => {
  window.ipcRenderer.off('update:downloaded', handleUpdateDownloaded)
  window.ipcRenderer.off('update:error', handleUpdateError)
})
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
    <div style="flex: 1; min-height: 0px; overflow-y: auto; font-size: 12px;">
      <template v-if="fileResult">
        <div v-for="item in fileResult.message" :key="item">
          {{ item }}
        </div>
        <div v-if="fileResult.error" style="color: red;">
          {{ fileResult.error }}
        </div>
      </template>
      <template v-else-if="dirResults.length">
        <div v-for="dir in dirResults" :key="dir.outputDir">
          <div>输出目录：{{ dir.outputDir }}</div>
          <div v-for="item in dir.results" :key="item.message?.[0] ?? item.error">
            {{ item.success ? item.message?.[0] : item.error }}
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
