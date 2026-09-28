import Seo from '../components/Seo.jsx'
import Timeline from '../components/Timeline.jsx'
import { profile, absUrl } from '../data/site.js'

// 结构层：关于页 ProfilePage 结构化数据
const profilePageLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  dateModified: '2025-08-17',
  mainEntity: {
    '@type': 'Person',
    name: profile.name,
    alternateName: profile.nameEn,
    url: absUrl('/about'),
    image: absUrl(profile.avatar),
    jobTitle: profile.jobTitle,
    description: profile.tagline,
    email: `mailto:${profile.email}`,
  },
}

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="关于"
        description={`${profile.name}的完整履历：操盘手与项目发起人的经历、能力与联系方式。`}
        jsonLd={profilePageLd}
      />

      <header className="mb-10">
        <h1 className="font-serif text-2xl">关于我</h1>
        <p className="mt-2 text-[14px] text-muted">
          {profile.name} · {profile.jobTitle} · {profile.location}
        </p>
      </header>

      {/* 自我介绍（完整多段） */}
      <section className="space-y-4">
        {profile.bio.split('\n\n').map((para, i) => (
          <p key={i} className="max-w-2xl text-[15px] leading-[1.9] text-muted">
            {para}
          </p>
        ))}
      </section>

      {/* 履历时间线 */}
      <section className="mt-14">
        <h2 className="mb-8 font-serif text-[17px]">履历</h2>
        <Timeline />
      </section>

      {/* 联系方式 */}
      <section className="mt-14">
        <h2 className="mb-4 font-serif text-[17px]">联系</h2>
        <ul className="divide-y divide-line rounded-lg border border-line">
          <li className="flex items-center justify-between px-5 py-3.5 text-[14px]">
            <span className="text-muted">邮件</span>
            <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
              {profile.email}
            </a>
          </li>
          {profile.socials.map((s) => (
            <li key={s.name} className="flex items-center justify-between px-5 py-3.5 text-[14px]">
              <span className="text-muted">{s.name}</span>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                {s.url.startsWith('tel:') ? s.url.replace(/^tel:/, '') : s.url.replace(/^https?:\/\//, '')}
              </a>
            </li>
          ))}
          <li className="flex items-center justify-between px-5 py-3.5 text-[14px]">
            <span className="text-muted">当前状态</span>
            <span className={profile.status.available ? 'text-status' : 'text-muted'}>
              {profile.status.available ? profile.status.availableText : '暂不接新合作'} · {profile.status.text}
            </span>
          </li>
        </ul>
      </section>
    </div>
  )
}
