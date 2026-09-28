import { profile } from '../data/site.js'

/**
 * 身份层核心组件：首页顶部的身份卡片。
 * 头像 + 名字 + 一句话定位 + 标签 + 当前状态。
 */
export default function IdentityCard() {
  const { status } = profile
  return (
    <section className="rounded-lg border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <img
          src={profile.avatar}
          alt={`${profile.name}的头像`}
          width="72"
          height="72"
          className="h-18 w-18 shrink-0 rounded-full border border-line"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl leading-tight">
            {profile.name}
            <span className="ml-3 text-sm font-normal text-muted">{profile.nameEn}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed">{profile.tagline}</p>
          <p className="mt-1 text-[13px] text-muted">{profile.jobTitle}</p>

          {/* 标签 */}
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-line px-3 py-1 text-[12.5px] text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>

          {/* 当前状态 */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px]">
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.available ? 'bg-status' : 'bg-muted'}`}
                aria-hidden="true"
              />
              <span className={status.available ? 'text-status' : 'text-muted'}>
                {status.availableText}
              </span>
            </span>
            <span className="text-muted">{status.text}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
