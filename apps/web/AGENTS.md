# Web frontend instructions

- 先读根 `AGENTS.md`；设计迁入规则见 [rules.md](../../docs/design/open-design/rules.md)，当前实现记录见根 `DESIGN.md`。
- 源规范采用与有意适配见 rules.md 末尾；V2 用户已授权替换旧 UI/UX，旧报告仅作历史记录。当前页面职责见根 DESIGN.md 和 `docs/design/redesign-v2/contract.md`。
- 首页即产品菜单，不添加全站产品导航。外壳仅品牌/首页链接与主题控制；列表静态网格直达详情，灯箱仅在详情放大；资料自然排在媒体下方。
- 灵感列表不自动播放、不自动追加；保留明确加载更多与返回现场。布局参考缺图条目保留检索和详情入口。视频详情测量可用高度以保留控制，仅视频适用，图片继续大尺寸阅读。
- 全局 CSS 只放 tokens、reset、基础排印和有明确归属的共享布局契约。新增组件专属样式优先相邻 `*.module.css`；现有 Tailwind 工具类可沿用。
- 优先复用 `components/` 的现有控件；缺失的基础控件在本地小范围补齐。不要直接引用本站不存在的 `@open-design/components`。
- 产品布局留在 app，通用控件保持职责小；内容标签与特殊控件保留原生 HTML 语义。
- 字体、圆角、色彩、控件状态按迁入规则及对应源文件核对；中文标题字距为 0，中文多行标题不继承 Latin 紧行高。
- 动效区分进入、退出和高频反馈；保留 reduced-motion、键盘操作、焦点回归及既有零动画库约束。
- 样式拆分保持级联顺序；不要把大规模机械搬移混进视觉/行为变更。
- 按实际数据路径覆盖加载、空、错误、有内容、极端内容；不为满足参考案例虚构账户、支付、客服等功能。
- 类型检查：`pnpm --filter @personal-design/web typecheck`。
- 单文件 lint：在 `apps/web` 路径下执行 `pnpm exec eslint <file>`；改交互或布局时检查对应页面的桌面、手机、键盘与主题。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
