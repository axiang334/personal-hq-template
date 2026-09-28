import { defineConfig } from 'tinacms'

/**
 * TinaCMS 后台配置。
 *
 * 本地后台（无需任何账号）：
 *   npx tinacms dev -c "pnpm dev"
 *   → http://localhost:5173/admin/index.html
 *
 * 接入 Tina Cloud（远程编辑、多人协作）：
 *   1. https://app.tina.io 注册，创建项目并关联 GitHub 仓库
 *   2. 把 clientId 填到下方，或用环境变量 TINA_CLIENT_ID
 *   3. 本地写入 .env：TINA_CLIENT_ID=...、TINA_TOKEN=...
 *   4. 详见 DEPLOY.md「接入 Tina Cloud」一节
 */
export default defineConfig({
  clientId: process.env.TINA_CLIENT_ID || null,
  branch: process.env.TINA_BRANCH || null,
  token: process.env.TINA_TOKEN || null,
  admin: {
    auth: {
      // 本地 dev 模式免登录；接 Tina Cloud 后由平台接管认证
      useLocalAuth: true,
    },
  },
  media: {
    tina: {
      // 媒体库指向 public/uploads：上传即落盘，直接可被站点引用
      publicFolder: 'public',
      mediaRoot: 'uploads',
      static: false,
    },
    // 明确允许视频上传（Tina 媒体管理器原生支持 video/*）
    accept: ['image/*', 'video/mp4', 'video/webm', 'video/quicktime'],
  },
  build: {
    publicFolder: 'public',
    outputFolder: 'tina',
  },
  schema: {
    collections: [
      // ---------- 个人资料（全局单例） ----------
      {
        label: '个人资料',
        name: 'profile',
        path: 'content/profile',
        format: 'json',
        match: { include: 'main' },
        ui: {
          global: true,
          allowedActions: { create: false, delete: false, createNestedFolder: false },
        },
        fields: [
          { type: 'string', name: 'siteUrl', label: '站点域名' },
          { type: 'string', name: 'name', label: '姓名' },
          { type: 'string', name: 'nameEn', label: '拼音/英文名' },
          { type: 'image', name: 'avatar', label: '头像' },
          { type: 'string', name: 'jobTitle', label: '职业身份' },
          { type: 'string', name: 'tagline', label: '一句话定位' },
          {
            type: 'string',
            name: 'bio',
            label: '自我介绍',
            ui: { component: 'textarea' },
            description: '支持空行分段',
          },
          { type: 'string', name: 'tags', label: '身份标签', list: true },
          {
            type: 'object',
            name: 'status',
            label: '当前状态',
            fields: [
              { type: 'boolean', name: 'available', label: '可接受合作' },
              { type: 'string', name: 'availableText', label: '可合作文案' },
              { type: 'string', name: 'text', label: '正在做什么' },
            ],
          },
          { type: 'string', name: 'location', label: '所在地' },
          { type: 'string', name: 'email', label: '邮箱' },
          {
            type: 'object',
            name: 'socials',
            label: '社交链接',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: '名称' },
              { type: 'string', name: 'url', label: '地址' },
            ],
          },
        ],
      },

      // ---------- 作品 ----------
      {
        label: '作品',
        name: 'work',
        path: 'content/works',
        format: 'json',
        defaultItem: () => ({
          title: '新作品',
          category: '独立产品',
          year: String(new Date().getFullYear()),
          status: 'wip',
          statusText: '进行中',
          stack: [],
          highlight: false,
        }),
        fields: [
          { type: 'string', name: 'title', label: '名称', required: true },
          {
            type: 'string',
            name: 'summary',
            label: '简介',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'category',
            label: '类别',
            options: ['业务案例', '独立产品', '开源项目'],
          },
          { type: 'string', name: 'year', label: '年份' },
          {
            type: 'string',
            name: 'status',
            label: '状态',
            options: [
              { value: 'live', label: '已上线' },
              { value: 'wip', label: '进行中' },
              { value: 'maintained', label: '维护中' },
              { value: 'archived', label: '已归档' },
            ],
          },
          { type: 'string', name: 'statusText', label: '状态文案' },
          { type: 'string', name: 'stack', label: '技术栈', list: true },
          { type: 'string', name: 'link', label: '产品链接' },
          { type: 'string', name: 'repo', label: '源码链接' },
          { type: 'boolean', name: 'highlight', label: '首页精选' },
        ],
      },

      // ---------- 长文 ----------
      {
        label: '长文',
        name: 'writing',
        path: 'content/writing',
        format: 'json',
        defaultItem: () => ({
          title: '新文章',
          date: new Date().toISOString().slice(0, 10),
          tags: [],
          readingMinutes: 10,
        }),
        fields: [
          { type: 'string', name: 'title', label: '标题', required: true },
          { type: 'datetime', name: 'date', label: '发布日期', dateFormat: 'YYYY-MM-DD' },
          {
            type: 'string',
            name: 'summary',
            label: '摘要',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'tags', label: '标签', list: true },
          { type: 'number', name: 'readingMinutes', label: '阅读时长（分钟）' },
        ],
      },

      // ---------- 履历时间线 ----------
      {
        label: '履历时间线',
        name: 'timeline',
        path: 'content/timeline',
        format: 'json',
        ui: {
          // 顺序由文件名前缀（01-、02-…）决定；禁止在后台增删，避免顺序错乱。
          // 新增履历：本地复制一个 json 改内容与文件名前缀。
          allowedActions: { create: false, delete: false, createNestedFolder: false },
        },
        fields: [
          { type: 'string', name: 'period', label: '时间段', required: true },
          { type: 'string', name: 'title', label: '职位/阶段' },
          { type: 'string', name: 'org', label: '组织' },
          {
            type: 'string',
            name: 'description',
            label: '描述',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'tags', label: '标签', list: true },
        ],
      },

      // ---------- 视频 ----------
      {
        label: '视频',
        name: 'video',
        path: 'content/videos',
        format: 'json',
        defaultItem: () => ({
          title: '新视频',
          date: new Date().toISOString().slice(0, 10),
          platform: 'bilibili',
          duration: '00:00',
          tags: [],
        }),
        fields: [
          { type: 'string', name: 'title', label: '标题', required: true },
          { type: 'datetime', name: 'date', label: '发布日期', dateFormat: 'YYYY-MM-DD' },
          {
            type: 'string',
            name: 'summary',
            label: '简介',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'platform',
            label: '平台',
            options: [
              { value: 'bilibili', label: 'Bilibili（嵌入播放）' },
              { value: 'youtube', label: 'YouTube（嵌入播放）' },
              { value: 'direct', label: '本站文件（媒体库直传）' },
            ],
          },
          {
            type: 'string',
            name: 'url',
            label: '外链地址',
            description: 'platform 为 bilibili / youtube 时填写视频页地址',
          },
          {
            type: 'image',
            name: 'file',
            label: '视频文件',
            accept: 'video',
            description: 'platform 为 direct 时从媒体库选择或上传（mp4/webm）',
          },
          { type: 'image', name: 'cover', label: '封面图' },
          { type: 'string', name: 'duration', label: '时长（mm:ss）' },
          { type: 'string', name: 'tags', label: '标签', list: true },
        ],
      },

      // ---------- 联盟成员（协作网络） ----------
      {
        label: '联盟成员',
        name: 'member',
        path: 'content/network',
        format: 'json',
        defaultItem: () => ({
          name: '新成员',
          role: '定位 · 角色',
          tags: [],
          siteName: 'TA 的独立站',
          siteUrl: 'https://',
          avatar: '',
          bio: '',
        }),
        fields: [
          { type: 'string', name: 'name', label: '称呼', required: true },
          { type: 'string', name: 'role', label: '定位' },
          { type: 'string', name: 'tags', label: '能力标签', list: true },
          { type: 'string', name: 'claim', label: '可认领方向', description: '如：可认领工具类项目的开发与上线' },
          { type: 'string', name: 'siteName', label: '独立站名称' },
          { type: 'string', name: 'siteUrl', label: '独立站地址' },
          {
            type: 'string',
            name: 'apiUrl',
            label: '开放项目接口',
            description: '对方站点的 GET /api/network/projects 地址（联盟标准结构）；留空 = 未开放接口',
          },
          { type: 'image', name: 'avatar', label: '头像' },
          {
            type: 'string',
            name: 'bio',
            label: '一句话简介',
            ui: { component: 'textarea' },
          },
        ],
      },

      // 联邦认领台账（认领即连接：只有被认领的项目才在这里产生记录）
      {
        label: '台账 · 联邦认领',
        name: 'opsClaim',
        path: 'content/ops/claims',
        format: 'json',
        defaultItem: () => ({
          direction: 'incoming',
          claimId: '',
          projectId: '',
          projectName: '',
          nodeApiUrl: '',
          claimerName: '',
          claimerSite: '',
          contact: '',
          message: '',
          status: 'pending',
          remoteStatus: 'pending',
          progress: '',
          claimedAt: '',
          receivedAt: new Date().toISOString(),
          lastSyncedAt: null,
        }),
        ui: {
          // 认领记录由接口自动写入（POST /api/network/claim 与 /api/ops/outbound-claim），
          // 后台可改状态与进度，但不开放增删，避免破坏绑定关系。
          allowedActions: { create: false, delete: false, createNestedFolder: false },
        },
        fields: [
          {
            type: 'string', name: 'direction', label: '方向',
            options: [
              { value: 'incoming', label: '收到的认领' },
              { value: 'outbound', label: '发出的认领' },
            ],
          },
          { type: 'string', name: 'claimId', label: '认领 ID' },
          { type: 'string', name: 'projectId', label: '项目 ID' },
          { type: 'string', name: 'projectName', label: '项目名' },
          { type: 'string', name: 'nodeApiUrl', label: '对方接口地址', description: 'outbound 记录专用，轮询同步用' },
          { type: 'string', name: 'claimerName', label: '认领方' },
          { type: 'string', name: 'claimerSite', label: '认领方站点' },
          { type: 'string', name: 'contact', label: '联系方式' },
          { type: 'string', name: 'message', label: '认领说明', ui: { component: 'textarea' } },
          {
            type: 'string', name: 'status', label: '本方状态',
            options: [
              { value: 'pending', label: '待确认' },
              { value: 'active', label: '协作中' },
              { value: 'done', label: '已完成' },
              { value: 'rejected', label: '已婉拒' },
            ],
          },
          {
            type: 'string', name: 'remoteStatus', label: '对方状态',
            description: 'outbound 记录专用：轮询 /api/network/projects/{id}/status 得到',
            options: [
              { value: 'pending', label: '待同步' },
              { value: 'open', label: '对方显示可认领' },
              { value: 'claimed', label: '对方显示已认领' },
              { value: 'delivered', label: '对方显示已交付' },
            ],
          },
          { type: 'string', name: 'progress', label: '对方进度' },
          { type: 'string', name: 'claimedAt', label: '认领时间' },
          { type: 'string', name: 'receivedAt', label: '收到时间' },
          { type: 'string', name: 'lastSyncedAt', label: '最后同步时间' },
        ],
      },

      // ---------- 内部工作台：三角结构台账（页面 noindex） ----------
      // 三本台账 + 一份字段级权限矩阵，支撑 /workspace 三种角色视图。
      // 注意：真实分佣/成本等敏感数据建议只维护在 Notion（会随前端打包，详见 README）。

      // 内部项目台账
      {
        label: '台账 · 项目',
        name: 'opsProject',
        path: 'content/ops/projects',
        format: 'json',
        defaultItem: () => ({
          name: '新内部项目',
          accessKey: '',
          startDate: new Date().toISOString().slice(0, 7),
          stage: '',
          team: [],
          billing: '',
          client: '',
          clientKey: '',
          status: '进行中',
          progress: '',
          deliverables: '',
          metrics: [{ label: '播放量', value: '——（待填）' }],
          node: '',
          commission: '',
          cost: '——（占位）',
          settlement: '',
          recruiting: false,
        }),
        fields: [
          { type: 'string', name: 'name', label: '项目名', required: true },
          { type: 'string', name: 'accessKey', label: '项目 Key', description: '客户专属链接用；如 exampleA2026，改后旧链接失效' },
          { type: 'string', name: 'startDate', label: '开始时间', description: '格式 YYYY-MM，客户视图可见' },
          {
            type: 'object', name: 'team', label: '认领情况', list: true,
            description: '节点名与职责（客户可见职责，不可见分佣）',
            fields: [
              { type: 'string', name: 'name', label: '节点' },
              { type: 'string', name: 'duty', label: '职责' },
            ],
          },
          { type: 'string', name: 'stage', label: '当前阶段', description: '交付进度当前阶段，客户视图可见' },
          {
            type: 'string', name: 'billing', label: '结算状态（客户侧）',
            ui: { component: 'textarea' },
            description: '客户视角的商务结算环节；节点不可见',
          },
          { type: 'string', name: 'client', label: '客户', description: '客户视图按 clientKey 匹配' },
          { type: 'string', name: 'clientKey', label: '客户身份键', description: '如 client-a；自营项目填 self' },
          {
            type: 'string', name: 'status', label: '状态',
            options: [
              { value: '招募中', label: '招募中' },
              { value: '进行中', label: '进行中' },
              { value: '已交付', label: '已交付' },
            ],
          },
          { type: 'string', name: 'progress', label: '进度', ui: { component: 'textarea' } },
          { type: 'string', name: 'deliverables', label: '交付结果', ui: { component: 'textarea' } },
          {
            type: 'object', name: 'metrics', label: '数据表现', list: true,
            description: '播放量 / 线索量等数据表现（客户可见）',
            fields: [
              { type: 'string', name: 'label', label: '指标' },
              { type: 'string', name: 'value', label: '数值' },
            ],
          },
          { type: 'string', name: 'node', label: '认领节点', description: '客户不可见；留空 = 待认领' },
          { type: 'string', name: 'nodeKey', label: '节点身份键', description: '与台账·节点的 nodeKey 对应，用于节点视图行级过滤' },
          { type: 'string', name: 'commission', label: '分佣规则', description: '客户不可见' },
          { type: 'string', name: 'cost', label: '内部成本', description: '仅发起端可见' },
          { type: 'string', name: 'settlement', label: '结算状态', description: '仅发起端可见' },
          { type: 'boolean', name: 'recruiting', label: '开放认领', description: '打开后出现在节点视图「可认领项目」' },
        ],
      },

      // 内部节点名册
      {
        label: '台账 · 节点',
        name: 'opsNode',
        path: 'content/ops/nodes',
        format: 'json',
        defaultItem: () => ({
          name: '新节点',
          nodeKey: '',
          direction: '',
          tags: [],
          projects: [],
          status: '待命',
          note: '',
        }),
        fields: [
          { type: 'string', name: 'name', label: '节点称呼', required: true },
          { type: 'string', name: 'nodeKey', label: '节点身份键', description: '如 member-a；节点视图按它匹配行级数据' },
          { type: 'string', name: 'direction', label: '认领方向' },
          { type: 'string', name: 'tags', label: '能力标签', list: true },
          { type: 'string', name: 'projects', label: '参与项目', list: true },
          {
            type: 'string', name: 'status', label: '协作状态',
            options: [
              { value: '待命', label: '待命' },
              { value: '协作中', label: '协作中' },
              { value: '暂停', label: '暂停' },
            ],
          },
          { type: 'string', name: 'note', label: '内部备注', description: '仅发起端可见' },
        ],
      },

      // 结算台账
      {
        label: '台账 · 结算',
        name: 'opsSettlement',
        path: 'content/ops/settlements',
        format: 'json',
        defaultItem: () => ({
          project: '',
          clientKey: '',
          node: '',
          nodeKey: '',
          type: '基础费',
          amount: '¥ ——（占位）',
          status: '待结算',
          date: new Date().toISOString().slice(0, 7),
        }),
        fields: [
          { type: 'string', name: 'project', label: '项目', required: true },
          { type: 'string', name: 'clientKey', label: '客户身份键' },
          { type: 'string', name: 'node', label: '节点' },
          { type: 'string', name: 'nodeKey', label: '节点身份键', description: '节点视图按它过滤自己的分佣记录' },
          {
            type: 'string', name: 'type', label: '类型',
            options: [
              { value: '基础费', label: '基础费' },
              { value: '结果提成', label: '结果提成' },
            ],
          },
          { type: 'string', name: 'amount', label: '金额' },
          {
            type: 'string', name: 'status', label: '状态',
            options: [
              { value: '待结算', label: '待结算' },
              { value: '结算中', label: '结算中' },
              { value: '已结算', label: '已结算' },
            ],
          },
          { type: 'string', name: 'date', label: '月份', description: '格式 YYYY-MM' },
        ],
      },

      // 字段级权限矩阵（三种视图的可见性规则，单例）
      {
        label: '台账 · 视图权限矩阵',
        name: 'opsPermissions',
        path: 'content/ops',
        format: 'json',
        match: { include: 'permissions' },
        ui: {
          global: true,
          allowedActions: { create: false, delete: false, createNestedFolder: false },
        },
        fields: [
          {
            type: 'object', name: 'roles', label: '角色定义', list: true,
            fields: [
              { type: 'string', name: 'key', label: '角色键', description: 'owner / client / node' },
              { type: 'string', name: 'label', label: '显示名' },
              { type: 'string', name: 'desc', label: '视图说明', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object', name: 'projectFields', label: '项目字段权限', list: true,
            description: 'roles 勾选哪些角色可见该字段',
            fields: [
              { type: 'string', name: 'field', label: '字段名' },
              { type: 'string', name: 'label', label: '显示名' },
              { type: 'string', name: 'roles', label: '可见角色', list: true, options: ['owner', 'client', 'node'] },
            ],
          },
          {
            type: 'object', name: 'nodeFields', label: '节点字段权限', list: true,
            fields: [
              { type: 'string', name: 'field', label: '字段名' },
              { type: 'string', name: 'label', label: '显示名' },
              { type: 'string', name: 'roles', label: '可见角色', list: true, options: ['owner', 'client', 'node'] },
            ],
          },
          {
            type: 'object', name: 'settlementFields', label: '结算字段权限', list: true,
            fields: [
              { type: 'string', name: 'field', label: '字段名' },
              { type: 'string', name: 'label', label: '显示名' },
              { type: 'string', name: 'roles', label: '可见角色', list: true, options: ['owner', 'client', 'node'] },
            ],
          },
          {
            type: 'object', name: 'rowRules', label: '行级过滤规则说明',
            fields: [
              { type: 'string', name: 'client', label: '客户视图规则' },
              { type: 'string', name: 'node', label: '节点视图规则' },
            ],
          },
        ],
      },

      // ---------- 内部门禁与 Notion 入口（全局单例） ----------
      {
        label: '内部工作台',
        name: 'workspace',
        path: 'content/workspace',
        format: 'json',
        match: { include: 'workspace' },
        ui: {
          global: true,
          allowedActions: { create: false, delete: false, createNestedFolder: false },
        },
        fields: [
          { type: 'string', name: 'title', label: '入口名称' },
          {
            type: 'string',
            name: 'passwordSha256',
            label: '门禁密码（SHA-256）',
            description: '生成命令见 README「内部工作台」一节；替换后立即生效',
          },
          { type: 'string', name: 'hint', label: '门禁提示语' },
          { type: 'string', name: 'notionUrl', label: 'Notion 工作台地址' },
          { type: 'string', name: 'notionName', label: 'Notion 入口名称' },
          {
            type: 'object',
            name: 'links',
            label: '内部快捷链接',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: '名称' },
              { type: 'string', name: 'url', label: '地址' },
              { type: 'string', name: 'note', label: '说明' },
              {
                type: 'string', name: 'role', label: '所属视图',
                options: [
                  { value: 'owner', label: '发起端' },
                  { value: 'client', label: '客户视图' },
                  { value: 'node', label: '节点视图' },
                ],
                description: '标记该链接属于哪个角色视图，页面按角色展示',
              },
            ],
          },
        ],
      },

      // ---------- 协作项目（需求招募 / 交付案例） ----------
      {
        label: '协作项目',
        name: 'project',
        path: 'content/projects',
        format: 'json',
        defaultItem: () => ({
          title: '新项目',
          type: 'recruiting',
          owner: '',
          participants: [],
          tags: [],
          date: new Date().toISOString().slice(0, 10),
          statusText: '招募中',
        }),
        fields: [
          { type: 'string', name: 'title', label: '项目名', required: true },
          {
            type: 'string',
            name: 'maturity',
            label: '项目成熟度',
            description: '如：已跑通 0-1，模型已验证 / 已跑通 0-1，并完成规模化复制（0-100）',
          },
          {
            type: 'string',
            name: 'baseline',
            label: '基线路径（SOP 参考）',
            ui: { component: 'textarea' },
            description: '过去怎么做的；认领者可参考执行，也允许迭代，一切以结果为准',
          },
          {
            type: 'string',
            name: 'criteria',
            label: '评判标准',
            ui: { component: 'textarea' },
            description: '什么是合格的结果，验收口径',
          },
          {
            type: 'string',
            name: 'type',
            label: '板块',
            options: [
              { value: 'recruiting', label: '需求招募' },
              { value: 'delivered', label: '交付案例' },
            ],
          },
          {
            type: 'string',
            name: 'summary',
            label: '描述',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'need',
            label: '需要的结果',
            ui: { component: 'textarea' },
            description: '招募中写「需要交付：…」，已交付写「已交付：…」',
          },
          {
            type: 'string',
            name: 'reward',
            label: '分佣机制',
            description: '如：基础费 + 结果提成',
          },
          { type: 'string', name: 'owner', label: '发起人' },
          { type: 'string', name: 'role', label: '我的角色', description: '如：项目操盘手 / 业务负责人（选填）' },
          { type: 'string', name: 'participants', label: '参与成员', list: true },
          { type: 'string', name: 'tags', label: '标签', list: true },
          { type: 'datetime', name: 'date', label: '日期', dateFormat: 'YYYY-MM-DD' },
          { type: 'string', name: 'statusText', label: '状态文案' },
        ],
      },
    ],
  },
})
