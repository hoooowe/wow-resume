<script setup lang="ts">
import { Github, Globe2, Mail, MapPin, Phone } from 'lucide-vue-next'
import { computed } from 'vue'
import { useResumeStore } from '../stores/resume'
import ResumeIcon from './ResumeIcon.vue'

const store = useResumeStore()
const contactItems = computed(() => [
  { value: store.header.phone, icon: Phone }, { value: store.header.email, icon: Mail }, { value: store.header.location, icon: MapPin },
  { value: store.header.github, icon: Github }, { value: store.header.website, icon: Globe2 },
].filter((item) => item.value))
</script>

<template>
  <header class="resume-header">
    <div class="resume-logo"><img v-if="store.header.schoolLogo" :src="store.header.schoolLogo" alt="校徽" /><span v-else>校徽</span></div>
    <div class="identity"><h1>{{ store.header.name || '你的姓名' }}</h1><p>{{ store.header.target }}</p><div class="contact-list"><span v-for="entry in contactItems" :key="entry.value"><component :is="entry.icon" :size="11" />{{ entry.value }}</span></div></div>
    <div class="resume-photo"><img v-if="store.header.photo" :src="store.header.photo" alt="证件照" /><span v-else>证件照</span></div>
  </header>
  <template v-for="section in store.sections" :key="section.id">
    <section v-if="section.visible" class="resume-section">
      <h2><span><ResumeIcon :name="section.icon" :size="store.styles.sectionTitleSize" /></span>{{ section.title }}<i></i></h2>
      <div v-if="section.type === 'skills'" class="resume-rich-text" v-html="section.richText"></div>
      <div v-else class="resume-items">
        <article v-for="item in section.items" :key="item.id" class="resume-item">
          <div class="item-title-line"><strong>{{ item.organization }}</strong><time v-if="item.startDate || item.endDate">{{ item.startDate }}<template v-if="item.startDate && item.endDate"> — </template>{{ item.endDate }}</time></div>
          <div v-if="item.position || item.location" class="item-subtitle"><span>{{ item.position }}</span><span v-if="section.type === 'education' && item.subtitle" class="education-tags"><span v-for="tag in item.subtitle.split('·').map((value) => value.trim()).filter(Boolean)" :key="tag">{{ tag }}</span></span><span v-else-if="item.subtitle"> · {{ item.subtitle }}</span><em v-if="item.location">{{ item.location }}</em></div>
          <p v-if="(section.type === 'internship' || section.type === 'project') && item.summary" class="item-summary">{{ item.summary }}</p>
          <ul v-if="item.description.some(Boolean)"><li v-for="(bullet, index) in item.description.filter(Boolean)" :key="index">{{ bullet }}</li></ul>
        </article>
      </div>
    </section>
  </template>
</template>
