// Vercel Serverless Function：GET /api/works
// 返回 { count, items }，与 openapi.yaml 中 WorksResponse 定义一致
import works from '../src/data/works.json'

export default function handler(_req, res) {
  res.status(200).json({ count: works.length, items: works })
}
