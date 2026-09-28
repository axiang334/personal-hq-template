import timeline from '../data/timeline.json'

/** 身份层：/about 页的完整履历时间线 */
export default function Timeline() {
  return (
    <ol className="relative border-l border-line pl-6">
      {timeline.map((item) => (
        <li key={`${item.period}-${item.title}`} className="relative pb-10 last:pb-0">
          {/* 节点圆点 */}
          <span
            className="absolute -left-[30.5px] top-[7px] h-[7px] w-[7px] rounded-full bg-accent"
            aria-hidden="true"
          />
          <p className="text-[12.5px] tracking-wide text-muted">{item.period}</p>
          <h3 className="mt-1 font-serif text-lg leading-snug">
            {item.title}
            <span className="ml-2 text-sm font-normal text-muted">· {item.org}</span>
          </h3>
          <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-muted">{item.description}</p>
          {item.tags?.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <li key={t} className="rounded border border-line px-2 py-0.5 text-[12px] text-muted">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
