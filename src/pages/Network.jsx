import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import { profile, network, absUrl } from '../data/site.js'
import { claimEndpoint } from '../../scripts/federation.mjs'

// 结构层：协作网络页 —— 集合 + 成员 ItemList（Person）
const networkLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${profile.name}的协作网络`,
  url: absUrl('/network'),
  description: '结果导向的商业协作网络（示例站）：张三发起项目，独立设计师、开发者、内容创作者认领交付，按结果分佣。',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: network.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: m.name,
        jobTitle: m.role,
        description: m.claim || m.bio,
        url: m.siteUrl,
        image: absUrl(m.avatar),
        keywords: m.tags.join(', '),
      },
    })),
  },
}

/** 状态徽章：联盟标准 status 枚举（门户等处复用） */
function FedStatus({ status }) {
  const open = status === 'open'
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11.5px] ${
        open ? 'border-accent/40 text-accent' : 'border-line text-muted'
      }`}
    >
      {open ? '可认领' : '已交付'}
    </span>
  )
}
void FedStatus

/** 联邦原则：认领即连接，未认领不产生数据绑定。浏览（拉取）只是看，认领才落库。 */
function FedProjects({ apiUrl }) {
  const [state, setState] = useState('idle') // idle | loading | ok | error
  const [items, setItems] = useState([])
  // 认领动作状态：projectId → claiming | claimed | failed
  const [claimState, setClaimState] = useState({})

  async function toggle() {
    if (state !== 'idle') {
      setState('idle')
      setItems([])
      return
    }
    setState('loading')
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 10000)
      const res = await fetch(apiUrl, { signal: ctrl.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
      setState('ok')
    } catch {
      setState('error')
    }
  }

  /** 认领：POST 对方 /api/network/claim（项目ID + 我的节点信息 + 联系方式）；
   *  对方确认后，才在本站 content/ops/claims/ 落一条 outbound 绑定记录。 */
  async function handleClaim(p) {
    const pid = p.projectId || p.projectName
    setClaimState((s) => ({ ...s, [pid]: 'claiming' }))
    try {
      // 第一步：通知对方
      const r1 = await fetch(claimEndpoint(apiUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: pid,
          projectName: p.projectName,
          claimer: { name: profile.name, site: profile.siteUrl },
          contact: profile.email,
          message: `来自 ${profile.siteUrl} 的认领`,
        }),
      })
      if (!r1.ok) throw new Error(`对方接口 HTTP ${r1.status}`)
      // 第二步：对方确认后才在本站落库（与对方项目建立绑定）
      const r2 = await fetch('/api/ops/outbound-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: pid,
          projectName: p.projectName,
          nodeApiUrl: apiUrl,
          contact: profile.email,
        }),
      })
      if (!r2.ok) throw new Error(`本站落库 HTTP ${r2.status}`)
      setClaimState((s) => ({ ...s, [pid]: 'claimed' }))
    } catch {
      setClaimState((s) => ({ ...s, [pid]: 'failed' }))
    }
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <button
        type="button"
        onClick={toggle}
        className="rounded-md border border-accent/50 px-3 py-1.5 text-[12.5px] text-accent transition-colors hover:bg-accent-soft"
      >
        {state === 'loading' ? '拉取中…' : state === 'idle' ? '查看TA开放的项目 ↓' : '收起 ↑'}
      </button>

      {state === 'error' && (
        <p className="mt-3 rounded-md border border-dashed border-line p-3.5 text-[12.5px] leading-relaxed text-muted">
          暂时无法获取TA的开放项目（对方接口不可达或未开放跨域）。可以直接访问TA的独立站联系。
        </p>
      )}

      {state === 'ok' && (
        <div className="mt-3">
          <p className="text-[12px] leading-relaxed text-muted">
            已实时拉取 {items.length} 个开放项目（仅展示，不产生同步）。想接哪个，点「认领」——
            对方确认后才在你我的台账之间建立绑定。
          </p>
          {items.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-line p-3.5 text-[12.5px] text-muted">
              TA 暂未开放任何项目。
            </p>
          ) : (
            <ul className="mt-2.5 grid gap-2.5">
              {items.map((p, i) => {
                const pid = p.projectId || p.projectName
                const cs = claimState[pid]
                return (
                  <li key={i} className="rounded-md border border-line bg-bg p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h4 className="text-[14px] font-medium">{p.projectName}</h4>
                      {p.claimUrl && (
                        <a
                          href={p.claimUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11.5px] text-muted hover:text-accent"
                        >
                          查看详情 ↗
                        </a>
                      )}
                    </div>
                    <dl className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-muted">
                      <div className="flex gap-3">
                        <dt className="w-16 shrink-0">需求</dt>
                        <dd className="min-w-0 flex-1">{p.need}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-16 shrink-0">分佣规则</dt>
                        <dd className="min-w-0 flex-1 text-accent">{p.reward}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => handleClaim(p)}
                      disabled={cs === 'claiming' || cs === 'claimed'}
                      title={
                        cs === 'claimed'
                          ? '已建立绑定：对方后台已记录，你的工作台已生成认领记录'
                          : '向对方发送认领请求（携带项目ID、你的节点信息与联系方式）'
                      }
                      className={`mt-2.5 rounded-md border px-3 py-1 text-[12px] transition-colors ${
                        cs === 'claimed'
                          ? 'border-line text-muted'
                          : cs === 'failed'
                            ? 'border-red-300 text-red-500 hover:bg-red-50'
                            : 'border-accent/50 text-accent hover:bg-accent-soft'
                      } disabled:opacity-70`}
                    >
                      {cs === 'claiming'
                        ? '认领中…'
                        : cs === 'claimed'
                          ? '已认领 ✓（绑定已建立）'
                          : cs === 'failed'
                            ? '失败，点击重试'
                            : '认领'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function Network() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="联盟网络"
        description={`${profile.name}的协作网络：结果导向，节点认领项目、按交付结果分佣。`}
        jsonLd={networkLd}
      />

      <header className="mb-10">
        <h1 className="font-serif text-2xl">联盟网络</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
          这是结果导向的网络。我不养团队，只组织最有战斗力的节点：独立设计师、开发者、内容创作者。
          联盟是联邦式的——每个节点都有自己的独立站与开放接口，项目在各站之间互相拉取、互相认领。
        </p>
      </header>

      {/* 协作规则：加入说明 */}
      <section className="rounded-lg border border-line bg-accent-soft/50 p-6">
        <h2 className="font-serif text-[16px]">协作规则</h2>
        <blockquote className="mt-3 border-l-2 border-accent/50 pl-4 text-[14.5px] leading-[1.9]">
          这是结果导向的网络。我们不看你的出身、过程，只看你的交付结果。
          你可以认领项目，也可以带着你的项目来发布，我们互相协同。
        </blockquote>
        <ul className="mt-4 grid gap-2.5 text-[13.5px] leading-relaxed text-muted">
          <li className="flex gap-3">
            <span className="w-14 shrink-0 text-fg">怎么进</span>
            <span className="min-w-0 flex-1">
              带着一个你能交付的能力来，直接说明你接过什么、能交付什么。不需要简历，不需要背书。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-14 shrink-0 text-fg">怎么合作</span>
            <span className="min-w-0 flex-1">
              从 <Link to="/projects" className="text-accent hover:underline">/projects</Link>{' '}
              认领项目，每个项目都写明了需要交付的结果和分佣机制；也可以把你的项目发给我，由我组织节点一起交付。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-14 shrink-0 text-fg">怎么结算</span>
            <span className="min-w-0 flex-1">
              按最终交付结果分佣：基础费 + 结果提成。过程不管，结果说话；项目结束，关系还在。
            </span>
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/projects"
            className="rounded-md border border-accent/50 px-4 py-1.5 text-[13px] text-accent transition-colors hover:bg-accent-soft"
          >
            查看项目池
          </Link>
          <Link
            to="/about"
            className="rounded-md border border-line px-4 py-1.5 text-[13px] text-muted transition-colors hover:border-accent/50 hover:text-fg"
          >
            联系我
          </Link>
        </div>
      </section>

      {/* 成员列表 */}
      <section className="mt-12">
        <h2 className="mb-4 font-serif text-[17px]">网络节点</h2>
        <ul className="grid gap-4">
          {network.map((m) => (
            <li
              key={m.slug}
              className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent/50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <a href={m.siteUrl} target="_blank" rel="noreferrer" className="shrink-0" title={`访问${m.siteName}`}>
                  <img
                    src={m.avatar}
                    alt={`${m.name}的头像`}
                    width="64"
                    height="64"
                    className="h-16 w-16 rounded-full border border-line"
                  />
                </a>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-serif text-[16.5px]">{m.name}</h3>
                    <a
                      href={m.siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12.5px] text-accent hover:underline"
                    >
                      {m.siteName} ↗
                    </a>
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted">{m.role}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{m.bio}</p>
                  {m.claim && (
                    <p className="mt-2 rounded border border-accent/30 bg-accent-soft/40 px-3 py-1.5 text-[12.5px] text-accent">
                      {m.claim}
                    </p>
                  )}
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {m.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-muted"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>

                  {/* 联邦接口：跨站拉取对方开放项目 */}
                  {m.apiUrl ? (
                    <FedProjects apiUrl={m.apiUrl} />
                  ) : (
                    <p className="mt-3 border-t border-line pt-3 text-[12px] text-muted/70">
                      未开放项目接口 · 可通过独立站直接联系
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
