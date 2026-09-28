// EdgeOne Pages 边缘函数：GET /api/network/projects
// 联邦开放接口：输出联盟标准结构（projectName/need/reward/status/publisher/claimUrl），
// 与 scripts/federation.mjs、openapi.yaml 中 FederationProject 定义一致。
// 开放 CORS，供联盟节点跨站拉取。
import projects from '../../../src/data/projects.json'
import profile from '../../../src/data/profile.json'
import { federationProjectsResponse } from '../../../scripts/federation.mjs'

export function onRequest() {
  return new Response(JSON.stringify(federationProjectsResponse(projects, profile.siteUrl)), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300',
    },
  })
}
