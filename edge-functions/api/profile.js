// EdgeOne Pages 边缘函数：GET /api/profile
// 路由规则：edge-functions/api/profile.js → /api/profile
// （若项目沿用旧版 functions/ 目录约定，把本目录改名为 functions/api/ 即可，内容不变）
import profile from '../../src/data/profile.json'

export default function onRequest() {
  return new Response(JSON.stringify(profile), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  })
}
