// EdgeOne Pages 边缘函数：GET /api/works
// 返回 { count, items }，与 openapi.yaml 中 WorksResponse 定义一致
import works from '../../src/data/works.json'

export default function onRequest() {
  return new Response(JSON.stringify({ count: works.length, items: works }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  })
}
