# 部署指南

项目当前已通过发布通道上线，可先用预览链接验证效果；要长期托管到自己的平台（Vercel / EdgeOne Pages），按第二节的步骤操作，所需配置文件均已备好。

## 一、当前在线预览

站点 + `/api` 只读接口同端口运行，部署前可直接分享验证：

- 首页与路由：直接访问即可
- 接口：`/api/profile`、`/api/works`
- 结构层文件：`/llms.txt`、`/openapi.yaml`、`/agent-prompt.md`

## 二、部署到自己的平台

**部署前先完成占位替换**（详见 README）：

1. `src/data/profile.json` 中的 `siteUrl`、`email`、`socials`
2. `public/llms.txt`、`public/openapi.yaml`、`public/agent-prompt.md` 中的 `your-domain.com`
3. 替换 `public/uploads/avatar.jpg` 为自己的头像（照片已内置）

### 方式一：Vercel（推荐，开箱即用）

项目已包含：

- `vercel.json` —— 构建配置（Vite 自动识别）+ SPA 路由回退
- `api/profile.js`、`api/works.js` —— 两个 Serverless 函数，自动映射到 `/api/profile`、`/api/works`

CLI 一键部署：

```bash
npm i -g vercel
cd personal-hq
vercel          # 首次运行按提示登录并关联项目
vercel --prod   # 发布到生产
```

或 Git 方式：推送到 GitHub → Vercel 控制台导入仓库 → 自动识别 Vite，无需改任何配置。

### 方式二：EdgeOne Pages

项目已包含：

- `edgeone.json` —— 构建配置 + SPA 回退（`"/" → "/index.html"` 是 EdgeOne 专用的 SPA fallback 写法，静态资源与函数优先匹配）
- `edge-functions/api/profile.js`、`edge-functions/api/works.js` —— 两个边缘函数

步骤：

1. 推送仓库到 GitHub / GitLab / Gitee
2. [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages) → 创建项目 → 导入 Git 仓库，构建配置自动读取 `edgeone.json`
3. 或用 CLI：`npm i -g edgeone`，项目目录内 `edgeone pages link` 关联后推送触发自动构建

两个注意点：

- **Node 版本**：Vite 7 要求 Node ≥ 20.19 / ≥ 22.12。若平台构建环境 Node 较低导致构建失败，执行 `pnpm add -D vite@^6.3.5` 降级 Vite（Tailwind v4 与 `@vitejs/plugin-react` 均兼容 Vite 6），重新推送即可。
- **函数目录**：当前官方文档标准为 `edge-functions/`；若使用旧版 `functions/` 目录约定的项目导入，把 `edge-functions/api/` 改名为 `functions/api/` 即可，文件内容不变。

## 三、部署后检查清单

- [ ] 首页身份卡片、头像、标签、状态渲染正常
- [ ] `/works` `/writing` `/about` `/subscribe` 直接输入地址打开不 404（SPA 回退）
- [ ] `/api/profile` `/api/works` 返回 JSON
- [ ] `/llms.txt` `/openapi.yaml` `/agent-prompt.md` 可直接访问
- [ ] 深浅主题切换正常（默认跟随系统）
- [ ] 右下角数字分身面板可展开、可输入
- [ ] 替换正式域名后，各页 JSON-LD 中的 URL 已同步（改 `profile.json` 的 `siteUrl` 后重新构建）
