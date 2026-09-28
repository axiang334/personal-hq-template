// Vercel Serverless Function：GET /api/videos
// 返回 { count, items }，与 openapi.yaml 中 VideosResponse 定义一致
import videos from '../src/data/videos.json'

export default function handler(_req, res) {
  res.status(200).json({ count: videos.length, items: videos })
}
