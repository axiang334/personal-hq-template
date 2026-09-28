import Seo from '../components/Seo.jsx'
import VideoCard from '../components/VideoCard.jsx'
import { videosDesc, absUrl, profile } from '../data/site.js'

// 结构层：视频页 —— CollectionPage + 每条 VideoObject
const videosLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${profile.name}的视频`,
    url: absUrl('/videos'),
    description: '业务经验分享与案例讲解录像。',
  },
  ...videosDesc.map((v) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.summary,
    uploadDate: v.date,
    thumbnailUrl: v.cover ? absUrl(v.cover) : undefined,
    ...(v.platform === 'direct' && v.file
      ? { contentUrl: absUrl(v.file) }
      : { embedUrl: embedForLd(v) }),
  })),
]

function embedForLd(v) {
  if (v.platform === 'bilibili') {
    const m = (v.url || '').match(/BV[a-zA-Z0-9]+/)
    return m ? `https://player.bilibili.com/player.html?bvid=${m[0]}` : v.url
  }
  return v.url
}

export default function Videos() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Seo
        title="视频"
        description={`${profile.name}的视频：业务经验分享与案例讲解录像，按时间倒序。`}
        jsonLd={videosLd}
      />

      <header className="mb-8">
        <h1 className="font-serif text-2xl">视频</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
          分享录像、产品演示与部分长文的视频版。按时间倒序，点击封面即可播放。
        </p>
      </header>

      <div className="grid gap-6">
        {videosDesc.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </div>
    </div>
  )
}
