import { defineStore } from 'pinia'
import type { IconName, ResumeItem, ResumeSection, ResumeState, SectionType } from '../types'

let counter = 0
let activeResumeId = ''
export const createId = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(++counter).toString(36)}`

const item = (data: Partial<ResumeItem> = {}): ResumeItem => ({
  id: createId('item'), organization: '', position: '', startDate: '', endDate: '', location: '', subtitle: '', summary: '', description: [''], ...data,
})

const section = (type: SectionType, title: string, icon: IconName, items: ResumeItem[]): ResumeSection => ({
  id: createId('section'), type, title, icon, visible: true, expanded: true, richText: '', items,
})

export const createDefaultState = (): ResumeState => ({
  documentName: '新建简历',
  header: {
    name: '', target: '', phone: '', email: '', location: '', github: '', website: '',
    schoolLogo: '', schoolLogoSize: 100, photo: '', photoSize: 100,
  },
  sections: [
    section('education', '教育经历', 'GraduationCap', [item({ description: [] })]),
    section('internship', '实习经历', 'BriefcaseBusiness', [item()]),
    section('project', '项目经历', 'FolderKanban', [item()]),
    { ...section('skills', '专业技能', 'Code2', []), richText: '<p></p>' },
  ],
  styles: {
    fontFamily: '"Microsoft YaHei", sans-serif', fontSize: 13, lineHeight: 1.45, textColor: '#1f2937', secondaryColor: '#64748b',
    themeColor: '#2c74e9', sectionTitleSize: 18, sectionGap: 18, itemGap: 12, paddingX: 16, paddingY: 11,
  },
})

export const createBlankState = (): ResumeState => {
  return createDefaultState()
}

const mergeState = (saved?: Partial<ResumeState>): ResumeState => {
  const defaults = createDefaultState()
  if (!saved) return defaults
  return {
    ...defaults,
    ...saved,
    header: { ...defaults.header, ...saved.header },
    styles: { ...defaults.styles, ...saved.styles },
    sections: Array.isArray(saved.sections) ? saved.sections : defaults.sections,
  }
}

const sectionTemplates: Record<SectionType, { title: string; icon: IconName }> = {
  education: { title: '教育经历', icon: 'GraduationCap' }, internship: { title: '实习经历', icon: 'BriefcaseBusiness' },
  project: { title: '项目经历', icon: 'FolderKanban' }, research: { title: '科研经历', icon: 'FlaskConical' },
  campus: { title: '校园经历', icon: 'Building2' }, skills: { title: '专业技能', icon: 'Code2' },
  awards: { title: '荣誉奖项', icon: 'Award' }, custom: { title: '自定义模块', icon: 'Star' },
}

export const useResumeStore = defineStore('resume', {
  state: createDefaultState,
  actions: {
    async loadDraft(resumeId: string) {
      try {
        const response = await fetch(`/api/resumes/${encodeURIComponent(resumeId)}`, { cache: 'no-store' })
        if (response.status === 200) {
          activeResumeId = resumeId
          this.$state = mergeState(await response.json() as Partial<ResumeState>)
          return true
        }
        return false
      } catch { return false }
    },
    async persist() {
      try {
        if (!activeResumeId) return false
        const response = await fetch(`/api/resumes/${encodeURIComponent(activeResumeId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.$state),
        })
        if (!response.ok) return false
        return true
      } catch { return false }
    },
    addSection(type: SectionType) {
      const template = sectionTemplates[type]
      this.sections.push(section(type, template.title, template.icon, type === 'skills' ? [] : [item()]))
    },
    deleteSection(sectionId: string) { this.sections = this.sections.filter((entry) => entry.id !== sectionId) },
    addItem(sectionId: string) { this.sections.find((entry) => entry.id === sectionId)?.items.push(item()) },
    deleteItem(sectionId: string, itemId: string) {
      const target = this.sections.find((entry) => entry.id === sectionId)
      if (target) target.items = target.items.filter((entry) => entry.id !== itemId)
    },
    addBullet(sectionId: string, itemId: string) { this.sections.find((s) => s.id === sectionId)?.items.find((i) => i.id === itemId)?.description.push('') },
    deleteBullet(sectionId: string, itemId: string, index: number) { this.sections.find((s) => s.id === sectionId)?.items.find((i) => i.id === itemId)?.description.splice(index, 1) },
    reset() { this.$state = createDefaultState(); void this.persist() },
  },
})
