// Vercel Serverless Function：GET /api/network/projects
// 联邦开放接口：输出联盟标准结构（projectName/need/reward/status/publisher/claimUrl），
// 与 scripts/federation.mjs、openapi.yaml 中 FederationProject 定义一致。
// 开放 CORS，供联盟节点跨站拉取。
import projects from '../../src/data/projects.json'
import profile from '../../src/data/profile.json'
import { federationProjectsResponse } from '../../scripts/federation.mjs'

export default function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json(federationProjectsResponse(projects, profile.siteUrl))
}
