<script setup lang="ts">
import { Check, FileDown, House, ImageDown, LoaderCircle, Palette, RotateCcw, Save, SlidersHorizontal, TriangleAlert } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'
import { ElMessageBox } from 'element-plus/es/components/message-box/index'
import { useResumeStore } from '../stores/resume'
import { safeExportName } from '../utils/fileName'
const store = useResumeStore()
const showAdvanced = ref(false)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
let saveTimer = 0
const fonts = [
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' }, { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' }, { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
]
async function reset() {
  try { await ElMessageBox.confirm('当前编辑内容和样式将被清除，确定恢复默认简历吗？', '恢复默认简历', { confirmButtonText: '恢复默认', cancelButtonText: '取消', type: 'warning' }); store.reset() } catch { /* cancelled */ }
}
function printResume() {
  const previousTitle = document.title
  document.title = safeExportName(store.documentName)
  window.addEventListener('afterprint', () => { document.title = previousTitle }, { once: true })
  window.print()
}
function exportImage() { window.dispatchEvent(new CustomEvent('resume-export-image')) }
async function goHome() {
  await store.persist()
  window.location.assign('/')
}
async function saveDraft() {
  window.clearTimeout(saveTimer)
  saveState.value = 'saving'
  saveState.value = await store.persist() ? 'saved' : 'error'
  saveTimer = window.setTimeout(() => { saveState.value = 'idle' }, 2400)
}
function normalizeDocumentName() {
  store.documentName = store.documentName.trim() || '未命名简历'
}
onBeforeUnmount(() => window.clearTimeout(saveTimer))
</script>
<template>
  <header class="topbar no-print">
    <div class="brand"><span class="brand-mark" aria-hidden="true"><span>W</span></span><div><strong>wow-resume</strong><input v-model="store.documentName" class="document-name-input" maxlength="80" aria-label="简历名称" title="修改简历名称" @blur="normalizeDocumentName" /></div></div>
    <div class="style-toolbar" aria-label="全局样式工具栏">
      <el-select v-model="store.styles.fontFamily" aria-label="字体" style="width:132px"><el-option v-for="font in fonts" :key="font.value" :label="font.label" :value="font.value" /></el-select>
      <el-select v-model="store.styles.fontSize" aria-label="正文字号" style="width:84px"><el-option v-for="size in [12,13,14,15,16,17,18]" :key="size" :label="`${size}px`" :value="size" /></el-select>
      <el-select v-model="store.styles.lineHeight" aria-label="行距" style="width:96px"><el-option v-for="line in [1.2,1.3,1.4,1.5,1.6,1.8,2]" :key="line" :label="`行距 ${line}`" :value="line" /></el-select>
      <div class="color-control" title="正文颜色"><span>A</span><el-color-picker v-model="store.styles.textColor" aria-label="正文颜色" /></div>
      <div class="color-control" title="主题颜色"><Palette :size="15" /><el-color-picker v-model="store.styles.themeColor" aria-label="主题颜色" /></div>
      <button class="toolbar-icon" type="button" :class="{ active: showAdvanced }" @click="showAdvanced = !showAdvanced"><SlidersHorizontal :size="17" /><span>排版</span></button>
    </div>
    <div class="top-actions"><button class="ghost-button library-button" type="button" @click="goHome"><House :size="16" /><span>我的简历</span></button><button class="ghost-button" type="button" @click="reset"><RotateCcw :size="16" />恢复默认</button><button class="ghost-button save-draft-button" :class="saveState" type="button" :disabled="saveState === 'saving'" @click="saveDraft"><LoaderCircle v-if="saveState === 'saving'" class="saving-icon" :size="17" /><Check v-else-if="saveState === 'saved'" :size="17" /><TriangleAlert v-else-if="saveState === 'error'" :size="17" /><Save v-else :size="17" /><span>{{ saveState === 'saving' ? '保存中' : saveState === 'saved' ? '已保存到项目' : saveState === 'error' ? '保存失败' : '保存草稿' }}</span></button><button class="ghost-button image-export-button" type="button" @click="exportImage"><ImageDown :size="17" />导出长图</button><button class="primary-button" type="button" @click="printResume"><FileDown :size="17" />导出 PDF</button></div>
    <div v-if="showAdvanced" class="advanced-panel">
      <label>标题字号 <el-input-number v-model="store.styles.sectionTitleSize" :min="14" :max="26" /></label>
      <label>模块间距 <el-input-number v-model="store.styles.sectionGap" :min="8" :max="48" /></label>
      <label>条目间距 <el-input-number v-model="store.styles.itemGap" :min="4" :max="32" /></label>
      <label>左右边距 <el-input-number v-model="store.styles.paddingX" :min="8" :max="30" /></label>
      <label>上下边距 <el-input-number v-model="store.styles.paddingY" :min="8" :max="30" /></label>
      <label>辅助颜色 <el-color-picker v-model="store.styles.secondaryColor" /></label>
    </div>
  </header>
</template>
