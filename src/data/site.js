// 全站数据的唯一入口。
//
// 唯一事实源是 content/ 目录（一文档一文件，由 TinaCMS 管理）。
// 这里通过 import.meta.glob 聚合并保持导出形状与旧版 src/data/*.json 完全一致，
// 因此所有页面组件无需任何改动。
//
// Tina 编辑器保存 → content/ 文件变化 → Vite HMR → 页面即时更新。
import profileMod from '../../content/profile/main.json'
import workspaceMod from '../../content/workspace/workspace.json'
import permissionsMod from '../../content/ops/permissions.json'

const glob = {
  works: import.meta.glob('../../content/works/*.json', { eager: true }),
  writing: import.meta.glob('../../content/writing/*.json', { eager: true }),
  timeline: import.meta.glob('../../content/timeline/*.json', { eager: true }),
  videos: import.meta.glob('../../content/videos/*.json', { eager: true }),
  network: import.meta.glob('../../content/network/*.json', { eager: true }),
  projects: import.meta.glob('../../content/projects/*.json', { eager: true }),
  // 内部工作台三角结构：三本台账（仅供 /workspace 页面消费，不进任何公开 API）
  opsProjects: import.meta.glob('../../content/ops/projects/*.json', { eager: true }),
  opsNodes: import.meta.glob('../../content/ops/nodes/*.json', { eager: true }),
  opsSettlements: import.meta.glob('../../content/ops/settlements/*.json', { eager: true }),
}

/** glob 结果 → [{ slug, ...data }]，按文件名排序 */
function collection(dir) {
  return Object.entries(glob[dir])
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([path, mod]) => ({
      slug: path.split('/').pop().replace(/\.json$/, ''),
      ...mod.default,
    }))
}

export const profile = profileMod
export const workspace = workspaceMod

/** 内部工作台：字段级权限矩阵 + 三本台账（一套数据，三种视图） */
export const permissions = permissionsMod
export const opsProjects = collection('opsProjects')
export const opsNodes = collection('opsNodes')
export const opsSettlements = collection('opsSettlements')
export const works = collection('works')
export const writing = collection('writing')
export const videos = collection('videos')
// 时间线展示顺序 = 文件名顺序（01-、02-…），剥掉 slug 保持原数据形状
export const timeline = collection('timeline').map(({ slug, ...item }) => item)

/** 长文按时间倒序（内容层要求：时间倒序展示） */
export const writingDesc = [...writing].sort((a, b) => (a.date < b.date ? 1 : -1))

/** 视频按时间倒序 */
export const videosDesc = [...videos].sort((a, b) => (a.date < b.date ? 1 : -1))

/** 协作网络成员（文件名顺序即展示顺序） */
export const network = collection('network')

/** 协作项目：需求招募在前（新→旧），交付案例在后（新→旧） */
export const projects = collection('projects')
export const recruitingProjects = [...projects]
  .filter((p) => p.type === 'recruiting')
  .sort((a, b) => (a.date < b.date ? 1 : -1))
export const deliveredProjects = [...projects]
  .filter((p) => p.type === 'delivered')
  .sort((a, b) => (a.date && b.date ? (a.date < b.date ? 1 : -1) : 0))

/** 短视频获客案例（首页能力展示用） */
export const shortVideoCases = deliveredProjects.filter((p) => p.tags.includes('短视频获客'))

/** 作品排序：置顶精选在前，其后按年份倒序 */
export const worksSorted = [...works].sort((a, b) => {
  if (a.highlight !== b.highlight) return a.highlight ? -1 : 1
  return a.year < b.year ? 1 : -1
})

/** 站内绝对地址（用于 JSON-LD 与分享卡片） */
export const siteUrl = profile.siteUrl.replace(/\/$/, '')
export const absUrl = (path) => `${siteUrl}${path}`
