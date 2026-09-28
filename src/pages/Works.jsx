import Seo from '../components/Seo.jsx'
import WorkCard from '../components/WorkCard.jsx'
import { worksSorted, absUrl, profile } from '../data/site.js'

// 结构层：作品页 —— 集合 + 每件作品的 CreativeWork
const worksLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${profile.name}的业务案例`,
    url: absUrl('/works'),
    description: '业务案例集合：互联网广告、销售体系、招商与团队管理。',
  },
  ...worksSorted.map((w) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: w.title,
    url: absUrl(`/works#${w.slug}`),
    description: w.summary,
    dateCreated: w.year,
    keywords: w.stack.join(', '),
    genre: w.category,
    ...(w.link ? { distribution: { '@type': 'DataDownload', url: w.link } } : {}),
    ...(w.repo
      ? { license: 'https://opensource.org/licenses', codeRepository: w.repo }
      : {}),
    author: { '@type': 'Person', name: profile.name, url: absUrl('/') },
  })),
]

export default function Works() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="作品"
        description={`${profile.name}的业务案例：互联网广告销售、销售体系搭建、招商拓客与团队管理。`}
        jsonLd={worksLd}
      />

      <header className="mb-8">
        <h1 className="font-serif text-2xl">作品</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
          基于真实工作经历的业务案例复盘。状态标注：结案复盘 / 整理中。
        </p>
      </header>

      <div className="grid gap-4">
        {worksSorted.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </div>
    </div>
  )
}
