<script setup lang="ts">
import { Copy, FileText, LoaderCircle, PenLine, Plus, ShieldCheck, Trash2 } from 'lucide-vue-next'
import { ElMessageBox } from 'element-plus/es/components/message-box/index'
import { onMounted, ref } from 'vue'
import { createBlankState } from '../stores/resume'

interface ResumeSummary {
  id: string
  title: string
  target: string
  createdAt: string
  updatedAt: string
}

const resumes = ref<ResumeSummary[]>([])
const loading = ref(true)
const errorMessage = ref('')
const workingId = ref('')

function openResume(id: string) {
  window.location.assign(`/?resume=${encodeURIComponent(id)}`)
}

function formattedTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '刚刚更新' : new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

async function loadResumes() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch('/api/resumes', { cache: 'no-store' })
    if (!response.ok) throw new Error()
    resumes.value = await response.json() as ResumeSummary[]
  } catch {
    errorMessage.value = '无法读取项目中的简历，请确认本地服务正在运行。'
  } finally { loading.value = false }
}

async function createResume() {
  workingId.value = 'new'
  errorMessage.value = ''
  try {
    const response = await fetch('/api/resumes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', document: createBlankState() }),
    })
    if (!response.ok) throw new Error()
    const result = await response.json() as { id: string }
    openResume(result.id)
  } catch {
    errorMessage.value = '新建简历失败，请稍后重试。'
    workingId.value = ''
  }
}

async function copyResume(resume: ResumeSummary) {
  workingId.value = resume.id
  errorMessage.value = ''
  try {
    const response = await fetch('/api/resumes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'copy', sourceId: resume.id }),
    })
    if (!response.ok) throw new Error()
    await loadResumes()
  } catch { errorMessage.value = '复制简历失败，请稍后重试。' }
  finally { workingId.value = '' }
}

async function renameResume(resume: ResumeSummary) {
  let title = ''
  try {
    const result = await ElMessageBox.prompt('修改后，PDF 和长图都会使用这个名称。', '修改简历名称', {
      confirmButtonText: '保存', cancelButtonText: '取消', inputValue: resume.title,
      inputPlaceholder: '请输入简历名称', inputValidator: (value) => value.trim() ? true : '简历名称不能为空',
    })
    title = result.value.trim()
  } catch { return }
  if (title === resume.title) return
  workingId.value = resume.id
  errorMessage.value = ''
  try {
    const response = await fetch(`/api/resumes/${encodeURIComponent(resume.id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    })
    if (!response.ok) throw new Error()
    resume.title = title
    resume.updatedAt = new Date().toISOString()
  } catch { errorMessage.value = '修改简历名称失败，请稍后重试。' }
  finally { workingId.value = '' }
}

async function deleteResume(resume: ResumeSummary) {
  try {
    await ElMessageBox.confirm(`确定删除“${resume.title}”吗？删除后会移入项目回收目录。`, '删除简历', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
  } catch { return }
  workingId.value = resume.id
  errorMessage.value = ''
  try {
    const response = await fetch(`/api/resumes/${encodeURIComponent(resume.id)}`, { method: 'DELETE' })
    if (!response.ok) throw new Error()
    resumes.value = resumes.value.filter((entry) => entry.id !== resume.id)
  } catch { errorMessage.value = '删除简历失败，请稍后重试。' }
  finally { workingId.value = '' }
}

onMounted(loadResumes)
</script>

<template>
  <main class="home-page">
    <header class="home-topbar">
      <div class="home-brand"><span class="brand-mark" aria-hidden="true"><span>W</span></span><div><strong>wow-resume</strong><small>本地简历工作区</small></div></div>
      <div class="home-local-note"><ShieldCheck :size="16" />所有草稿保存在当前项目</div>
    </header>
    <section class="home-content">
      <div class="home-hero">
        <div><span class="eyebrow">RESUME WORKSPACE</span><h1>我的简历</h1><p>管理不同岗位和版本的简历，修改内容会自动保存到项目目录。</p></div>
        <button class="home-create-button" type="button" :disabled="workingId === 'new'" @click="createResume"><LoaderCircle v-if="workingId === 'new'" class="saving-icon" :size="18" /><Plus v-else :size="19" />新增简历</button>
      </div>
      <p v-if="errorMessage" class="home-error" role="alert">{{ errorMessage }}</p>
      <div v-if="loading" class="home-loading"><span class="route-spinner"></span><p>正在读取项目草稿…</p></div>
      <div v-else-if="!resumes.length" class="home-empty"><span><FileText :size="28" /></span><h2>还没有简历</h2><p>创建第一份简历，开始编辑你的经历。</p><button type="button" @click="createResume"><Plus :size="17" />新增简历</button></div>
      <section v-else class="resume-library" aria-label="简历列表">
        <article v-for="resume in resumes" :key="resume.id" class="resume-library-card" tabindex="0" @click="openResume(resume.id)" @keydown.enter.self="openResume(resume.id)">
          <div class="resume-card-preview"><div class="preview-avatar"></div><i></i><i></i><b></b><i></i><i></i><i></i></div>
          <div class="resume-card-body"><h2>{{ resume.title }}</h2><p>{{ resume.target || '暂未填写求职方向' }}</p><time>更新于 {{ formattedTime(resume.updatedAt) }}</time></div>
          <div class="resume-card-actions">
            <button type="button" title="修改名称" :disabled="workingId === resume.id" @click.stop="renameResume(resume)"><PenLine :size="16" /></button>
            <button type="button" title="复制简历" :disabled="workingId === resume.id" @click.stop="copyResume(resume)"><LoaderCircle v-if="workingId === resume.id" class="saving-icon" :size="16" /><Copy v-else :size="16" /></button>
            <button class="danger" type="button" title="删除简历" :disabled="workingId === resume.id" @click.stop="deleteResume(resume)"><Trash2 :size="16" /></button>
          </div>
        </article>
        <button class="resume-add-card" type="button" @click="createResume"><span><Plus :size="24" /></span><strong>新增简历</strong><small>从空白简历开始</small></button>
      </section>
    </section>
  </main>
</template>
