import { defineConfig } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

const dataPath = resolve(process.cwd(), 'data')
const resumeDirectory = resolve(dataPath, 'resumes')
const resumeIndexPath = resolve(resumeDirectory, 'index.json')
const legacyDraftPath = resolve(dataPath, 'resume-draft.json')
const maxDraftBytes = 25 * 1024 * 1024

interface ResumeDocument {
  documentName?: string
  header?: { name?: string; target?: string }
  [key: string]: unknown
}

interface ResumeSummary {
  id: string
  title: string
  headerName: string
  target: string
  createdAt: string
  updatedAt: string
}

interface ResumeIndex {
  version: 1
  resumes: ResumeSummary[]
}

function sendJson(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(value))
}

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > maxDraftBytes) throw new Error('DRAFT_TOO_LARGE')
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function writeJsonAtomic(filePath: string, value: unknown) {
  await mkdir(dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.${process.pid}-${Date.now()}-${randomUUID().slice(0, 6)}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, filePath)
}

function resumePath(id: string) {
  return resolve(resumeDirectory, `${id}.json`)
}

function documentLabels(document: ResumeDocument) {
  const documentName = typeof document.documentName === 'string' ? document.documentName.trim() : ''
  const headerName = typeof document.header?.name === 'string' ? document.header.name.trim() : ''
  const target = typeof document.header?.target === 'string' ? document.header.target.trim() : ''
  return { documentName, headerName, target }
}

function createResumeId() {
  return `resume-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
}

async function ensureResumeIndex(): Promise<ResumeIndex> {
  try {
    return JSON.parse(await readFile(resumeIndexPath, 'utf8')) as ResumeIndex
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    const index: ResumeIndex = { version: 1, resumes: [] }
    try {
      const legacyDocument = JSON.parse(await readFile(legacyDraftPath, 'utf8')) as ResumeDocument
      const id = createResumeId()
      const now = new Date().toISOString()
      const { documentName, headerName, target } = documentLabels(legacyDocument)
      await writeJsonAtomic(resumePath(id), legacyDocument)
      index.resumes.push({ id, title: documentName || headerName || '我的简历', headerName, target, createdAt: now, updatedAt: now })
    } catch (legacyError) {
      if ((legacyError as NodeJS.ErrnoException).code !== 'ENOENT') throw legacyError
    }
    await writeJsonAtomic(resumeIndexPath, index)
    return index
  }
}

let mutationQueue: Promise<unknown> = Promise.resolve()
function mutateLibrary<T>(operation: () => Promise<T>) {
  const result = mutationQueue.then(operation, operation)
  mutationQueue = result.then(() => undefined, () => undefined)
  return result
}

function resumeLibraryStorage() {
  return {
    name: 'local-resume-library-storage',
    configureServer(server: { middlewares: { use: (handler: typeof resumeLibraryMiddleware) => void } }) {
      server.middlewares.use(resumeLibraryMiddleware)
    },
    configurePreviewServer(server: { middlewares: { use: (handler: typeof resumeLibraryMiddleware) => void } }) {
      server.middlewares.use(resumeLibraryMiddleware)
    },
  }
}

async function resumeLibraryMiddleware(request: IncomingMessage, response: ServerResponse, next: () => void) {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname
  const itemMatch = pathname.match(/^\/api\/resumes\/([a-zA-Z0-9_-]+)$/)
  if (pathname !== '/api/resumes' && !itemMatch) return next()
  try {
    if (pathname === '/api/resumes' && request.method === 'GET') {
      const index = await ensureResumeIndex()
      sendJson(response, 200, [...index.resumes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
      return
    }
    if (pathname === '/api/resumes' && request.method === 'POST') {
      const body = JSON.parse(await readBody(request)) as { action?: string; document?: ResumeDocument; sourceId?: string }
      const created = await mutateLibrary(async () => {
        const index = await ensureResumeIndex()
        const id = createResumeId()
        const now = new Date().toISOString()
        if (body.action === 'copy' && body.sourceId) {
          const source = index.resumes.find((entry) => entry.id === body.sourceId)
          if (!source) return null
          const document = JSON.parse(await readFile(resumePath(source.id), 'utf8')) as ResumeDocument
          const copyTitle = `${source.title} · 副本`
          await writeJsonAtomic(resumePath(id), { ...document, documentName: copyTitle })
          index.resumes.push({ ...source, id, title: copyTitle, createdAt: now, updatedAt: now })
        } else if (body.action === 'create' && body.document && typeof body.document === 'object') {
          const { documentName, headerName, target } = documentLabels(body.document)
          await writeJsonAtomic(resumePath(id), body.document)
          index.resumes.push({ id, title: documentName || '新建简历', headerName, target, createdAt: now, updatedAt: now })
        } else return null
        await writeJsonAtomic(resumeIndexPath, index)
        return id
      })
      if (!created) return sendJson(response, 400, { error: '无法创建简历' })
      sendJson(response, 201, { id: created })
      return
    }
    if (itemMatch && request.method === 'GET') {
      try {
        const draft = await readFile(resumePath(itemMatch[1]), 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        response.end(draft)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return sendJson(response, 404, { error: '简历不存在' })
        throw error
      }
      return
    }
    if (itemMatch && request.method === 'PUT') {
      const payload = JSON.parse(await readBody(request)) as ResumeDocument
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return sendJson(response, 400, { error: '草稿格式无效' })
      const saved = await mutateLibrary(async () => {
        const index = await ensureResumeIndex()
        const summary = index.resumes.find((entry) => entry.id === itemMatch[1])
        if (!summary) return false
        const { documentName, headerName, target } = documentLabels(payload)
        await writeJsonAtomic(resumePath(summary.id), payload)
        summary.title = documentName || summary.title
        summary.headerName = headerName
        summary.target = target
        summary.updatedAt = new Date().toISOString()
        await writeJsonAtomic(resumeIndexPath, index)
        return true
      })
      if (!saved) return sendJson(response, 404, { error: '简历不存在' })
      sendJson(response, 200, { saved: true })
      return
    }
    if (itemMatch && request.method === 'PATCH') {
      const body = JSON.parse(await readBody(request)) as { title?: string }
      const title = typeof body.title === 'string' ? body.title.trim().slice(0, 80) : ''
      if (!title) return sendJson(response, 400, { error: '简历名称不能为空' })
      const renamed = await mutateLibrary(async () => {
        const index = await ensureResumeIndex()
        const summary = index.resumes.find((entry) => entry.id === itemMatch[1])
        if (!summary) return false
        const document = JSON.parse(await readFile(resumePath(summary.id), 'utf8')) as ResumeDocument
        document.documentName = title
        await writeJsonAtomic(resumePath(summary.id), document)
        summary.title = title
        summary.updatedAt = new Date().toISOString()
        await writeJsonAtomic(resumeIndexPath, index)
        return true
      })
      if (!renamed) return sendJson(response, 404, { error: '简历不存在' })
      sendJson(response, 200, { renamed: true, title })
      return
    }
    if (itemMatch && request.method === 'DELETE') {
      const deleted = await mutateLibrary(async () => {
        const index = await ensureResumeIndex()
        const targetIndex = index.resumes.findIndex((entry) => entry.id === itemMatch[1])
        if (targetIndex < 0) return false
        const summary = index.resumes[targetIndex]
        const trashDirectory = resolve(resumeDirectory, '.trash')
        await mkdir(trashDirectory, { recursive: true })
        await rename(resumePath(summary.id), resolve(trashDirectory, `${summary.id}-${Date.now()}.json`))
        index.resumes.splice(targetIndex, 1)
        await writeJsonAtomic(resumeIndexPath, index)
        return true
      })
      if (!deleted) return sendJson(response, 404, { error: '简历不存在' })
      sendJson(response, 200, { deleted: true })
      return
    }
    response.setHeader('Allow', pathname === '/api/resumes' ? 'GET, POST' : 'GET, PUT, PATCH, DELETE')
    sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    sendJson(response, error instanceof Error && error.message === 'DRAFT_TOO_LARGE' ? 413 : 500, { error: '简历文件操作失败' })
  }
}

export default defineConfig({
  plugins: [vue(), resumeLibraryStorage()],
  server: { host: '127.0.0.1' },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('element-plus')) return 'element-plus'
          if (id.includes('lucide-vue-next')) return 'icons'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
