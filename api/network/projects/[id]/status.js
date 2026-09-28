// Vercel Serverless Function：GET /api/network/projects/[id]/status
// 联邦轮询端点（只对已认领项目同步；返回认领状态与进度，不含联系方式）。
// 静态通道无动态认领数据，降级返回项目本身状态；完整能力见 node server.mjs 通道。
import projects from '../../../../src/data/projects.json'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { id } = req.query
  const p = projects.find((x) => x.slug === id)
  if (!p) return res.status(404).json({ error: 'project not found' })
  res.status(200).json({
    projectId: id,
    projectName: p.title,
    status: p.type === 'delivered' ? 'delivered' : 'open',
    claimedBy: null,
    claimedAt: null,
    progress: '',
    updatedAt: new Date().toISOString(),
  })
}
