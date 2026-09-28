import { useEffect, useRef, useState } from 'react'

/**
 * 代理层：数字分身聊天入口（占位 UI）。
 *
 * 当前为纯前端占位：回复由下方 rules() 本地规则生成，
 * 仅用于演示交互。接入真实后端时：
 *   1. 将 /agent-prompt.md 全文作为 system prompt
 *   2. 用 /api/profile 与 /api/works 的返回作为事实数据
 *   3. 把 send() 中的本地规则替换为对 LLM API 的调用
 */

// 开场白与 agent-prompt.md 中约定的保持一致
const GREETING = '你好，我是张三的数字分身（示例站）。他发起项目、节点认领、按结果分佣——想认领项目、加入网络，或带项目来发布，都可以问我。'

const QUICK_QUESTIONS = ['有什么项目可以认领？', '怎么加入这个网络？', '怎么联系他？']

export default function AgentChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'agent', text: GREETING }])
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  // 新消息后滚到底部
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function send(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((m) => [...m, { role: 'user', text: trimmed }, { role: 'agent', text: rules(trimmed) }])
    setInput('')
  }

  return (
    <>
      {/* 悬浮入口按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? '收起数字分身对话' : '展开数字分身对话'}
        className="fixed bottom-5 right-5 z-50 flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[13px] shadow-sm transition-colors hover:border-accent/60"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-status" aria-hidden="true" />
        数字分身
      </button>

      {/* 对话面板 */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[26rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-[13.5px] font-medium">数字分身</p>
              <p className="text-[11.5px] text-muted">占位 UI · 未接入后端</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="关闭对话"
              className="text-muted transition-colors hover:text-fg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* 消息列表 */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-lg bg-accent-soft px-3 py-2 text-[13.5px] leading-relaxed'
                      : 'max-w-[85%] rounded-lg border border-line px-3 py-2 text-[13.5px] leading-relaxed'
                  }
                >
                  {m.text}
                  {m.role === 'agent' && i > 0 && (
                    <p className="mt-1.5 text-[11px] text-muted">演示回复 · 接入后端后由 agent-prompt.md 驱动</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 快捷问题 */}
          <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-line px-3 py-1 text-[12px] text-muted transition-colors hover:border-accent/60 hover:text-fg"
              >
                {q}
              </button>
            ))}
          </div>

          {/* 输入区 */}
          <form
            className="flex items-center gap-2 border-t border-line px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="问我任何关于他的问题…"
              aria-label="输入问题"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md border border-line px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:border-accent/60 hover:text-fg"
            >
              发送
            </button>
          </form>
        </div>
      )}
    </>
  )
}

/**
 * 占位回复规则：关键词路由到站内页面。
 * 仅演示分身的导航职责，真实回复由后端 LLM 生成。
 */
function rules(text) {
  const t = text.toLowerCase()
  const has = (...words) => words.some((w) => t.includes(w))

  if (has('产品', '作品', '做什', 'works', '案例'))
    return '/works 是他的项目案例复盘：示例作品A · 品牌短视频获客体系、示例作品B · 获客工具 0-1。（占位内容，替换为你的真实案例）'
  if (has('文章', '写作', '写了', '最近写', 'writing', '博客'))
    return '他在 /writing 写复盘与方法论：协作网络、项目承接说明书五要素等，按时间倒序。（占位内容）'
  if (has('经历', '履历', '是谁', '关于', 'about'))
    return '他是张三（示例站长），项目发起人 / 独立开发者。完整时间线见 /about。'
  if (has('获客', '短视频', '投流', '投放', '代运营', '流量'))
    return '内容获客是联盟的示例能力：示例项目A、示例项目B 都在项目池里，详见 /projects。'
  if (has('联盟', '网络', '成员', 'network', '伙伴'))
    return '他和独立开发者、设计师、内容创作者组成了协作联盟，成员见 /network。'
  if (has('项目', '招募', '需求', '认领', 'projects'))
    return '联盟项目池分「招募中」和「已交付」，正在招募的需求见 /projects。'
  if (has('联系', '合作', '邮件', 'email', '咨询', '商务'))
    return '他开放项目认领与合作。邮箱：zhangsan@example.com。（占位联系方式，替换为你的）'
  if (has('机会', '合伙', '操盘', '加入'))
    return '他目前的状态是开放项目认领与合作，可以直接邮件联系，详见 /about 的联系方式。'
  if (has('订阅', 'subscribe', 'newsletter', '邮件列表'))
    return '订阅入口在 /subscribe，月度一封，无广告，可随时退订。'
  if (has('你好', 'hi', 'hello', '在吗'))
    return '你好。想了解他的作品、文章、经历，或有合作意向，都可以继续问我。'
  return '这个问题我先记下了。目前我只是占位分身，还没接入后端——接入后我会基于 agent-prompt.md 如实回答。你也可以先看 /works 与 /writing。'
}
