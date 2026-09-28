// EdgeOne Pages 边缘函数：GET /api/network
// 返回 { count, items }，与 openapi.yaml 中 NetworkResponse 定义一致
import network from '../../src/data/network.json'

export default function onRequest() {
  return new Response(JSON.stringify({ count: network.length, items: network }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  })
}
