/**
 * 一次性迁移脚本：src/data/*.json（数组/单例）→ content/（一文档一文件）
 *
 * 迁移后 content/ 是唯一内容源（由 TinaCMS 管理），
 * src/data/*.json 改由 scripts/sync-content.mjs 从 content/ 聚合生成。
 *
 * 用法：node scripts/migrate-to-content.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const dataDir = join(root, 'src/data')
const contentDir = join(root, 'content')

async function readJson(name) {
  return JSON.parse(await readFile(join(dataDir, name), 'utf8'))
}

async function writeDoc(relPath, data) {
  const file = join(contentDir, relPath)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`  + content/${relPath}`)
}

console.log('迁移个人资料…')
const profile = await readJson('profile.json')
await writeDoc('profile/main.json', profile)

console.log('迁移作品集…')
const works = await readJson('works.json')
for (const { slug, ...work } of works) {
  await writeDoc(`works/${slug}.json`, work)
}

console.log('迁移长文…')
const writing = await readJson('writing.json')
for (const { slug, ...post } of writing) {
  await writeDoc(`writing/${slug}.json`, post)
}

console.log('迁移履历时间线（数字前缀保证顺序）…')
const timeline = await readJson('timeline.json')
const timelineSlugs = ['independence', 'senior-product-engineer', 'product-engineer', 'education']
timeline.forEach((item, i) => {
  writeDoc(`timeline/${String(i + 1).padStart(2, '0')}-${timelineSlugs[i]}.json`, item)
})
await Promise.resolve()

console.log('生成视频示例数据…')
const videos = [
  {
    title: '为什么我又开始写长文（视频版）',
    date: '2025-08-20',
    summary: '同名长文的视频版：短内容如何消耗判断力，以及长写作为什么值得回归。约八分钟讲清楚三个理由。',
    platform: 'bilibili',
    url: 'https://www.bilibili.com/video/BV1xx411c7mD',
    cover: '/uploads/video-longform.svg',
    duration: '08:24',
    tags: ['写作', '随笔'],
  },
  {
    title: '本地优先软件的十年 · Meetup 分享',
    date: '2025-06-15',
    summary: '在本地优先社区月度分享的录像：从断网可用到数据主权，本地优先运动十年间的三次范式转移。',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=placeholder01',
    cover: '/uploads/video-localfirst.svg',
    duration: '32:10',
    tags: ['本地优先', '分享'],
  },
  {
    title: '墨迹 Ink：三分钟上手演示',
    date: '2025-05-02',
    summary: '从安装到写下第一篇双向链接笔记的全流程演示。示例视频，演示 direct 模式：视频文件直接上传到站点媒体库。',
    platform: 'direct',
    url: '',
    file: '/uploads/ink-demo.mp4',
    cover: '/uploads/video-ink.svg',
    duration: '03:12',
    tags: ['墨迹 Ink', '产品'],
  },
]
for (const { slug, ...video } of videos.map((v) => ({
  slug: ['video-longform-again', 'local-first-decade', 'ink-demo'][videos.indexOf(v)],
  ...v,
}))) {
  await writeDoc(`videos/${slug}.json`, video)
}

console.log('\n迁移完成。接下来：')
console.log('  1. node scripts/sync-content.mjs   # 验证聚合结果与原数据一致')
console.log('  2. npx tinacms dev -c "pnpm dev"   # 启动 Tina 编辑器')
