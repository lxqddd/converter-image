<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

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
  console.log(res)
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
    <!-- todo 显示结果 -->
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
