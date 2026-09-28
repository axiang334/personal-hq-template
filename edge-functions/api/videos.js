// EdgeOne Pages 边缘函数：GET /api/videos
// 返回 { count, items }，与 openapi.yaml 中 VideosResponse 定义一致
import videos from '../../src/data/videos.json'

export default function onRequest() {
  return new Response(JSON.stringify({ count: videos.length, items: videos }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  })
}
