/**
 * 接口层：静态站点 + 只读 API。
 *
 *   pnpm build && node server.mjs
 *
 * 路由：
 *   GET /api/profile  → 个人资料（src/data/profile.json，由 content/ 聚合生成）
 *   GET /api/works    → 作品列表（src/data/works.json）
 *   GET /api/videos   → 视频列表（src/data/videos.json）
 *   GET /api/network  → 协作网络成员（src/data/network.json）
 *   GET /api/network/projects → 协作项目池（src/data/projects.json）
 *   其余请求          → dist/ 静态文件；未命中时回退 index.html（SPA 路由）
 */
import http from 'node:http'
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { federationProjectsResponse, projectStatusEndpoint } from './scripts/federation.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
const dist = join(root, 'dist')
const port = process.env.PORT || 4173

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = decodeURIComponent(url.pathname)

    // ---- 只读 API（全部开放 CORS，供联盟节点跨站拉取） ----
    if (req.method === 'GET' && path === '/api/profile') {
      const profile = JSON.parse(await readFile(join(root, 'src/data/profile.json'), 'utf8'))
      return json(res, 200, profile)
    }
    if (req.method === 'GET' && path === '/api/works') {
      const items = JSON.parse(await readFile(join(root, 'src/data/works.json'), 'utf8'))
      return json(res, 200, { count: items.length, items })
    }
    if (req.method === 'GET' && path === '/api/videos') {
      const items = JSON.parse(await readFile(join(root, 'src/data/videos.json'), 'utf8'))
      return json(res, 200, { count: items.length, items })
    }
    if (req.method === 'GET' && path === '/api/network') {
      const items = JSON.parse(await readFile(join(root, 'src/data/network.json'), 'utf8'))
      return json(res, 200, { count: items.length, items })
    }
    if (req.method === 'GET' && path === '/api/network/projects') {
      // 联邦开放接口：输出联盟标准结构（projectId/projectName/need/reward/status/publisher/claimUrl）
      // 浏览与拉取不产生任何同步——只有 POST /api/network/claim 才建立数据连接。
      const [items, profile] = await Promise.all([
        readFile(join(root, 'src/data/projects.json'), 'utf8'),
        readFile(join(root, 'src/data/profile.json'), 'utf8'),
      ])
      return json(res, 200, federationProjectsResponse(JSON.parse(items), JSON.parse(profile).siteUrl))
    }

    // ---- 联邦协作：认领即连接 ----

    // 接收联盟认领：对方站点点击「认领」后 POST 过来，落盘到本站后台（content/ops/claims/）
    if (req.method === 'POST' && path === '/api/network/claim') {
      const body = await readBody(req)
      const claimId = `in-${Date.now().toString(36)}`
      const record = {
        direction: 'incoming',
        claimId,
        projectId: str(body.projectId, 120),
        projectName: str(body.projectName, 200),
        claimerName: str(body.claimer?.name, 80),
        claimerSite: str(body.claimer?.site, 200),
        contact: str(body.contact, 200),
        message: str(body.message, 500),
        status: 'pending',
        receivedAt: new Date().toISOString(),
      }
      if (!record.projectId || !record.claimerName) {
        return json(res, 400, { error: 'projectId 与 claimer.name 为必填字段' })
      }
      await writeClaim(join(root, 'content/ops/claims'), `${claimId}.json`, record)
      return json(res, 200, { ok: true, claimId, status: 'received' })
    }

    // 项目认领状态查询（轮询同步端点）：只暴露认领状态与进度，不含联系方式等隐私
    if (req.method === 'GET' && /^\/api\/network\/projects\/[^/]+\/status$/.test(path)) {
      const projectId = decodeURIComponent(path.split('/')[4])
      const items = JSON.parse(await readFile(join(root, 'src/data/projects.json'), 'utf8'))
      const p = items.find((x) => x.slug === projectId)
      if (!p) return json(res, 404, { error: 'project not found' })
      const { claimedBy, claimedAt } = await findIncomingClaim(projectId)
      return json(res, 200, {
        projectId,
        projectName: p.title,
        status: p.type === 'delivered' ? 'delivered' : claimedBy ? 'claimed' : 'open',
        claimedBy,
        claimedAt,
        progress: '',
        updatedAt: new Date().toISOString(),
      })
    }

    // ---- 内部工作台：联邦认领台账（实时读目录，认领成功即刻可见） ----

    if (req.method === 'GET' && path === '/api/ops/claims') {
      const items = await readClaims()
      return json(res, 200, { count: items.length, items })
    }

    // 记录我发出的认领（前端在对方 claim 接口返回成功后调用）
    if (req.method === 'POST' && path === '/api/ops/outbound-claim') {
      const body = await readBody(req)
      const profile = JSON.parse(await readFile(join(root, 'src/data/profile.json'), 'utf8'))
      const claimId = `out-${Date.now().toString(36)}`
      const record = {
        direction: 'outbound',
        claimId,
        projectId: str(body.projectId, 120),
        projectName: str(body.projectName, 200),
        nodeApiUrl: str(body.nodeApiUrl, 300),
        claimerName: profile.name,
        claimerSite: profile.siteUrl,
        contact: str(body.contact, 200) || profile.email,
        message: str(body.message, 500),
        status: 'pending',
        remoteStatus: 'pending',
        progress: '',
        claimedAt: new Date().toISOString(),
        lastSyncedAt: null,
      }
      if (!record.projectId || !record.nodeApiUrl) {
        return json(res, 400, { error: 'projectId 与 nodeApiUrl 为必填字段' })
      }
      await writeClaim(join(root, 'content/ops/claims'), `${claimId}.json`, record)
      return json(res, 200, { ok: true, claimId, status: 'bound' })
    }

    // 轮询同步：只对「我已认领」的项目，逐条拉对方 status 端点刷新进度（未被认领的项目绝不混入台账）
    if (req.method === 'POST' && path === '/api/ops/sync') {
      const all = await readClaims()
      const outbound = all.filter((c) => c.direction === 'outbound')
      const results = []
      for (const c of outbound) {
        try {
          const url = projectStatusEndpoint(c.nodeApiUrl, c.projectId)
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 8000)
          const r = await fetch(url, { signal: ctrl.signal })
          clearTimeout(timer)
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const data = await r.json()
          c.remoteStatus = data.status || c.remoteStatus
          c.progress = data.progress || c.progress || ''
          c.lastSyncedAt = new Date().toISOString()
          await writeClaim(join(root, 'content/ops/claims'), `${c.claimId}.json`, c)
          results.push({ claimId: c.claimId, ok: true, remoteStatus: c.remoteStatus })
        } catch (e) {
          results.push({ claimId: c.claimId, ok: false, error: String(e.message || e) })
        }
      }
      return json(res, 200, { ok: true, synced: results.filter((r) => r.ok).length, results })
    }
    // ---- CORS 预检（联盟 POST 认领需要） ----
    if (req.method === 'OPTIONS' && path.startsWith('/api/')) {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      })
      return res.end()
    }

    if (path.startsWith('/api/')) {
      return json(res, 404, { error: 'Not Found' })
    }

    // ---- 静态文件 + SPA 回退 ----
    const safe = normalize(path).replace(/^(\.\.[/\\])+/, '')
    let file = join(dist, safe)
    try {
      const stat = await readFile(file)
      const type = mime[extname(file)] ?? 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': type })
      return res.end(stat)
    } catch {
      // 未命中：回退到 index.html（客户端路由），根路径之外带 404 语义可按需调整
      const html = await readFile(join(dist, 'index.html'))
      res.writeHead(200, { 'Content-Type': mime['.html'] })
      return res.end(html)
    }
  } catch (err) {
    return json(res, 500, { error: 'Internal Server Error' })
  }
})

function json(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(body))
}

/** 读取并截断请求体字符串（限 16KB） */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 16384) {
        reject(new Error('payload too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max).trim() : '')

const claimsDir = () => join(root, 'content/ops/claims')

async function writeClaim(dir, file, record) {
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, file), JSON.stringify(record, null, 2) + '\n', 'utf8')
}

async function readClaims() {
  try {
    const files = (await readdir(claimsDir())).filter((f) => f.endsWith('.json')).sort()
    return await Promise.all(files.map((f) => readFile(join(claimsDir(), f), 'utf8').then(JSON.parse)))
  } catch {
    return []
  }
}

/** 找某项目最早的收到认领（incoming），返回认领方名与时间 */
async function findIncomingClaim(projectId) {
  const all = await readClaims()
  const hit = all
    .filter((c) => c.direction === 'incoming' && c.projectId === projectId)
    .sort((a, b) => (a.receivedAt || '').localeCompare(b.receivedAt || ''))[0]
  return hit ? { claimedBy: hit.claimerName, claimedAt: hit.receivedAt } : { claimedBy: null, claimedAt: null }
}

server.listen(port, () => {
  console.log(`personal-hq ready: http://localhost:${port}  (API: /api/profile, /api/works)`)
})
