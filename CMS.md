# CMS 选型：GitCMS vs TinaCMS vs Strapi 5

针对本仓库（React + Vite + JSON 数据驱动）的结论先行：

> **推荐 TinaCMS，已集成完毕。** 理由：它是三者中唯一原生支持「直接编辑仓库里的 JSON 文件」的方案——与现有"JSON 数据驱动"架构完全同构，前端代码零改动；本地编辑器免注册免账号；媒体管理器原生支持视频上传。GitCMS 只擅长 Markdown（结构化字段仅限 frontmatter），Strapi 5 则要求把内容迁进数据库、前端改为 API 拉取，都是伤筋动骨的改法。

## 对比总表

| 维度 | GitCMS | TinaCMS（已采用） | Strapi 5 |
| --- | --- | --- | --- |
| 内容存储 | Git 仓库（Markdown + frontmatter） | **Git 仓库（JSON/MD/YAML 原生）** | 自管数据库（SQLite/PostgreSQL） |
| 对本项目改动 | 大：需把 JSON 改成 MD 文件 | **几乎为零：content/ 一文档一文件，前端 glob 消费** | 最大：弃用 JSON 文件，改为 API 拉取 |
| 可视化后台 | 托管 Web（Notion 风格编辑器） | 本地 dev 内置 + Tina Cloud 托管 | 自托管 Web 后台 |
| 视频管理 | 媒体上传（图片优化为主） | **媒体管理器原生 video/*：mp4/webm/mov，单文件 100MiB，repo-based 或云存储** | 需自配 S3/本地磁盘 provider，ORM 层配 media |
| 账号/费用 | GitHub App 授权 + $49 买断/站 | **本地模式零账号零费用；Cloud 免费档 2 用户** | 免费开源自托管，但要出服务器 |
| 运维负担 | 无（SaaS） | 无（本地）/ 无（Cloud） | **有**：部署、升级、数据库备份 |
| 与 Git 工作流 | 每次 save = commit | 每次 save = commit（本地模式直接写盘） | 内容在库里，版本化需另做 |

## 三个问题的直接回答

### 1. 哪个方案对现有代码改动最小？

**TinaCMS，且远超另外两个。**

- TinaCMS：内容从"一个 JSON 文件"拆成"一目录一文档一文件"（`content/works/ink.json`），前端 `site.js` 改用 `import.meta.glob` 聚合，**导出形状与原来完全一致，所有页面组件零改动**。本次集成的实际前端改动只有这一个文件 + 新增 /videos 页。
- GitCMS：设计目标是 Markdown 站点，结构化数据只能塞进 frontmatter。要用它，得把 `works.json` 数组拆成 6 个 MD 文件再写 frontmatter，前端解析层全部重写。
- Strapi 5：内容进数据库后，`import ... from './data/works.json'` 全部作废，改 `fetch('http://localhost:1337/api/works')` + loading/error 状态 + 构建期数据预取。对静态优先的 Vite 站是架构级改动。

### 2. 哪个方案管理视频最方便？

**TinaCMS。** 媒体管理器原生支持 `video/*`（mp4、webm、mov 等），直接拖拽上传，两种存储模式：

- **repo-based**（本项目采用的）：视频落到 `public/uploads/`，与代码同仓同版本化，站点直接引用
- Tina Cloud 媒体存储：CDN 分发，适合更大的量

限制：单文件 100MiB（所有套餐同限）。超出这个量级的正片（如长视频）建议仍放 B 站/YouTube 用外链嵌入（schema 里 `platform: bilibili/youtube` 走懒加载 iframe），direct 直传适合 3-5 分钟内的演示短片——本项目两种模式都已支持。

GitCMS 媒体能力以图片优化为主；Strapi 5 视频要自己配上传 provider（S3 等）+ 媒体库配置，工作量在部署侧。

### 3. 各方案的准备工作

**GitCMS**

1. 购买站点 license（$49 一次性/站，发布期内早鸟价）
2. GitHub 账号 + 安装 GitCMS GitHub App 并授权仓库
3. 项目根目录建 `.gitcms/` 配置（可用其 CLI `npx create-gitcms@latest` 生成）
4. 把 JSON 内容重构为 Markdown + frontmatter
5. 无环境变量；编辑在 gitcms.dev 的托管界面

**TinaCMS（本项目，已就绪）**

- 本地模式（现在就能用）：**零准备**。`pnpm install` 后 `pnpm tina`，浏览器打开 `http://localhost:5173/admin/index.html`，免登录
- 接入 Tina Cloud（可选，为了远程编辑/多人协作）：
  1. [app.tina.io](https://app.tina.io) 注册（免费档：2 用户、1 项目、文档数无限）
  2. 创建项目 → 关联 GitHub 仓库
  3. 项目设置里拿 `Client ID` 和内容管理 `Token`
  4. 写入 `.env`（模板见 `.env.example`）：`TINA_CLIENT_ID`、`TINA_TOKEN`
  5. 提交推送，仓库自动出现编辑入口（也可在 app.tina.io 里编辑）

**Strapi 5**

1. 服务器一台（VPS / Railway / Render 等），Node 18+，建议 2GB 内存
2. `npx create-strapi@latest` 建项目，定义 Content Types（对应 5 个集合手工建一遍）
3. 写迁移脚本：JSON → Strapi REST API 导入
4. 数据库决策：SQLite（单机够用）或 PostgreSQL（推荐生产）
5. 配置公开 API 权限（Public role 勾选 find/findOne）
6. 环境变量：`HOST`、`PORT`、`APP_KEYS`、`API_TOKEN_SALT`、`DATABASE_*`
7. 前端改造：数据获取层 + 构建流程 + 本地开发时 Strapi 与 Vite 双进程
8. 媒体库若要视频：配 S3/R2 provider（含桶、密钥、CORS）

## 为什么不选另外两个（一句话版）

- **GitCMS**：闭源 SaaS + 买断制，且以 Markdown 为中心——它解决的是"编辑 Markdown 像 Notion"，而我们仓库的事实源是 JSON。
- **Strapi 5**：本身是好产品，但它是"内容在库里"的完整后端，为静态 JSON 站点引入数据库 + 服务器运维 + 前端数据层重写，收益配不上成本；它的价值在多角色、工作流、REST/GraphQL 通用 API 这些本站用不上的能力。

## 本项目的 TinaCMS 使用速查

```bash
pnpm tina        # 本地编辑器（免登录）：改作品/长文/视频/资料，保存即写 content/
pnpm validate    # 内容与 schema 一致性校验（build 时自动跑）
pnpm build       # 校验 + 聚合 src/data/*.json + 构建 dist/
```

- Schema：`tina/config.ts`（加字段先改这里）
- 编辑保存 → `content/*.json` 变更 → Vite HMR 页面即时更新
- 履历时间线在编辑器中锁定增删（顺序靠文件名前缀 01-、02-…），新增条目本地复制 JSON 改名即可
- 内容变更与代码同走 Git，发布即 `git push`（部署平台自动构建）
