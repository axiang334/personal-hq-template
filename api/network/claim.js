// Vercel Serverless Function：POST /api/network/claim
// 联邦认领接收端（联盟标准：认领即连接，未认领不产生数据绑定）。
// 注意：Vercel 函数文件系统只读，无法落盘——此通道降级为确认接收；
// 完整落盘能力（写 content/ops/claims/）请使用 node server.mjs 部署通道。
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  if (!body.projectId || !body.claimer?.name) {
    return res.status(400).json({ error: 'projectId 与 claimer.name 为必填字段' })
  }
  res.status(200).json({
    ok: true,
    status: 'received',
    persisted: false,
    note: '静态通道降级：认领已确认但未落盘，请节点通过 node 通道或邮件补录。',
  })
}
