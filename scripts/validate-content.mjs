/**
 * 内容-模型一致性校验（CI 友好）。
 *
 * 模拟 TinaCMS 编辑器加载每个文档时的 schema 匹配：
 * content/*.json 中出现的每个字段，都必须在 tina/config.ts 定义的
 * collection 字段（或 Tina 的元数据字段）中存在，类型也要兼容。
 *
 * 用法：node scripts/validate-content.mjs
 * 退出码非 0 = 有不匹配，编辑器里该文档会显示异常字段。
 */
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

// 与 tina/config.ts 中的定义保持一致（手工镜像；改 schema 时同步更新）
// key = collection name（单数），value = [目录名, 字段列表]
const schema = {
  profile: ['profile', ['siteUrl', 'name', 'nameEn', 'avatar', 'jobTitle', 'tagline', 'bio', 'tags', 'status', 'location', 'email', 'socials']],
  work: ['works', ['title', 'summary', 'category', 'year', 'status', 'statusText', 'stack', 'link', 'repo', 'highlight']],
  writing: ['writing', ['title', 'date', 'summary', 'tags', 'readingMinutes']],
  timeline: ['timeline', ['period', 'title', 'org', 'description', 'tags']],
  video: ['videos', ['title', 'date', 'summary', 'platform', 'url', 'file', 'cover', 'duration', 'tags']],
  member: ['network', ['name', 'role', 'tags', 'siteName', 'siteUrl', 'apiUrl', 'avatar', 'bio', 'claim']],
  project: ['projects', ['title', 'type', 'summary', 'owner', 'participants', 'tags', 'date', 'statusText', 'role', 'need', 'reward', 'maturity', 'baseline', 'criteria']],
  workspace: ['workspace', ['title', 'passwordSha256', 'hint', 'notionUrl', 'notionName', 'links']],
  // 内部工作台三角结构：三本台账 + 字段级权限矩阵
  opsProject: ['ops/projects', ['name', 'client', 'clientKey', 'status', 'progress', 'deliverables', 'metrics', 'node', 'nodeKey', 'commission', 'cost', 'settlement', 'recruiting', 'accessKey', 'startDate', 'stage', 'team', 'billing']],
  opsNode: ['ops/nodes', ['name', 'nodeKey', 'direction', 'tags', 'projects', 'status', 'note']],
  opsSettlement: ['ops/settlements', ['project', 'clientKey', 'node', 'nodeKey', 'type', 'amount', 'status', 'date']],
  opsPermissions: ['ops', ['roles', 'projectFields', 'nodeFields', 'settlementFields', 'rowRules']],
  opsClaim: ['ops/claims', ['direction', 'claimId', 'projectId', 'projectName', 'nodeApiUrl', 'claimerName', 'claimerSite', 'contact', 'message', 'status', 'remoteStatus', 'progress', 'claimedAt', 'receivedAt', 'lastSyncedAt']],
}

// status / socials 等对象字段允许的子键
const subKeys = {
  status: ['available', 'availableText', 'text'],
  socials: ['name', 'url'],
  links: ['name', 'url', 'note', 'role'],
  metrics: ['label', 'value'],
  team: ['name', 'duty'],
  roles: ['key', 'label', 'desc'],
  projectFields: ['field', 'label', 'roles'],
  nodeFields: ['field', 'label', 'roles'],
  settlementFields: ['field', 'label', 'roles'],
  rowRules: ['client', 'node'],
}

const enumChecks = {
  'work.status': ['live', 'wip', 'maintained', 'archived'],
  'video.platform': ['bilibili', 'youtube', 'direct'],
}

let errors = 0
const files = []

for (const [name, [dirName, fields]] of Object.entries(schema)) {
  const dir = join(root, 'content', dirName)
  let list = []
  try {
    list = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  } catch {
    console.error(`✗ 缺少目录 content/${dirName}`)
    errors++
    continue
  }
  for (const f of list) {
    files.push(`${name}/${f}`)
    const data = JSON.parse(await readFile(join(dir, f), 'utf8'))
    for (const [key, value] of Object.entries(data)) {
      if (!fields.includes(key)) {
        console.error(`✗ content/${dirName}/${f}: 字段 "${key}" 不在 schema 中`)
        errors++
        continue
      }
      if (subKeys[key] && typeof value === 'object' && !Array.isArray(value)) {
        for (const sub of Object.keys(value)) {
          if (!subKeys[key].includes(sub)) {
            console.error(`✗ content/${dirName}/${f}: ${key}.${sub} 不在 schema 中`)
            errors++
          }
        }
      }
      if (subKeys[key] && Array.isArray(value)) {
        for (const item of value) {
          for (const sub of Object.keys(item)) {
            if (!subKeys[key].includes(sub)) {
              console.error(`✗ content/${dirName}/${f}: ${key}[].${sub} 不在 schema 中`)
              errors++
            }
          }
        }
      }
      const enumKey = `${name}.${key}`
      if (enumChecks[enumKey] && !enumChecks[enumKey].includes(value)) {
        console.error(`✗ content/${dirName}/${f}: ${key}="${value}" 不在允许值 ${enumChecks[enumKey]} 中`)
        errors++
      }
    }
  }
}

console.log(`检查了 ${files.length} 个文档、${Object.keys(schema).length} 个集合。`)
if (errors) {
  console.error(`\n${errors} 处不匹配，请修正后再启动编辑器。`)
  process.exit(1)
}
console.log('✓ 全部字段与 schema 匹配，TinaCMS 编辑器可正常加载。')
