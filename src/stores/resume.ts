import { defineStore } from 'pinia'
import type { EducationTags, IconName, ResumeItem, ResumeSection, ResumeState, SectionType } from '../types'

let counter = 0
let activeResumeId = ''
export const createId = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(++counter).toString(36)}`

const emptyEducationTags = (): EducationTags => ({ is985: false, is211: false, isDoubleFirstClass: false })

const item = (data: Partial<ResumeItem> = {}): ResumeItem => ({
  id: createId('item'), organization: '', position: '', startDate: '', endDate: '', location: '', subtitle: '', summary: '', description: [''],
  educationTags: emptyEducationTags(), summaryHtml: '', descriptionHtml: '', ...data,
})

const itemForType = (type: SectionType): ResumeItem => {
  if (type === 'education') return item({ description: [] })
  if (type === 'internship' || type === 'project') return item({ description: [], summaryHtml: '', descriptionHtml: '' })
  if (type === 'skills') return item({ description: [] })
  return item()
}

const section = (type: SectionType, title: string, icon: IconName, items: ResumeItem[]): ResumeSection => ({
  id: createId('section'), type, title, icon, visible: true, expanded: true, richText: '', items,
})

const toRichParagraph = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('<')) return trimmed
  return `<p>${trimmed}</p>`
}

const toRichList = (bullets: string[]) => {
  const parts = bullets.map((entry) => entry.trim()).filter(Boolean)
  if (!parts.length) return ''
  return `<ul>${parts.map((entry) => `<li>${entry}</li>`).join('')}</ul>`
}

const parseEducationSubtitle = (subtitle: string): EducationTags => {
  const parts = subtitle.split(/[·・]/).map((value) => value.trim()).filter(Boolean)
  return {
    is985: parts.includes('985'),
    is211: parts.includes('211'),
    isDoubleFirstClass: parts.includes('双一流'),
  }
}

const normalizeItem = (raw: Partial<ResumeItem>, type: SectionType): ResumeItem => {
  const base = item(raw)
  if (type === 'education') {
    const tags = raw.educationTags
      ? { ...emptyEducationTags(), ...raw.educationTags }
      : parseEducationSubtitle(raw.subtitle ?? '')
    return { ...base, description: raw.description ?? [], educationTags: tags }
  }
  if (type === 'internship' || type === 'project') {
    const summaryHtml = raw.summaryHtml || toRichParagraph(raw.summary ?? '')
    const descriptionHtml = raw.descriptionHtml || toRichList(raw.description ?? [])
    return { ...base, description: [], summaryHtml, descriptionHtml }
  }
  return base
}

const normalizeSection = (raw: ResumeSection): ResumeSection => ({
  ...raw,
  items: (raw.items ?? []).map((entry) => normalizeItem(entry, raw.type)),
})

export const createDefaultState = (): ResumeState => ({
  documentName: '新建简历',
  header: {
    name: '', target: '', phone: '', email: '', location: '', github: '', website: '',
    schoolLogo: '', schoolLogoSize: 100, photo: '', photoSize: 100,
  },
  sections: [
    section('education', '教育经历', 'GraduationCap', [itemForType('education')]),
    section('internship', '实习经历', 'BriefcaseBusiness', [itemForType('internship')]),
    section('project', '项目经历', 'FolderKanban', [itemForType('project')]),
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
    sections: Array.isArray(saved.sections) ? saved.sections.map(normalizeSection) : defaults.sections,
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
      this.sections.push(section(type, template.title, template.icon, type === 'skills' ? [] : [itemForType(type)]))
    },
    deleteSection(sectionId: string) { this.sections = this.sections.filter((entry) => entry.id !== sectionId) },
    addItem(sectionId: string) {
      const target = this.sections.find((entry) => entry.id === sectionId)
      if (target) target.items.push(itemForType(target.type))
    },
    deleteItem(sectionId: string, itemId: string) {
      const target = this.sections.find((entry) => entry.id === sectionId)
      if (target) target.items = target.items.filter((entry) => entry.id !== itemId)
    },
    addBullet(sectionId: string, itemId: string) { this.sections.find((s) => s.id === sectionId)?.items.find((i) => i.id === itemId)?.description.push('') },
    deleteBullet(sectionId: string, itemId: string, index: number) { this.sections.find((s) => s.id === sectionId)?.items.find((i) => i.id === itemId)?.description.splice(index, 1) },
    reset() { this.$state = createDefaultState(); void this.persist() },
  },
})
