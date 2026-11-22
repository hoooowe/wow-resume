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

function educationTagList(tags?: { is985: boolean; is211: boolean; isDoubleFirstClass: boolean }) {
  if (!tags) return []
  const list: string[] = []
  if (tags.is985) list.push('985')
  if (tags.is211) list.push('211')
  if (tags.isDoubleFirstClass) list.push('双一流')
  return list
}

function isRichItem(type: string) {
  return type === 'internship' || type === 'project'
}

function hasRichContent(html?: string) {
  if (!html) return false
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length > 0
}
</script>

<template>
  <header class="resume-header">
    <div class="resume-logo"><img v-if="store.header.schoolLogo" :src="store.header.schoolLogo" alt="校徽" /><span v-else>校徽</span></div>
    <div class="identity"><h1>{{ store.header.name || '你的姓名' }}</h1><p>{{ store.header.target }}</p><div class="contact-list"><span v-for="entry in contactItems" :key="entry.value"><component :is="entry.icon" :size="13" />{{ entry.value }}</span></div></div>
    <div class="resume-photo"><img v-if="store.header.photo" :src="store.header.photo" alt="证件照" /><span v-else>证件照</span></div>
  </header>
  <template v-for="section in store.sections" :key="section.id">
    <section v-if="section.visible" class="resume-section">
      <h2><span><ResumeIcon :name="section.icon" :size="store.styles.sectionTitleSize" /></span>{{ section.title }}<i></i></h2>
      <div v-if="section.type === 'skills'" class="resume-rich-text" v-html="section.richText"></div>
      <div v-else class="resume-items">
        <article v-for="item in section.items" :key="item.id" class="resume-item" :class="{ 'education-item': section.type === 'education' }">
          <div v-if="section.type === 'education'" class="item-title-line education-title-line">
            <div class="education-title-main">
              <strong>{{ item.organization }}</strong>
              <span v-if="item.position" class="education-major">{{ item.position }}</span>
              <span v-if="educationTagList(item.educationTags).length" class="education-tags">
                <span v-for="tag in educationTagList(item.educationTags)" :key="tag">{{ tag }}</span>
              </span>
            </div>
            <time v-if="item.startDate || item.endDate">{{ item.startDate }}<template v-if="item.startDate && item.endDate"> — </template>{{ item.endDate }}</time>
          </div>
          <template v-else>
            <div class="item-title-line">
              <strong><img v-if="section.type === 'internship' && item.logo" class="company-logo" :src="item.logo" alt="" />{{ item.organization }}</strong>
              <time v-if="item.startDate || item.endDate">{{ item.startDate }}<template v-if="item.startDate && item.endDate"> — </template>{{ item.endDate }}</time>
            </div>
            <div v-if="item.position || item.location || item.subtitle" class="item-subtitle">
              <span v-if="item.position">{{ item.position }}</span>
              <span v-if="item.subtitle"> · {{ item.subtitle }}</span>
              <em v-if="item.location">{{ item.location }}</em>
            </div>
          </template>
          <div v-if="isRichItem(section.type) && hasRichContent(item.summaryHtml)" class="item-summary resume-rich-text" v-html="item.summaryHtml"></div>
          <div v-if="isRichItem(section.type) && hasRichContent(item.descriptionHtml)" class="item-rich-body resume-rich-text" v-html="item.descriptionHtml"></div>
          <ul v-else-if="!isRichItem(section.type) && item.description.some(Boolean)"><li v-for="(bullet, index) in item.description.filter(Boolean)" :key="index">{{ bullet }}</li></ul>
        </article>
      </div>
    </section>
  </template>
</template>

<style scoped>
.company-logo {
  width: 1.5em;
  height: 1.2em;
  margin-inline-end: 0.35em;
  object-fit: contain;
  vertical-align: middle;
}
</style>
