/**
 * 聚合脚本：content/（一文档一文件，TinaCMS 管理）→ src/data/*.json（单文件聚合）
 *
 * 前端（Vite）通过 import.meta.glob 直接消费 content/，编辑保存即时生效；
 * 本脚本聚合出的 src/data/*.json 供三个部署通道的 API 函数在构建时打包：
 *   - server.mjs / Vercel api/ / EdgeOne edge-functions/
 *
 * 由 build 命令自动执行（见 package.json），无需手动运行。
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const contentDir = join(root, 'content')
const dataDir = join(root, 'src/data')

/** 读取一个 collection 目录，按文件名排序，回填 slug */
async function loadCollection(name) {
  const dir = join(contentDir, name)
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort()
  return Promise.all(
    files.map(async (f) => {
      const data = JSON.parse(await readFile(join(dir, f), 'utf8'))
      return { slug: f.replace(/\.json$/, ''), ...data }
    }),
  )
}

async function writeJson(name, data) {
  await writeFile(join(dataDir, name), JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`  → src/data/${name}（${Array.isArray(data) ? data.length : 1} 条）`)
}

console.log('聚合 content/ → src/data/ …')

const profileFiles = await loadCollection('profile')
if (profileFiles.length !== 1) {
  throw new Error(`content/profile 应只有一个 main.json，实际 ${profileFiles.length} 个`)
}
// 单例：剥掉聚合层，保持原形状
const { slug: _profileSlug, ...profile } = profileFiles[0]
await writeJson('profile.json', profile)

await writeJson('works.json', await loadCollection('works'))
await writeJson('writing.json', await loadCollection('writing'))
await writeJson('videos.json', await loadCollection('videos'))
await writeJson('network.json', await loadCollection('network'))
await writeJson('projects.json', await loadCollection('projects'))

// workspace 单例：剥掉聚合层
const workspaceFiles = await loadCollection('workspace')
if (workspaceFiles.length !== 1) {
  throw new Error(`content/workspace 应只有一个 workspace.json，实际 ${workspaceFiles.length} 个`)
}
const { slug: _wsSlug, ...workspace } = workspaceFiles[0]
await writeJson('workspace.json', workspace)

// timeline 的展示顺序 = 文件名顺序；聚合时剥掉 slug 字段，保持与原数据一致
const timelineRaw = await loadCollection('timeline')
await writeJson('timeline.json', timelineRaw.map(({ slug, ...item }) => item))

console.log('聚合完成。')
