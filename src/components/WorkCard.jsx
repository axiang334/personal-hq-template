import { Link } from 'react-router-dom'

const statusStyle = {
  live: 'text-status border-status/40',
  wip: 'text-accent border-accent/40',
  maintained: 'text-muted border-line',
  archived: 'text-muted border-line opacity-70',
}

/** 内容层：作品卡片 */
export default function WorkCard({ work }) {
  return (
    <article
      id={work.slug}
      className="scroll-mt-24 rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent/50"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg leading-snug">
          <a href={work.link || work.repo || `#${work.slug}`} className="hover:text-accent">
            {work.title}
          </a>
        </h3>
        <span className="text-[12.5px] text-muted">{work.year}</span>
      </div>

      <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{work.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
        <span className={`rounded-full border px-2.5 py-0.5 ${statusStyle[work.status] ?? statusStyle.maintained}`}>
          {work.statusText}
        </span>
        <span className="text-muted">{work.category}</span>
        <span className="text-muted">{work.stack.join(' · ')}</span>
        <span className="ml-auto flex gap-3">
          {work.link && (
            <a href={work.link} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              访问
            </a>
          )}
          {work.repo && (
            <a href={work.repo} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              源码
            </a>
          )}
        </span>
      </div>
    </article>
  )
}

/** 供首页复用的紧凑版 */
export function WorkCardMini({ work }) {
  return (
    <Link
      to={`/works#${work.slug}`}
      className="group block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent/50"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-serif text-[15.5px] group-hover:text-accent">{work.title}</h3>
        <span className="text-[12px] text-muted">{work.year}</span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{work.summary}</p>
    </Link>
  )
}
