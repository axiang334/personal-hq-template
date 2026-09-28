# 贡献指南

感谢你对 Personal HQ Template 的关注！本模板的目标是：让每个独立的人都能拥有自己的数字总部，并通过联邦协作网络按结果合作。

## 可以贡献什么

- **代码**：Bug 修复、新接口、部署通道（如 Cloudflare Pages / Netlify）、TinaCMS 编辑体验
- **文档**：错别字、更清晰的步骤、更多部署场景截图
- **联邦协议**：对「认领即连接」协议的演进建议（如 Webhook 推送、认领撤销、进度回写）
- **最佳实践**：你的项目承接说明书模板、分佣机制设计、客户门户玩法

## 开发环境

```bash
git clone https://github.com/Axiang334/personal-hq-template.git
cd personal-hq-template
pnpm install
pnpm dev          # http://localhost:5173
pnpm tina         # TinaCMS 内容后台
pnpm build        # 校验 + 聚合 + 构建（提交前必须通过）
```

## 提交规范

1. 从 `main` 拉出功能分支：`feat/xxx` 或 `fix/xxx`
2. 提交信息用中文或英文均可，格式建议 `feat: 支持 xxx` / `fix: 修复 xxx`
3. 提交前跑 `pnpm build`（内含 `validate-content.mjs` 内容校验，不通过无法构建）
4. 发起 Pull Request，描述清楚：改了什么、为什么、怎么验证

## 内容数据约定

- 不要在仓库里提交任何真实个人信息、客户名、金额（模板本身保持纯占位）
- `content/` 的字段结构由 `tina/config.ts` 与 `scripts/validate-content.mjs` 约束，新增字段请同步更新这两处
- 联邦接口的输出结构（`projectId / projectName / need / reward / status / publisher / claimUrl`）是联盟协议的一部分，**破坏性变更需要先开 issue 讨论**

## 接口变更约定

- 三通道（`server.mjs` / `api/` Vercel / `edge-functions/` EdgeOne）必须保持行为一致，公共逻辑放 `scripts/federation.mjs`
- 新增接口请同步更新 `public/openapi.yaml` 与 `public/llms.txt`

## Issue

- Bug 与功能建议：普通 issue
- 申请加入联盟：使用 [join-network.md](https://github.com/Axiang334/personal-hq-template/issues/new?template=join-network.md) 模板
