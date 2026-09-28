import { useEffect } from 'react'
import { profile } from '../data/site.js'

/**
 * 每页 <head> 管理：title / meta / JSON-LD 结构化数据。
 * 用法：<Seo title="..." description="..." jsonLd={...} />
 * 同一页面如需多个 JSON-LD 实体，传数组即可。
 * noindex：内部页面传 true，输出 noindex/nofollow，禁止搜索引擎收录。
 */
export default function Seo({ title, description, jsonLd, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${profile.name}` : `${profile.name} · ${profile.jobTitle}`
    document.title = fullTitle

    const setMeta = (selector, attr, value) => {
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (selector.startsWith('[name=')) el.setAttribute('name', selector.match(/"([^"]+)"/)[1])
        else el.setAttribute('property', selector.match(/"([^"]+)"/)[1])
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    if (noindex) {
      setMeta('[name="robots"]', 'content', 'noindex, nofollow')
    } else {
      // 非 noindex 页面清掉可能残留的 robots 标签
      document.head.querySelector('[name="robots"]')?.remove()
    }

    setMeta('[name="description"]', 'content', description)
    setMeta('[property="og:title"]', 'content', fullTitle)
    setMeta('[property="og:description"]', 'content', description)
    setMeta('[property="og:type"]', 'content', 'website')
    setMeta('[property="og:url"]', 'content', window.location.href)
    setMeta('[name="twitter:card"]', 'content', 'summary')

    // JSON-LD：挂载到专用 <script type="application/ld+json">
    let script = document.getElementById('page-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.id = 'page-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
    return () => {}
  }, [title, description, jsonLd, noindex])

  return null
}
