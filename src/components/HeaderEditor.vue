<script setup lang="ts">
import { ChevronDown, ChevronUp, UserRound } from 'lucide-vue-next'
import { ref } from 'vue'
import { useResumeStore } from '../stores/resume'
import ImageUploader from './ImageUploader.vue'
const store = useResumeStore()
const open = ref(true)
function normalizeDocumentName() { store.documentName = store.documentName.trim() || '未命名简历' }
</script>
<template>
  <article class="editor-card header-editor">
    <button class="card-heading" type="button" @click="open = !open"><span class="heading-icon"><UserRound :size="18" /></span><span><strong>基本信息</strong><small>简历头部与联系方式</small></span><component :is="open ? ChevronUp : ChevronDown" :size="18" /></button>
    <div v-if="open" class="header-fields">
      <div class="upload-row"><ImageUploader v-model="store.header.schoolLogo" v-model:size="store.header.schoolLogoSize" label="校徽" kind="logo" /><ImageUploader v-model="store.header.photo" v-model:size="store.header.photoSize" label="证件照" kind="photo" /></div>
      <div class="field-grid">
        <label class="wide">简历名称（用于导出文件名）<input v-model="store.documentName" maxlength="80" @blur="normalizeDocumentName" /></label>
        <label>姓名<input v-model="store.header.name" /></label><label>求职方向<input v-model="store.header.target" /></label>
        <label>电话<input v-model="store.header.phone" /></label><label>邮箱<input v-model="store.header.email" /></label>
        <label>所在地<input v-model="store.header.location" /></label><label>GitHub<input v-model="store.header.github" /></label>
        <label class="wide">个人主页<input v-model="store.header.website" /></label>
      </div>
    </div>
  </article>
</template>
