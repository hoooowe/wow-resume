import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ResumeState } from '../types'
import { createBlankState, createDefaultState, useResumeStore } from './resume'
import { safeExportName } from '../utils/fileName'

const fetchMock = vi.fn()
Object.defineProperty(globalThis, 'fetch', { value: fetchMock, writable: true })
const response = (status: number, data?: unknown) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => data,
}) as Response

describe('resume store', () => {
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(response(404))
    setActivePinia(createPinia())
  })

  it('creates all default resume sections', () => {
    const store = useResumeStore()
    expect(store.sections.map((section) => section.type)).toEqual([
      'education', 'internship', 'project', 'skills',
    ])
    expect(store.header.email).toBe('')
    expect(store.documentName).toBe('新建简历')
    expect(store.styles.themeColor).toBe('#2c74e9')
    expect(store.header.schoolLogo).toBe('')
    expect(store.header.schoolLogoSize).toBe(100)
    expect(store.header.photoSize).toBe(100)
    const internship = store.sections.find((section) => section.type === 'internship')!
    expect(internship.items[0].summary).toBe('')
    const skills = store.sections.find((section) => section.type === 'skills')!
    expect(skills.items).toHaveLength(0)
    expect(skills.richText).toBe('<p></p>')
  })

  it('adds modules, items and bullets through the generic model', () => {
    const store = useResumeStore()
    store.addSection('custom')
    const custom = store.sections.at(-1)!
    expect(custom.title).toBe('自定义模块')
    expect(custom.items).toHaveLength(1)
    store.addItem(custom.id)
    store.addBullet(custom.id, custom.items[0].id)
    expect(custom.items).toHaveLength(2)
    expect(custom.items[0].description).toHaveLength(2)
  })

  it('creates an empty resume for the new-resume flow', () => {
    const blank = createBlankState()
    expect(blank.header.name).toBe('')
    expect(blank.documentName).toBe('新建简历')
    expect(blank.header.schoolLogo).toBe('')
    expect(blank.sections.map((section) => section.type)).toEqual(['education', 'internship', 'project', 'skills'])
  })

  it('creates safe PDF and image filenames from the resume name', () => {
    expect(safeExportName('Java/后端：简历*')).toBe('Java-后端：简历-')
    expect(safeExportName('   ')).toBe('简历')
  })

  it('saves the draft through the project file endpoint and restores it', async () => {
    const store = useResumeStore()
    fetchMock.mockResolvedValueOnce(response(200, createDefaultState()))
    expect(await store.loadDraft('resume-1')).toBe(true)
    store.header.name = '测试用户'
    fetchMock.mockResolvedValueOnce(response(200, { saved: true }))
    expect(await store.persist()).toBe(true)
    expect(fetchMock.mock.calls[1][0]).toBe('/api/resumes/resume-1')
    const savedDraft = JSON.parse(String(fetchMock.mock.calls[1][1]?.body)) as ResumeState
    expect(savedDraft.header.name).toBe('测试用户')

    fetchMock.mockResolvedValueOnce(response(200, savedDraft))
    setActivePinia(createPinia())
    const restoredStore = useResumeStore()
    expect(await restoredStore.loadDraft('resume-1')).toBe(true)
    expect(restoredStore.header.name).toBe('测试用户')
  })

  it('fills new image settings when loading an older project draft', async () => {
    const oldState = createDefaultState() as ResumeState
    const oldHeader = { ...oldState.header } as Partial<ResumeState['header']>
    delete oldHeader.schoolLogoSize
    delete oldHeader.photoSize
    fetchMock.mockResolvedValueOnce(response(200, { ...oldState, header: oldHeader }))
    setActivePinia(createPinia())
    const store = useResumeStore()
    expect(await store.loadDraft('legacy-resume')).toBe(true)
    expect(store.header.schoolLogoSize).toBe(100)
    expect(store.header.photoSize).toBe(100)
  })
})
