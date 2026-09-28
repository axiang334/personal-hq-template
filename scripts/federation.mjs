/**
 * 联邦协作协议：项目开放接口的统一输出结构（wire format）。
 *
 * 核心原则：认领即连接，未认领不产生数据绑定。
 *   - 浏览/拉取（GET /api/network/projects）只是读取展示，不产生任何同步；
 *   - 只有认领（POST /api/network/claim）之后，双方才为该项目建立数据连接；
 *   - 此后仅对已认领的项目双向同步进度与交付（轮询 GET /api/network/projects/{projectId}/status，后续可升级 Webhook）。
 *
 * 联盟标准字段（所有节点必须返回）：
 *   projectId / projectName / need / reward / status / publisher / claimUrl
 *
 * status 枚举：open（可认领）/ delivered（已交付）
 * claimUrl：认领入口（展示用）；机器认领走 POST /api/network/claim（携带 projectId）。
 *
 * 其余字段为可选扩展（联盟节点可自行增加），联盟客户端不应依赖它们。
 * 三条通道（server.mjs / Vercel api/ / EdgeOne edge-functions/）共用本模块，保证口径一致。
 */

/** 内部项目记录 → 联盟标准结构 */
export function toFederationProject(p, siteUrl) {
  const base = (siteUrl || '').replace(/\/$/, '')
  return {
    projectId: p.slug,
    projectName: p.title,
    need: p.need || p.summary || '',
    reward: p.reward || '面谈',
    status: p.type === 'delivered' ? 'delivered' : 'open',
    publisher: p.owner || '',
    claimUrl: `${base}/projects#${p.slug}`,
    // ---- 可选扩展 ----
    maturity: p.maturity,
    baseline: p.baseline,
    criteria: p.criteria,
    tags: p.tags,
    summary: p.summary,
    date: p.date,
  }
}

/** 项目数组 → { count, items } 联盟响应体 */
export function federationProjectsResponse(items, siteUrl) {
  const mapped = items.map((p) => toFederationProject(p, siteUrl))
  return { count: mapped.length, items: mapped }
}

/** 由某节点的开放项目接口地址，推导其认领接收端点（同域约定） */
export function claimEndpoint(apiUrl) {
  return new URL('/api/network/claim', apiUrl).href
}

/** 由某节点的开放项目接口地址，推导其项目状态查询端点（轮询同步用） */
export function projectStatusEndpoint(apiUrl, projectId) {
  return new URL(`/api/network/projects/${encodeURIComponent(projectId)}/status`, apiUrl).href
}
