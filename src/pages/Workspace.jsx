import { useEffect, useState } from 'react'
import Seo from '../components/Seo.jsx'
import { workspace, permissions, opsProjects, opsNodes, opsSettlements } from '../data/site.js'

const UNLOCK_KEY = 'hq-workspace-unlocked'

/**
 * 内部工作台 · 三角结构 + 客户门户：
 * 底层一套台账数据（content/ops/）+ 字段级权限矩阵（permissions.json），
 * 解锁后四种角色视图——发起端 / 项目端 / 认领端 / 客户视图（单项目门户）。
 *
 * 客户专属链接：/workspace?project=<accessKey>&token=<sha256(key) 前 8 位>
 * 免门禁直达，只渲染该项目的客户视图（链接即钥匙，勿外传；真实强权限由 Notion 保障）。
 */

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 字段级权限：某角色在某个矩阵下可见的字段配置（完全由 permissions.json 驱动） */
function visibleFields(matrix, role) {
  return (matrix || []).filter((f) => f.roles?.includes(role))
}

const canSee = (matrix, field, role) =>
  (matrix || []).find((f) => f.field === field)?.roles?.includes(role)

/** 字段值渲染：metrics 是 [{label,value}]，team 是 [{name,duty}]，其余为标量或字符串数组 */
function FieldValue({ field, item }) {
  const v = item[field]
  if (v == null || v === '') return <span className="text-muted/70">—</span>
  if (field === 'metrics' && Array.isArray(v)) {
    return (
      <span className="flex flex-wrap gap-x-4 gap-y-1">
        {v.map((m) => (
          <span key={m.label}>
            {m.label} <strong className="font-medium text-fg">{m.value}</strong>
          </span>
        ))}
      </span>
    )
  }
  if (field === 'team' && Array.isArray(v)) {
    return v.length ? (
      <span className="flex flex-wrap gap-x-4 gap-y-1">
        {v.map((m) => (
          <span key={m.name}>
            {m.name} <span className="text-muted">· {m.duty}</span>
          </span>
        ))}
      </span>
    ) : (
      <span className="text-muted/70">待认领</span>
    )
  }
  if (Array.isArray(v)) return v.join('、')
  if (typeof v === 'boolean') return v ? '是' : '否'
  return v
}

const statusTone = (s) =>
  s === '已交付' || s === '已结算'
    ? 'border-line text-muted'
    : s === '招募中' || s === '待结算'
      ? 'border-accent/40 text-accent'
      : 'border-line text-fg'

/** 发起端表格：列 = 权限矩阵允许的字段 */
function OpsTable({ rows, matrix, role = 'owner' }) {
  const fields = visibleFields(matrix, role)
  if (!rows.length || !fields.length)
    return <p className="rounded-lg border border-dashed border-line p-5 text-[13px] text-muted">该视图下没有可见记录。</p>
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.field} className="whitespace-nowrap px-3 py-2.5 font-normal text-muted">
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line align-top">
              {fields.map((f) => (
                <td key={f.field} className="min-w-[90px] px-3 py-2.5 leading-relaxed">
                  <FieldValue field={f.field} item={r} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 项目端 / 认领端卡片：逐行渲染矩阵允许的字段（不可见字段整行不出现） */
function RecordCard({ item, matrix, role }) {
  const fields = visibleFields(matrix, role).filter((f) => f.field !== 'name' && f.field !== 'status')
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-serif text-[15.5px]">{item.name || item.project}</h3>
        {(item.status || item.date) && (
          <span className={`rounded-full border px-2.5 py-0.5 text-[11.5px] ${statusTone(item.status)}`}>
            {item.status || item.date}
          </span>
        )}
      </div>
      <dl className="mt-3 space-y-2 text-[13px] leading-relaxed">
        {fields.map((f) => (
          <div key={f.field} className="flex gap-3">
            <dt className="w-[76px] shrink-0 text-[12px] leading-relaxed text-muted">{f.label}</dt>
            <dd className="min-w-0 flex-1">
              <FieldValue field={f.field} item={item} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** 门户字段中文标签 */
const PORTAL_LABELS = {
  name: '项目名', status: '状态', startDate: '开始时间', client: '客户',
  team: '服务团队', stage: '当前阶段', progress: '进度说明',
  deliverables: '交付结果', metrics: '核心数据', billing: '结算环节',
}

/**
 * 客户门户（单项目视图）：五块内容，字段可见性由权限矩阵（role=client）把关——
 * 项目概览 / 认领情况 / 交付进度 / 数据表现 / 结算状态（客户侧）。
 * 分佣规则、内部成本、节点个人分佣不在渲染范围内，矩阵改为不可见即自动消失。
 */
function ClientPortal({ project: p, matrix }) {
  const show = (field) => canSee(matrix, field, 'client')
  const blocks = [
    { title: '项目概览', rows: [['name', p.name], ['status', p.status], ['startDate', p.startDate], ['client', p.client]] },
    { title: '认领情况', rows: [['team', p.team]] },
    { title: '交付进度', rows: [['stage', p.stage], ['progress', p.progress], ['deliverables', p.deliverables]] },
    { title: '数据表现', rows: [['metrics', p.metrics]] },
    { title: '结算状态', rows: [['billing', p.billing]] },
  ]
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="font-serif text-[17px]">{p.name}</h2>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11.5px] ${statusTone(p.status)}`}>{p.status}</span>
        </div>
        <p className="mt-1 text-[12.5px] text-muted">
          客户项目视图 · 数据由张三团队更新
        </p>
      </div>

      {blocks.map((b) => {
        const visible = b.rows.filter(([f, v]) => show(f) && v != null && v !== '')
        if (!visible.length) return null
        return (
          <section key={b.title} className="rounded-lg border border-line bg-surface p-5">
            <h3 className="text-[13px] font-medium tracking-wide text-muted">{b.title}</h3>
            <dl className="mt-3 space-y-2 text-[13.5px] leading-relaxed">
              {visible.map(([f]) => (
                <div key={f} className="flex gap-3">
                  <dt className="w-[76px] shrink-0 text-[12px] leading-relaxed text-muted">
                    {PORTAL_LABELS[f] || f}
                  </dt>
                  <dd className="min-w-0 flex-1">
                    <FieldValue field={f} item={p} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}

      <p className="text-center text-[11.5px] text-muted/70">
        本链接仅展示该项目数据，请勿外传 · 如有疑问联系张三 zhangsan@example.com
      </p>
    </div>
  )
}

/** 角色切换 tab（四个） */
function RoleTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-bg p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[12.5px] transition-colors ${
            active === t.key ? 'bg-surface font-medium text-fg shadow-sm' : 'text-muted hover:text-fg'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/**
 * 联邦认领台账（认领即连接）：
 * - 只显示通过认领动作产生的绑定记录（outbound = 我认领的；incoming = 对方认领我的）
 * - 数据实时读 /api/ops/claims（认领成功即刻可见，无需重新构建）
 * - 「同步认领项目」= 轮询一次：对每条 outbound 拉对方 status 端点刷新进度
 */
function FedClaims() {
  const [claims, setClaims] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const load = () => fetch('/api/ops/claims').then((r) => r.json()).then((d) => setClaims(d.items || [])).catch(() => setClaims([]))
  useEffect(() => {
    load()
  }, [])

  async function sync() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const r = await fetch('/api/ops/sync', { method: 'POST' })
      const d = await r.json()
      setSyncMsg(d.ok ? `已同步 ${d.synced}/${d.results.length} 条认领记录` : '同步失败，稍后再试')
      await load()
    } catch {
      setSyncMsg('同步失败，稍后再试')
    } finally {
      setSyncing(false)
    }
  }

  const outbound = (claims || []).filter((c) => c.direction === 'outbound')
  const incoming = (claims || []).filter((c) => c.direction === 'incoming')
  const remoteTone = (s) => (s === 'claimed' ? 'text-accent' : s === 'delivered' ? 'text-muted' : 'text-fg')

  return (
    <section>
      <h2 className="mb-1 font-serif text-[15.5px]">联邦认领（认领即连接）</h2>
      <p className="mb-3 text-[12px] leading-relaxed text-muted">
        浏览对方项目不产生任何同步；只有点击「认领」后，双方才为该项目建立绑定。进度同步只发生在已认领项目上。
      </p>

      <h3 className="mb-2 text-[12.5px] font-medium text-muted">我认领的（outbound · 与对方项目绑定）</h3>
      {outbound.length === 0 ? (
        <p className="rounded-md border border-dashed border-line p-3.5 text-[12.5px] text-muted">
          还没有认领外部项目。去 /network 拉取联盟节点的项目，点「认领」即可建立绑定。
        </p>
      ) : (
        <ul className="grid gap-2">
          {outbound.map((c) => (
            <li key={c.claimId} className="rounded-md border border-line bg-surface px-4 py-3 text-[12.5px]">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <strong className="font-medium text-fg">{c.projectName}</strong>
                <span className={`text-[11.5px] ${remoteTone(c.remoteStatus)}`}>
                  对方状态：{c.remoteStatus === 'claimed' ? '已认领' : c.remoteStatus === 'delivered' ? '已交付' : c.remoteStatus || '待同步'}
                </span>
              </div>
              <p className="mt-1 text-muted">
                绑定节点：{c.nodeApiUrl ? new URL(c.nodeApiUrl).host : '—'} · 认领时间{' '}
                {(c.claimedAt || '').slice(0, 10)}
                {c.lastSyncedAt && ` · 最后同步 ${c.lastSyncedAt.slice(0, 16).replace('T', ' ')}`}
              </p>
              {c.progress && <p className="mt-1 text-muted">对方进度：{c.progress}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={sync}
          disabled={syncing || !outbound.length}
          className="rounded-md border border-accent/50 px-3 py-1.5 text-[12.5px] text-accent transition-colors hover:bg-accent-soft disabled:opacity-40"
        >
          {syncing ? '同步中…' : '同步认领项目'}
        </button>
        {syncMsg && <span className="text-[12px] text-muted">{syncMsg}</span>}
      </div>

      <h3 className="mb-2 mt-5 text-[12.5px] font-medium text-muted">收到的认领（incoming · 对方后台同样有这条）</h3>
      {incoming.length === 0 ? (
        <p className="rounded-md border border-dashed border-line p-3.5 text-[12.5px] text-muted">
          暂无收到的认领。
        </p>
      ) : (
        <ul className="grid gap-2">
          {incoming.map((c) => (
            <li key={c.claimId} className="rounded-md border border-line bg-surface px-4 py-3 text-[12.5px]">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <strong className="font-medium text-fg">{c.projectName}</strong>
                <span className="text-[11.5px] text-muted">{(c.receivedAt || '').slice(0, 16).replace('T', ' ')}</span>
              </div>
              <p className="mt-1 text-muted">
                认领方：{c.claimerName}
                {c.claimerSite && (
                  <>
                    {' '}
                    <a href={c.claimerSite} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      {new URL(c.claimerSite).host} ↗
                    </a>
                  </>
                )}
                {c.contact && ` · ${c.contact}`}
              </p>
              {c.message && <p className="mt-1 text-muted">说明：{c.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Workspace() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === '1')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  // 客户门户模式：URL 带 ?project=<key>&token=<sha8> 时免密直达
  const [portalKey, setPortalKey] = useState(null)
  const [portalError, setPortalError] = useState('')
  // 发起端为每个项目算好的专属链接 token
  const [tokens, setTokens] = useState({})
  // 视图状态：角色 tab + 客户/节点/门户预览身份
  const [role, setRole] = useState('owner')
  const clientKeys = [...new Set(opsProjects.map((p) => p.clientKey).filter((k) => k && k !== 'internal'))]
  const [clientKey, setClientKey] = useState(clientKeys[0] || '')
  const [nodeKey, setNodeKey] = useState(opsNodes[0]?.nodeKey || '')
  const [portalPreview, setPortalPreview] = useState(opsProjects.find((p) => p.accessKey)?.accessKey || '')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const key = q.get('project')
    const token = q.get('token')
    if (key && token) {
      sha256(key).then((h) => {
        if (h.startsWith(token)) setPortalKey(key)
        else setPortalError('链接无效或已失效，请联系张三获取最新链接。')
      })
    } else if (key) {
      setPortalError('链接缺少访问凭证，请联系张三获取完整链接。')
    }
    // 为全部项目预生成专属链接 token（发起端分发用）
    Promise.all(
      opsProjects.filter((p) => p.accessKey).map(async (p) => [p.accessKey, (await sha256(p.accessKey)).slice(0, 8)]),
    ).then((pairs) => setTokens(Object.fromEntries(pairs)))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pwd) return
    setChecking(true)
    setError('')
    try {
      const hash = await sha256(pwd)
      if (hash === workspace.passwordSha256) {
        sessionStorage.setItem(UNLOCK_KEY, '1')
        setUnlocked(true)
      } else {
        setError('密码不对，再想想。')
      }
    } catch {
      setError('当前环境不支持加密校验，请更换现代浏览器。')
    } finally {
      setChecking(false)
      setPwd('')
    }
  }

  const siteBase = window.location.origin + '/workspace'
  const portalUrl = (p) =>
    tokens[p.accessKey] ? `${siteBase}?project=${p.accessKey}&token=${tokens[p.accessKey]}` : ''
  const [copied, setCopied] = useState('')

  /* ---------- 解锁后的四种视图 ---------- */
  function renderView() {
    const tabs = [
      { key: 'owner', label: '发起端（我的视图）' },
      { key: 'client', label: '项目端（客户视图）' },
      { key: 'node', label: '认领端（节点视图）' },
      { key: 'portal', label: '客户视图 · 项目门户' },
    ]
    const notionLink = (workspace.links || []).find((l) => l.role === role)

    return (
      <div className="grid gap-6">
        <RoleTabs tabs={tabs} active={role} onChange={setRole} />
        {permissions.roles?.find((r) => r.key === role) && (
          <p className="-mt-2 text-[13px] leading-relaxed text-muted">
            {permissions.roles.find((r) => r.key === role).desc}
          </p>
        )}

        {/* 发起端：全量台账 */}
        {role === 'owner' && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: '项目', value: opsProjects.length },
                { label: '节点', value: opsNodes.length },
                { label: '进行中', value: opsProjects.filter((p) => p.status === '进行中').length },
                { label: '未完结算', value: opsSettlements.filter((s) => s.status !== '已结算').length },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-line bg-surface p-4">
                  <p className="font-serif text-xl">{s.value}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">项目台账</h2>
              <OpsTable rows={opsProjects} matrix={permissions.projectFields} />
            </section>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">节点名册</h2>
              <OpsTable rows={opsNodes} matrix={permissions.nodeFields} />
            </section>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">结算台账</h2>
              <OpsTable rows={opsSettlements} matrix={permissions.settlementFields} />
            </section>
            <FedClaims />
            <p className="rounded-lg border border-dashed border-line p-4 text-[12.5px] leading-relaxed text-muted">
              当前为占位数据，仅作框架演示。真实分佣、成本等敏感数字请只维护在 Notion
              ——本页数据随前端打包，不要放真实金额（详见 README「安全边界」）。
            </p>
          </>
        )}

        {/* 项目端：客户视图（行级 = clientKey；字段级 = 矩阵） */}
        {role === 'client' && (
          <>
            <label className="flex items-center gap-2 text-[13px] text-muted">
              以客户身份预览
              <select
                value={clientKey}
                onChange={(e) => setClientKey(e.target.value)}
                className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent/60"
              >
                {clientKeys.map((k) => {
                  const p = opsProjects.find((x) => x.clientKey === k)
                  return (
                    <option key={k} value={k}>
                      {p?.client || k}
                    </option>
                  )
                })}
              </select>
            </label>
            <div className="grid gap-4">
              {opsProjects
                .filter((p) => p.clientKey === clientKey)
                .map((p) => (
                  <RecordCard key={p.slug} item={p} matrix={permissions.projectFields} role="client" />
                ))}
              {opsProjects.filter((p) => p.clientKey === clientKey).length === 0 && (
                <p className="rounded-lg border border-dashed border-line p-5 text-[13px] text-muted">
                  该客户暂无可见项目。
                </p>
              )}
            </div>
            <p className="rounded-lg border border-dashed border-line p-4 text-[12.5px] leading-relaxed text-muted">
              给单个项目的客户发专属直达链接，请用「客户视图 · 项目门户」tab。
            </p>
          </>
        )}

        {/* 认领端：节点视图（行级 = nodeKey） */}
        {role === 'node' && (
          <>
            <label className="flex items-center gap-2 text-[13px] text-muted">
              以节点身份预览
              <select
                value={nodeKey}
                onChange={(e) => setNodeKey(e.target.value)}
                className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent/60"
              >
                {opsNodes.map((n) => (
                  <option key={n.nodeKey} value={n.nodeKey}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">可认领项目</h2>
              <div className="grid gap-4">
                {opsProjects
                  .filter((p) => p.recruiting)
                  .map((p) => (
                    <RecordCard key={p.slug} item={p} matrix={permissions.projectFields} role="node" />
                  ))}
                {opsProjects.filter((p) => p.recruiting).length === 0 && (
                  <p className="rounded-lg border border-dashed border-line p-5 text-[13px] text-muted">
                    当前没有开放认领的项目。
                  </p>
                )}
              </div>
            </section>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">我认领的项目</h2>
              <div className="grid gap-4">
                {opsProjects
                  .filter((p) => p.nodeKey === nodeKey)
                  .map((p) => (
                    <RecordCard key={p.slug} item={p} matrix={permissions.projectFields} role="node" />
                  ))}
                {opsProjects.filter((p) => p.nodeKey === nodeKey).length === 0 && (
                  <p className="rounded-lg border border-dashed border-line p-5 text-[13px] text-muted">
                    还没有认领项目。
                  </p>
                )}
              </div>
            </section>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">我的分佣记录</h2>
              <OpsTable
                rows={opsSettlements.filter((s) => s.nodeKey === nodeKey)}
                matrix={permissions.settlementFields}
                role="node"
              />
            </section>
            <p className="rounded-lg border border-dashed border-line p-4 text-[12.5px] leading-relaxed text-muted">
              节点真实访问走 Notion 节点视图链接（按 nodeKey 筛选 + 隐藏成本与他人记录后发布），操作步骤见 README。
            </p>
          </>
        )}

        {/* 客户视图 · 项目门户：专属链接分发 + 单项目预览 */}
        {role === 'portal' && (
          <>
            <section>
              <h2 className="mb-3 font-serif text-[15.5px]">客户专属链接</h2>
              <ul className="grid gap-2.5">
                {opsProjects
                  .filter((p) => p.accessKey)
                  .map((p) => {
                    const url = portalUrl(p)
                    return (
                      <li
                        key={p.slug}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-line bg-surface px-4 py-3 text-[12.5px]"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          <strong className="font-medium text-fg">{p.name}</strong>
                          <span className="ml-2 text-muted">Key：{p.accessKey}</span>
                        </span>
                        {url ? (
                          <>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:underline"
                              title="打开门户预览"
                            >
                              预览 ↗
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(url)
                                setCopied(p.slug)
                                setTimeout(() => setCopied(''), 1500)
                              }}
                              className="rounded border border-line px-2 py-0.5 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                            >
                              {copied === p.slug ? '已复制 ✓' : '复制链接'}
                            </button>
                          </>
                        ) : (
                          <span className="text-muted/70">生成中…</span>
                        )}
                      </li>
                    )
                  })}
              </ul>
              <p className="mt-3 text-[12px] leading-relaxed text-muted">
                链接格式 <code>?project=Key&amp;token=Key 的 SHA-256 前 8 位</code>，链接即钥匙——
                客户打开即看该项目视图，无需密码；改 Key 即作废旧链接。字段可见范围由权限矩阵控制。
              </p>
            </section>

            <section>
              <h2 className="mb-3 flex flex-wrap items-center gap-3 font-serif text-[15.5px]">
                门户预览
                <select
                  value={portalPreview}
                  onChange={(e) => setPortalPreview(e.target.value)}
                  className="rounded-md border border-line bg-surface px-2.5 py-1 text-[12.5px] font-normal text-fg outline-none focus:border-accent/60"
                >
                  {opsProjects
                    .filter((p) => p.accessKey)
                    .map((p) => (
                      <option key={p.slug} value={p.accessKey}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </h2>
              {(() => {
                const p = opsProjects.find((x) => x.accessKey === portalPreview)
                return p ? <ClientPortal project={p} matrix={permissions.projectFields} /> : null
              })()}
            </section>
          </>
        )}

        {/* 当前角色的 Notion 入口 */}
        {notionLink && (
          <a
            href={notionLink.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-accent/40 bg-accent-soft/50 p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px]">{notionLink.name}</h3>
              <span className="shrink-0 text-[12.5px] text-accent">打开 ↗</span>
            </div>
            {notionLink.note && (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{notionLink.note}</p>
            )}
          </a>
        )}

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(UNLOCK_KEY)
            setUnlocked(false)
          }}
          className="self-start text-[12.5px] text-muted transition-colors hover:text-fg"
        >
          锁定并退出
        </button>
      </div>
    )
  }

  /* 客户门户模式：免密、单项目、无内部导航元素 */
  if (portalKey || portalError) {
    const p = opsProjects.find((x) => x.accessKey === portalKey)
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <Seo title="客户项目视图" description="项目进展客户视图。" noindex />
        {portalError ? (
          <div className="rounded-lg border border-line bg-surface p-8 text-center">
            <p className="text-[14px] text-muted">{portalError}</p>
            <a href="/workspace" className="mt-4 inline-block text-[13px] text-accent hover:underline">
              返回工作台入口
            </a>
          </div>
        ) : p ? (
          <ClientPortal project={p} matrix={permissions.projectFields} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-8 text-center">
            <p className="text-[14px] text-muted">未找到该项目，请联系张三确认链接。</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo title={workspace.title} description="内部协同工作台入口。" noindex />

      <header className="mb-10">
        <h1 className="font-serif text-2xl">{workspace.title}</h1>
        <p className="mt-2 text-[14px] text-muted">{workspace.hint}</p>
      </header>

      {!unlocked ? (
        /* 门禁：密码表单（不渲染任何内部数据） */
        <form onSubmit={handleSubmit} className="max-w-sm rounded-lg border border-line bg-surface p-6">
          <label htmlFor="ws-pwd" className="block text-[13.5px] text-muted">
            需要密码访问
          </label>
          <input
            id="ws-pwd"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="off"
            autoFocus
            className="mt-2 w-full rounded-md border border-line bg-bg px-3 py-2 text-[14px] outline-none transition-colors focus:border-accent/60"
            placeholder="输入访问密码"
          />
          {error && <p className="mt-2 text-[12.5px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={checking || !pwd}
            className="mt-4 w-full rounded-md border border-accent/50 px-4 py-2 text-[13px] text-accent transition-colors hover:bg-accent-soft disabled:opacity-40"
          >
            {checking ? '校验中…' : '进入工作台'}
          </button>
        </form>
      ) : (
        renderView()
      )}
    </div>
  )
}
