// EdgeOne Pages 边缘函数：POST /api/network/claim
// 联邦认领接收端（联盟标准：认领即连接，未认领不产生数据绑定）。
// 边缘函数无持久文件系统，降级为确认接收；完整落盘能力见 node server.mjs 通道。
export function onRequest({ request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type',
      },
    })
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' },
    })
  }
  return request.json().then((body) => {
    if (!body.projectId || !body.claimer?.name) {
      return new Response(JSON.stringify({ error: 'projectId 与 claimer.name 为必填字段' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' },
      })
    }
    return new Response(
      JSON.stringify({
        ok: true,
        status: 'received',
        persisted: false,
        note: '边缘通道降级：认领已确认但未落盘，请节点通过 node 通道或邮件补录。',
      }),
      { headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' } },
    )
  })
}
