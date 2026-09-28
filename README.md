# Personal HQ Template · 个人数字经济小站 + 联邦协作网络

一个开箱即用的**个人数字总部模板**：你既是自己站点的唯一主人，也可以随时发起项目、让遍布各地的独立设计师 / 开发者 / 内容创作者来认领交付，按结果分佣。

不依赖任何平台：内容、客户、节点、数据都沉淀在**你自己的域名**下。

> 模板内所有「张三 / 示例项目A / 示例客户 / your-domain.com」均为占位内容，替换成你自己的资料即可上线。

---

## 这是什么

一句话：**一个「个人数字总部」+ 一套「结果导向的联邦协作网络」**。

- **个人数字总部**：你的身份卡、履历、作品、长文、视频、订阅，全部长在自己的域名上，机器可读（llms.txt + JSON-LD + 只读 API）。
- **协作网络**：你发起真实商业项目，写成「项目承接说明书」放进项目池；节点认领任务、按结果交付、按结果分佣。项目结束关系还在，下一个项目再聚。
- **联邦式协作**：每个节点都有自己的独立站和开放项目接口。核心原则是——

> **认领即连接，未认领不产生数据绑定。**
> 浏览与拉取（GET）只是读取展示；只有 POST /api/network/claim 才在双方之间建立项目绑定；此后仅对已认领项目轮询同步进度。未被认领的项目绝不混入任何一方的台账。

## 五层架构

```
┌─────────────────────────────────────────────────────────┐
│  1. 内容层   content/          一文档一文件，TinaCMS 可视化编辑    │
│             profile / timeline / works / writing / videos │
│             projects(项目池) / network(节点) / ops(内部台账) │
├─────────────────────────────────────────────────────────┤
│  2. 聚合层   scripts/sync-content.mjs   content → src/data │
├─────────────────────────────────────────────────────────┤
│  3. 展示层   src/pages/        首页 / About / 作品 / 长文 /    │
│             项目池 / network / workspace(内部工作台)        │
├─────────────────────────────────────────────────────────┤
│  4. 接口层   三通道同构：server.mjs(node) / api/(Vercel) /    │
│             edge-functions/(EdgeOne)，全部开放 CORS          │
├─────────────────────────────────────────────────────────┤
│  5. 联邦层   GET /api/network/projects  开放项目（联盟标准结构）│
│             POST /api/network/claim     认领即连接            │
│             GET /api/network/projects/{id}/status  轮询同步  │
└─────────────────────────────────────────────────────────┘
```

技术栈：React 19 + Tailwind CSS 4 + Vite 7，深浅双主题（默认深色暖灰），内容层接入 TinaCMS 可视化编辑（见 [CMS.md](./CMS.md)）。

## 快速开始（三步上线）

1. **生成你的仓库**：点击本仓库右上角 **Use this template** → Create new repository（或按 [JOIN.md](./JOIN.md) 的新手版步骤操作）。
2. **替换个人资料**：改 `content/profile/main.json`（姓名、定位、邮箱）和 `index.html` 的 `<title>`，再把 `content/` 下的示例内容换成你的。
3. **一键部署**：
   - **Vercel**：导入仓库 → Framework 选 Vite → Deploy，完成。
   - **EdgeOne Pages**：构建命令 `pnpm build`，输出目录 `dist`。
   - **自托管**：`pnpm install && pnpm build && node server.mjs`（端口 4173，认领落盘等完整能力推荐这种）。

部署后，把 `content/profile/main.json` 里的 `siteUrl` 换成你的真实域名，全站链接、openapi.yaml、claimUrl 会随之生效。

本地开发：

```bash
pnpm install
pnpm dev          # 开发：http://localhost:5173
pnpm tina         # 本地内容后台（TinaCMS）
pnpm build        # 校验内容 + 聚合 JSON + 产出 dist/
node server.mjs   # 生产：静态站点 + API，http://localhost:4173
```

## 如何修改信息（内容地图）

| 想改什么 | 去哪改 | 说明 |
|---|---|---|
| 姓名 / 头像 / 定位 / 邮箱 | `content/profile/main.json` | 头像文件在 `public/uploads/` |
| 履历时间线 | `content/timeline/*.json` | 一段经历一个文件 |
| 作品 / 长文 / 视频 | `content/works` · `writing` · `videos` | 字段校验见 `scripts/validate-content.mjs` |
| 项目池（对外可认领） | `content/projects/*.json` | 五要素：成熟度 / 基线路径 / 需要的结果 / 评判标准 / 分佣机制 |
| 联盟节点 | `content/network/*.json` | 含 `apiUrl`（开放项目接口），详见下文 |
| 内部台账 | `content/ops/` | projects / nodes / settlements / claims 四本台账 |
| 权限矩阵 | `content/ops/permissions.json` | 三角色 × 字段级可见性 |
| 工作台入口 / 密码 | `content/workspace/workspace.json` | 见下文「改密码」 |

改完 `content/` 里的任何文件，重新 `pnpm build`（或本地 `pnpm sync`）即可同步到页面与接口。也可以在 Tina 后台（`pnpm tina`）里可视化编辑。

## 如何暴露接口

模板自带以下只读/联邦接口（三通道行为一致，均开放 CORS）：

| 接口 | 方法 | 用途 |
|---|---|---|
| `/api/profile` | GET | 个人资料 JSON |
| `/api/works` / `/api/videos` | GET | 作品 / 视频列表 |
| `/api/network` | GET | 联盟节点列表（含 apiUrl） |
| `/api/network/projects` | GET | **开放项目（联盟标准结构）**：projectId / projectName / need / reward / status / publisher / claimUrl |
| `/api/network/claim` | POST | **认领即连接**：对方点击认领后，落盘一条「被谁认领」记录 |
| `/api/network/projects/{id}/status` | GET | 已认领项目的轮询同步端点 |

完整定义见 [public/openapi.yaml](./public/openapi.yaml)；给 AI 代理看的站点说明书在 [public/llms.txt](./public/llms.txt)。

> 注意：Vercel / EdgeOne 是静态通道，认领接口会以 `persisted:false` 降级返回（只确认不落盘）；**自托管 node server.mjs 才有完整落盘能力**（`content/ops/claims/`）。

## 如何加入联盟网络

1. **部署你自己的站**（上面三步），你的站自动获得 `GET /api/network/projects` 开放项目接口。
2. **把你的站告诉联盟发起人**：对方在 `content/network/` 里新增一个节点文件，填入你的名字、独立站地址和 `apiUrl`（即 `https://你的域名/api/network/projects`）。
3. **从此刻起**：任何人打开对方的 `/network` 页，点「查看TA开放的项目」就能实时浏览你的项目（只浏览、不产生同步）；点「认领」则向你的站 POST 认领请求，你的 `content/ops/claims/` 里会出现一条 incoming 记录。
4. **反过来**：在对方的 `/network` 页面点「认领」，你的工作台会出现一条 outbound 绑定记录，之后可点「同步认领项目」轮询对方进度。

互相把对方加进 `content/network/`，网络就长起来了。也欢迎到本仓库提 [申请加入联盟](https://github.com/Axiang334/personal-hq-template/issues/new?template=join-network.md) issue 互通节点。

## 内部工作台

`/workspace` 是带密码门的内部协同页，含四个视图：

- **发起端（我的视图）**：项目 / 节点 / 分佣 / 结算全量台账 + 联邦认领区（outbound / incoming）
- **项目端（客户视图）**：生成客户专属链接（`?project=<accessKey>&token=<sha256前8位>`），客户免密直达、只看自己项目，看不到分佣与成本
- **认领端（节点视图）**：节点只看可认领项目、自己的交付与分佣
- **客户视图门户**：专属链接的预览与生成

**改密码**：默认密码 `hq2026`，仅用于本地体验。修改方法——

```bash
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('你的新密码').digest('hex'))"
```

把输出的哈希替换 `content/workspace/workspace.json` 里的 `passwordSha256`，重新部署即可。

## 常见问题

**Q：一定要买域名吗？**
不必须，Vercel/EdgeOne 会送一个子域名；但协作网络的信任锚点是你自己的域名，强烈建议买一个。

**Q：数据存在哪？会不会丢？**
全部是 Git 仓库里的 JSON 文件（`content/`），版本可追溯；认领记录落盘在 `content/ops/claims/`，也在仓库里。不依赖任何数据库。

**Q：和 Notion 的关系？**
模板在 `/workspace` 里预留了 Notion 模板入口（发起端总台 / 客户视图 / 节点视图），用于把台账同步给不会看网站的人。不用 Notion 也不影响站点本身运行。

**Q：客户专属链接安全吗？**
链接含项目 Key + token（sha256 前 8 位），只暴露该项目的客户侧字段（进度 / 交付 / 数据表现），分佣规则、内部成本、节点个人分佣都在权限矩阵里对客户隐藏。介意的话可定期轮换 accessKey。

**Q：可以商用吗？**
可以，MIT 协议。拿去做你自己的生意、改头换面二次分发都行，唯一要求是保留版权声明。

**Q：怎么测试「认领即连接」全流程？**
最快的自测：在 `content/network/` 里把示例节点的 `apiUrl` 填成你自己的域名 → 部署 → 打开 `/network` 点「查看TA开放的项目」→ 拉到的是你自己开放的项目 → 点「认领」→ `/workspace` 发起端底部出现 outbound 记录、`content/ops/claims/` 出现 incoming 记录。

## 参与贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。业务向的新手指引见 [JOIN.md](./JOIN.md)。

## License

[MIT](./LICENSE)
