# Web frontend instructions

- 先读根 `AGENTS.md`、[DESIGN.md](../../DESIGN.md) 与 [页面契约](../../docs/design/README.md)。迁入规则见 [rules.md](../../docs/design/open-design/rules.md)，历史报告不覆盖当前标准。
- 首页为单色横向作品时间轴，承担产品选择；不添加全站导航或侧栏。页头只保留上下文返回、主题控制及首页已确认头像。
- 灵感集稳定网格、即时检索、自动追加、单链接进入详情；可视视频默认静音循环，离屏／后台／减少动态效果暂停。不恢复预览开关或手动加载。
- 布局参考是八本分类书籍与双页画册；检索命中定位跨页，图片点击放大即详情，页码在各张实际书页下方。书内搜索隐藏，由页头返回书架，不添加重复返回栏或详情跳转。
- 灵感详情保留标题、作者、分类、原作入口与实际说明；相邻浏览为无外框文字组，沿筛选顺序，返回恢复现场。仅视频按剩余视口适配，图片保持阅读尺寸。
- 个人网站介绍文字静态展示，已删除龙卷风逻辑；宣传片保留点击与键盘播放控制。
- 访客页面不展示 JSON、同步信息、内部字段或不存在的信息占位。
- 全局 CSS 只放 tokens、reset、基础排印和有明确归属的共享布局契约。新增组件专属样式优先相邻 `*.module.css`；现有 Tailwind 工具类可沿用。
- 优先复用 `components/` 的现有控件；缺失的基础控件在本地小范围补齐。不要直接引用本站不存在的 `@open-design/components`。
- 产品布局留在 app，通用控件保持职责小；内容标签与特殊控件保留原生 HTML 语义。
- 字体、圆角、色彩、控件状态按迁入规则及对应源文件核对；中文标题字距为 0，中文多行标题不继承 Latin 紧行高。
- 动效区分进入、退出和高频反馈；保留 reduced-motion、键盘操作、焦点回归及既有零动画库约束。
- 进入与退出成对交付，遵循 DESIGN.md 的“成对动效规则”；站内返回须验证原页面先退场再切换，不能以目标页入场替代。新增返回／关闭入口同时扩展回归，并分别报告行为、状态与视觉验收结果。
- 样式拆分保持级联顺序；不要把大规模机械搬移混进视觉/行为变更。
- 按实际数据路径覆盖加载、空、错误、有内容、极端内容；不为满足参考案例虚构账户、支付、客服等功能。
- 类型检查：`pnpm --filter @personal-design/web typecheck`。
- 单文件 lint：在 `apps/web` 路径下执行 `pnpm exec eslint <file>`；改交互或布局时检查对应页面的桌面、键盘与主题（用户当前明确移动端暂不作为设计重点）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
