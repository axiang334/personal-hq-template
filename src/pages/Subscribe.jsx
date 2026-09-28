import { useState } from 'react'
import Seo from '../components/Seo.jsx'
import { absUrl, profile } from '../data/site.js'

// 结构层：订阅页 WebPage 结构化数据
const subscribeLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `订阅 ${profile.name} 的月度邮件`,
  url: absUrl('/subscribe'),
  description: '月度邮件订阅：作品进展、长文与工具推荐。无广告，可随时退订。',
}

export default function Subscribe() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | error | done
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    const value = email.trim()
    // 前端校验：简单邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('请输入有效的邮箱地址')
      setState('error')
      return
    }
    // 占位提交：接入邮件服务（Buttondown / Listmonk / 自建 API）后替换为真实请求
    setState('done')
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="订阅"
        description="订阅月度邮件：作品进展、长文与工具推荐。无广告，可随时退订。"
        jsonLd={subscribeLd}
      />

      <div className="max-w-xl">
        <h1 className="font-serif text-2xl">订阅月度邮件</h1>
        <p className="mt-3 text-[14.5px] leading-[1.9] text-muted">
          每月一封：近期作品进展、本月值得读的长文与工具。不追热点、无广告、可随时退订。
        </p>

        {state === 'done' ? (
          <div className="mt-8 rounded-lg border border-status/40 bg-status/5 p-5">
            <p className="text-[14.5px] text-status">已提交订阅请求</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              这是占位表单，还没有真正发送。部署时把表单接入你的邮件服务即可生效。
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8" noValidate>
            <label htmlFor="email" className="block text-[13px] text-muted">
              邮箱地址
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setState('idle')
                }}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={state === 'error'}
                className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-muted focus:border-accent/60"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-fg px-5 py-2.5 text-[13.5px] font-medium text-bg transition-opacity hover:opacity-85"
              >
                订阅
              </button>
            </div>
            {state === 'error' && <p className="mt-2 text-[12.5px] text-accent">{error}</p>}
            <p className="mt-3 text-[12.5px] text-muted">
              也可以通过 RSS 阅读器订阅：{profile.socials.find((s) => s.name === 'RSS')?.url ?? '/rss.xml'}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
