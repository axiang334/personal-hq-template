import Seo from '../components/Seo.jsx'
import { writingDesc, absUrl, profile } from '../data/site.js'

// 结构层：长文页 —— Blog + 每篇 BlogPosting
const writingLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${profile.name}的长文`,
    url: absUrl('/writing'),
    description: '关于销售管理、互联网广告与业务拓客的长文，按时间倒序。',
    blogPost: writingDesc.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      description: p.summary,
      url: absUrl(`/writing#${p.slug}`),
      keywords: p.tags.join(', '),
      author: { '@type': 'Person', name: profile.name, url: absUrl('/') },
    })),
  },
]

export default function Writing() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="长文"
        description={`${profile.name}的长文列表：业务方法论、销售管理与互联网广告实践，按时间倒序。`}
        jsonLd={writingLd}
      />

      <header className="mb-8">
        <h1 className="font-serif text-2xl">长文</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
          把想不清楚的事情想清楚的方式。按时间倒序，最新的在最上面。
        </p>
      </header>

      <ul className="divide-y divide-line">
        {writingDesc.map((post) => (
          <li key={post.slug} id={post.slug} className="scroll-mt-24 py-7 first:pt-0">
            <article>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-serif text-[17px] leading-snug">{post.title}</h2>
                <time className="text-[12.5px] text-muted">{post.date}</time>
              </div>
              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">{post.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
                {post.tags.map((t) => (
                  <span key={t} className="rounded border border-line px-2 py-0.5">
                    {t}
                  </span>
                ))}
                <span>约 {post.readingMinutes} 分钟</span>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
