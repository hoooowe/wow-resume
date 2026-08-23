<script setup lang="ts">
import { toPng } from 'html-to-image'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useResumeStore } from '../stores/resume'
import { safeExportName } from '../utils/fileName'
import ResumeDocumentContent from './ResumeDocumentContent.vue'

const store = useResumeStore()
const pageCount = ref(1)
const measureFlow = ref<HTMLElement>()
const pageRuler = ref<HTMLElement>()
const longExport = ref<HTMLElement>()
let measureFrame = 0

const cssVars = computed(() => ({
  '--resume-font-family': store.styles.fontFamily, '--resume-font-size': `${store.styles.fontSize}px`, '--resume-line-height': store.styles.lineHeight,
  '--resume-text-color': store.styles.textColor, '--resume-secondary-color': store.styles.secondaryColor, '--resume-theme-color': store.styles.themeColor,
  '--resume-section-title-size': `${store.styles.sectionTitleSize}px`, '--resume-section-gap': `${store.styles.sectionGap}px`, '--resume-item-gap': `${store.styles.itemGap}px`,
  '--resume-padding-top': `${store.styles.paddingY}mm`, '--resume-padding-right': `${store.styles.paddingX}mm`, '--resume-padding-bottom': `${store.styles.paddingY}mm`, '--resume-padding-left': `${store.styles.paddingX}mm`,
  '--resume-logo-width': `${125 * store.header.schoolLogoSize / 100}px`, '--resume-logo-height': `${66 * store.header.schoolLogoSize / 100}px`,
  '--resume-photo-width': `${66 * store.header.photoSize / 100}px`, '--resume-photo-height': `${82 * store.header.photoSize / 100}px`,
}))

const flowWidth = computed(() => `calc(${pageCount.value * 210}mm + ${(pageCount.value - 1) * 18}px)`)
const flowStyle = computed(() => ({ ...cssVars.value, width: flowWidth.value }))

function scheduleMeasure() {
  cancelAnimationFrame(measureFrame)
  measureFrame = requestAnimationFrame(async () => {
    await nextTick()
    const flow = measureFlow.value
    const ruler = pageRuler.value
    const marker = flow?.querySelector('.flow-end-marker') as HTMLElement | null
    if (!flow || !ruler || !marker) return
    const flowRect = flow.getBoundingClientRect()
    const markerRect = marker.getBoundingClientRect()
    const paddingLeft = Number.parseFloat(getComputedStyle(flow).paddingLeft)
    const pitch = ruler.getBoundingClientRect().width + 18
    const nextCount = Math.max(1, Math.floor((markerRect.left - flowRect.left - paddingLeft + 2) / pitch) + 1)
    if (nextCount !== pageCount.value) {
      pageCount.value = nextCount
      requestAnimationFrame(scheduleMeasure)
    }
  })
}

async function exportLongImage() {
  const node = longExport.value
  if (!node) return
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    width: node.scrollWidth,
    height: node.scrollHeight,
    style: { position: 'static', left: '0', top: '0', margin: '0', boxShadow: 'none' },
  })
  const link = document.createElement('a')
  link.download = `${safeExportName(store.documentName)}.png`
  link.href = dataUrl
  link.click()
}

watch(() => store.$state, scheduleMeasure, { deep: true, immediate: true })
onMounted(() => {
  window.addEventListener('resize', scheduleMeasure)
  window.addEventListener('resume-export-image', exportLongImage)
  document.fonts?.ready.then(scheduleMeasure)
  scheduleMeasure()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(measureFrame)
  window.removeEventListener('resize', scheduleMeasure)
  window.removeEventListener('resume-export-image', exportLongImage)
})
</script>

<template>
  <section class="preview-pane">
    <div class="preview-bar no-print"><div><span class="live-dot"></span>A4 实时预览 · {{ pageCount }} 页</div><span>PDF 按页导出，图片导出为长图</span></div>

    <div ref="pageRuler" class="page-ruler" aria-hidden="true"></div>
    <div ref="measureFlow" class="resume-flow resume-document resume-measure-flow" :style="flowStyle" aria-hidden="true">
      <ResumeDocumentContent /><span class="flow-end-marker"></span>
    </div>

    <div class="resume-pages-stack" :style="{ '--page-count': pageCount }">
      <article v-for="page in pageCount" :key="page" class="resume-page">
        <div class="resume-flow resume-document" :style="[flowStyle, { transform: `translateX(calc(-${(page - 1) * 210}mm - ${(page - 1) * 18}px))` }]">
          <ResumeDocumentContent /><span class="flow-end-marker"></span>
        </div>
      </article>
    </div>

    <article ref="longExport" class="resume-document long-resume-export" :style="cssVars" aria-hidden="true">
      <ResumeDocumentContent />
    </article>
  </section>
</template>
