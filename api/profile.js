// Vercel Serverless Function：GET /api/profile
// 部署时由 esbuild 打包，JSON 会被内联进产物；与 server.mjs 本地实现行为一致
import profile from '../src/data/profile.json'

export default function handler(_req, res) {
  res.status(200).json(profile)
}
