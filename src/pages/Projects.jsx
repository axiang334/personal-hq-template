import Seo from '../components/Seo.jsx'
import { profile, recruitingProjects, deliveredProjects, absUrl } from '../data/site.js'

// 结构层：项目池页 —— 集合 + 全部项目的 ItemList
const projectsLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${profile.name}的项目池`,
  url: absUrl('/projects'),
  description:
    '结果导向的项目承接说明书：每个项目写明项目成熟度、基线路径（SOP 参考）、需要的结果、评判标准与分佣机制。',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [...recruitingProjects, ...deliveredProjects].map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.title,
        description: p.need || p.summary,
        datePublished: p.date,
        keywords: p.tags.join(', '),
        contributor: p.participants.map((n) => ({ '@type': 'Person', name: n })),
      },
    })),
  },
}

export default function Projects() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="项目池"
        description={`${profile.name}发起的项目池：所有项目均已跑通 0-1、拿到过结果。每个项目写明成熟度、基线路径（SOP 参考）、需要的结果、评判标准与分佣机制，网络节点可认领。`}
        jsonLd={projectsLd}
      />

      <header className="mb-10">
        <h1 className="font-serif text-2xl">项目池</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
          这里上架的都是<strong className="font-medium text-fg">已跑通 0-1、拿到过结果</strong>
          的成熟项目。每个项目是一份项目承接说明书，写清五件事：
          <strong className="font-medium text-fg">项目成熟度</strong>、
          <strong className="font-medium text-fg">基线路径（SOP 参考）</strong>、
          <strong className="font-medium text-fg">需要的结果</strong>、
          <strong className="font-medium text-fg">评判标准</strong>、
          <strong className="font-medium text-fg">分佣机制</strong>
          ——你认领，你交付，按结果结算。基线路径是已验证的参考打法，你可以用自己的方式迭代，一切以结果为准。
        </p>
      </header>

      {/* 板块一：招募中 */}
      <section id="recruiting" className="scroll-mt-24">
        <h2 className="mb-4 flex items-baseline justify-between font-serif text-[17px]">
          招募中
          <span className="text-[12.5px] font-normal text-muted">
            {recruitingProjects.length} 个已跑通的项目等待认领放大
          </span>
        </h2>
        {recruitingProjects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-6 text-[13.5px] text-muted">
            当前没有招募中的项目，欢迎带着你的项目来发布。
          </p>
        ) : (
          <ul className="grid gap-4">
            {recruitingProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} tone="recruiting" />
            ))}
          </ul>
        )}
      </section>

      {/* 板块二：已交付 */}
      <section id="delivered" className="mt-12 scroll-mt-24">
        <h2 className="mb-4 flex items-baseline justify-between font-serif text-[17px]">
          已交付
          <span className="text-[12.5px] font-normal text-muted">
            {deliveredProjects.length} 个项目已按评判标准验收并完成结算
          </span>
        </h2>
        {deliveredProjects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-6 text-[13.5px] text-muted">
            暂无已交付项目。
          </p>
        ) : (
          <ul className="grid gap-4">
            {deliveredProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} tone="delivered" />
            ))}
          </ul>
        )}
      </section>

      {/* 认领入口 */}
      <section className="mt-12 rounded-lg border border-line bg-accent-soft/50 p-6">
        <h2 className="font-serif text-[15.5px]">认领，或带着你的项目来</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          看到你能交付的结果，直接联系我，说明你打算怎么做、多久交付。评判标准里的合格线会在认领时书面约定。
          你手上也可以有项目——发给我，我们来组织节点一起交付。协作规则见{' '}
          <a href="/network" className="text-accent hover:underline">
            /network
          </a>
          。
        </p>
      </section>
    </div>
  )
}

/** 项目承接说明书卡片：① 成熟度 ② 基线路径(SOP) ③ 需要的结果 ④ 评判标准 ⑤ 分佣机制 */
function ProjectCard({ project: p, tone }) {
  return (
    <li className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent/50">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-serif text-[16px] leading-snug">{p.title}</h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11.5px] ${
            tone === 'recruiting' ? 'border-accent/40 text-accent' : 'border-line text-muted'
          }`}
        >
          {p.statusText}
        </span>
      </div>

      {/* ① 项目成熟度 */}
      {p.maturity && (
        <p className="mt-2.5 inline-flex flex-wrap items-center gap-x-1.5 rounded-md bg-accent-soft/60 px-2.5 py-1 text-[12.5px] leading-relaxed text-accent">
          <span className="font-medium">项目成熟度</span>
          <span aria-hidden="true">·</span>
          {p.maturity}
        </p>
      )}

      {/* ② 基线路径（SOP 参考） */}
      {p.baseline && (
        <div className="mt-3 rounded-md border border-line bg-accent-soft/25 p-3.5">
          <p className="text-[11.5px] font-medium tracking-wide text-muted">
            基线路径（SOP 参考）
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{p.baseline}</p>
        </div>
      )}

      {/* ③④⑤ 需要的结果 / 评判标准 / 分佣机制 */}
      <dl className="mt-4 space-y-2 text-[13.5px] leading-relaxed">
        <div className="flex gap-3">
          <dt className="w-[72px] shrink-0 text-[12.5px] text-muted">需要的结果</dt>
          <dd className="min-w-0 flex-1">{p.need || p.summary}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-[72px] shrink-0 text-[12.5px] text-muted">评判标准</dt>
          <dd className="min-w-0 flex-1">{p.criteria || '认领时书面约定'}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-[72px] shrink-0 text-[12.5px] text-muted">分佣机制</dt>
          <dd className="min-w-0 flex-1 text-accent">{p.reward || '面谈'}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-[12.5px] text-muted">
        <span>
          发起：{p.owner}
          {p.role && `（${p.role}）`}
        </span>
        {p.date && <time>{p.date}</time>}
        <span className="ml-auto flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span key={t} className="rounded border border-line px-2 py-0.5">
              {t}
            </span>
          ))}
        </span>
      </div>
    </li>
  )
}
