<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useResumeStore } from './stores/resume'
import GlobalStyleToolbar from './components/GlobalStyleToolbar.vue'
import ResumeEditor from './components/ResumeEditor.vue'
import ResumeHome from './components/ResumeHome.vue'
import ResumePreview from './components/ResumePreview.vue'
const store = useResumeStore()
const resumeId = new URLSearchParams(window.location.search).get('resume') || ''
const loading = ref(Boolean(resumeId))
const loadFailed = ref(false)
let autoSaveTimer = 0
let unsubscribe: (() => void) | undefined

onMounted(async () => {
  if (!resumeId) return
  const loaded = await store.loadDraft(resumeId)
  loading.value = false
  loadFailed.value = !loaded
  if (!loaded) return
  unsubscribe = store.$subscribe(() => {
    window.clearTimeout(autoSaveTimer)
    autoSaveTimer = window.setTimeout(() => { void store.persist() }, 450)
  }, { detached: true })
})
onBeforeUnmount(() => {
  window.clearTimeout(autoSaveTimer)
  unsubscribe?.()
})
</script>

<template>
  <ResumeHome v-if="!resumeId" />
  <main v-else-if="loading" class="route-state"><span class="route-spinner"></span><p>正在打开简历…</p></main>
  <main v-else-if="loadFailed" class="route-state"><strong>这份简历不存在或暂时无法读取</strong><a href="/">返回我的简历</a></main>
  <main v-else class="app-shell"><GlobalStyleToolbar /><section class="workspace"><ResumeEditor /><ResumePreview /></section></main>
</template>
