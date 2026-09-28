import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import IdentityCard from '../components/IdentityCard.jsx'
import { WorkCardMini } from '../components/WorkCard.jsx'
import { profile, worksSorted, writingDesc, network, shortVideoCases, absUrl } from '../data/site.js'

// 结构层：首页 Person 结构化数据
const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  alternateName: profile.nameEn,
  url: absUrl('/'),
  image: absUrl(profile.avatar),
  jobTitle: profile.jobTitle,
  description: profile.tagline,
  email: `mailto:${profile.email}`,
  address: { '@type': 'PostalAddress', addressLocality: profile.location, addressCountry: 'CN' },
  sameAs: profile.socials.map((s) => s.url),
}

export default function Home() {
  const featured = worksSorted.filter((w) => w.highlight).slice(0, 3)
  const latestPosts = writingDesc.slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        description={`${profile.name}，${profile.jobTitle}。${profile.tagline}`}
        jsonLd={personLd}
      />

      {/* 身份层：身份卡片 */}
      <IdentityCard />

      {/* 简介：核心叙事 */}
      <section className="mt-10">
        <SectionTitle>我怎么做事</SectionTitle>
        <div className="space-y-3">
          <p className="max-w-2xl text-[15px] leading-[1.9] text-muted">
            {profile.bio.split('\n\n')[1]}
          </p>
          <p className="max-w-2xl text-[15px] leading-[1.9] text-muted">
            {profile.bio.split('\n\n')[2]}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link to="/projects" className="text-[13.5px] text-accent hover:underline">
            看看在招募的项目 →
          </Link>
          <Link to="/network" className="text-[13.5px] text-accent hover:underline">
            加入网络 →
          </Link>
          <Link to="/about" className="text-[13.5px] text-muted hover:text-fg">
            完整履历
          </Link>
        </div>
      </section>

      {/* 精选作品 */}
      <section className="mt-12">
        <SectionTitle to="/works">精选作品</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((w) => (
            <WorkCardMini key={w.slug} work={w} />
          ))}
        </div>
      </section>

      {/* 最新长文 */}
      <section className="mt-12">
        <SectionTitle to="/writing">最新长文</SectionTitle>
        <ul className="divide-y divide-line">
          {latestPosts.map((p) => (
            <li key={p.slug} className="py-4 first:pt-0 last:pb-0">
              <Link to={`/writing#${p.slug}`} className="group block">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] group-hover:text-accent">{p.title}</h3>
                  <time className="shrink-0 text-[12.5px] text-muted">{p.date}</time>
                </div>
                <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{p.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 协作网络 */}
      <section className="mt-12">
        <SectionTitle to="/network">协作网络</SectionTitle>
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
          我发起项目，网络节点认领任务，按最终交付结果分佣。这是结果导向的网络——不看你的出身、过程，只看交付结果。
          网络擅长<strong className="font-medium text-fg">内容获客与工具开发</strong>，正在服务示例客户A、示例客户B等项目（占位文案，替换为你的）。
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {network.map((m) => (
            <li
              key={m.slug}
              className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3"
            >
              <img
                src={m.avatar}
                alt={`${m.name}的头像`}
                width="36"
                height="36"
                className="h-9 w-9 shrink-0 rounded-full border border-line"
              />
              <span className="min-w-0">
                <span className="block text-[13.5px] leading-tight">{m.name}</span>
                <span className="block truncate text-[12px] leading-tight text-muted">{m.role}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/projects"
            className="inline-block rounded-md border border-accent/50 px-4 py-1.5 text-[13px] text-accent transition-colors hover:bg-accent-soft"
          >
            项目匹配入口
          </Link>
          <Link
            to="/projects#delivered"
            className="inline-block rounded-md border border-line px-4 py-1.5 text-[13px] text-muted transition-colors hover:border-accent/50 hover:text-fg"
          >
            品牌获客案例 →
          </Link>
        </div>
      </section>

      {/* 短视频获客案例 */}
      <section className="mt-12">
        <SectionTitle to="/projects#delivered">短视频获客案例</SectionTitle>
        <ul className="grid gap-3">
          {shortVideoCases.map((p) => (
            <li key={p.slug} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-serif text-[15.5px]">{p.title}</h3>
                <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-[11.5px] text-accent">
                  短视频获客
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-muted">
                行业：{p.tags.filter((t) => t !== '短视频获客').join(' / ')}
                {p.role && <> · 我的角色：{p.role}</>}
              </p>
              <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{p.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 订阅引导 */}
      <section className="mt-12 rounded-lg border border-line bg-accent-soft/50 p-6">
        <h2 className="font-serif text-[15.5px]">月度邮件</h2>
        <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
          每月一封：近期的业务复盘、值得读的长文与合作动态。无广告，可随时退订。
        </p>
        <Link
          to="/subscribe"
          className="mt-4 inline-block rounded-md border border-accent/50 px-4 py-1.5 text-[13px] text-accent transition-colors hover:bg-accent-soft"
        >
          订阅更新
        </Link>
      </section>
    </div>
  )
}

function SectionTitle({ to, children }) {
  const text = <h2 className="font-serif text-[17px]">{children}</h2>
  return (
    <div className="mb-4 flex items-baseline justify-between">
      {text}
      {to && (
        <Link to={to} className="text-[12.5px] text-muted transition-colors hover:text-fg">
          查看全部 →
        </Link>
      )}
    </div>
  )
}
