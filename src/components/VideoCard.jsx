import { useState } from 'react'

/**
 * 内容层：视频卡片。
 * 外链视频（bilibili/youtube）懒加载——先展示封面，点击后才注入 iframe，不吃流量也符合本站克制的调性。
 * direct 模式直接渲染 <video>（文件由 Tina 媒体库上传到 public/uploads）。
 */
export default function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false)
  const embed = embedUrl(video.platform, video.url)
  const isDirect = video.platform === 'direct' && video.file

  return (
    <article
      id={video.slug}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-line bg-surface"
    >
      {/* 播放区 */}
      <div className="relative aspect-video bg-accent-soft/60">
        {isDirect ? (
          <video
            controls
            preload="metadata"
            poster={video.cover || undefined}
            className="h-full w-full object-cover"
            src={video.file}
          />
        ) : playing && embed ? (
          <iframe
            src={embed}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!embed}
            aria-label={embed ? `播放：${video.title}` : '视频地址待补'}
            className="group relative block h-full w-full"
          >
            {video.cover && (
              <img src={video.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
                  embed
                    ? 'border-line bg-surface/90 group-hover:border-accent/60'
                    : 'border-line bg-surface/50'
                }`}
                aria-hidden="true"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-fg">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              </span>
            </span>
            <span className="absolute bottom-2 right-2 rounded bg-bg/80 px-1.5 py-0.5 text-[11.5px] text-muted">
              {video.duration}
            </span>
          </button>
        )}
      </div>

      {/* 信息区 */}
      <div className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="font-serif text-[16px] leading-snug">{video.title}</h2>
          <time className="text-[12.5px] text-muted">{video.date}</time>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{video.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
          <span className="rounded border border-line px-2 py-0.5">{platformName(video.platform)}</span>
          {video.tags.map((t) => (
            <span key={t} className="rounded border border-line px-2 py-0.5">
              {t}
            </span>
          ))}
          {video.platform !== 'direct' && video.url && (
            <a
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-accent hover:underline"
            >
              原链 ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/** 平台 → 嵌入地址；direct / 无法解析时返回 null */
function embedUrl(platform, url) {
  if (!url) return null
  if (platform === 'bilibili') {
    const m = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/) || url.match(/^(BV[a-zA-Z0-9]+)$/)
    return m ? `https://player.bilibili.com/player.html?bvid=${m[1]}&autoplay=0` : null
  }
  if (platform === 'youtube') {
    const m = url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/)
    return m ? `https://www.youtube.com/embed/${m[1]}` : null
  }
  return null
}

function platformName(platform) {
  return { bilibili: 'Bilibili', youtube: 'YouTube', direct: '本站' }[platform] ?? '视频'
}
