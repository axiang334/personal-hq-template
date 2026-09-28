// Vercel Serverless Function：GET /api/network
// 返回 { count, items }，与 openapi.yaml 中 NetworkResponse 定义一致
import network from '../src/data/network.json'

export default function handler(_req, res) {
  res.status(200).json({ count: network.length, items: network })
}
