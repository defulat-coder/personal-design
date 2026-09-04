# Agent Instructions

## Package Manager

Use **pnpm** (11.x, workspaces): `pnpm install`, `pnpm dev`, `pnpm build`

## Dev Server

- `pnpm dev` 通过 [portless](https://github.com/vercel-labs/portless)（全局安装）启动，站点在 **https://personal-design.localhost**（HTTPS + HTTP/2，无端口）
- 路由名在根 `portless.json` 配置；绕过代理直连端口用 `pnpm dev:direct`（http://localhost:3000）

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: (the agent model's name and attribution byline)
```

## File-Scoped Commands

| Task | Command |
| --- | --- |
| Typecheck (one pkg) | `pnpm --filter @personal-design/web typecheck` |
| Lint (one file) | `pnpm --filter @personal-design/web exec eslint <file>` |
| Sync layout images | `pnpm sync:layouts`（幂等，已生成的 WebP 会跳过） |
| Sync inspora 数据 | `pnpm sync:inspora`（增量；`-- --full` 全量 backfill；需先 `pnpm --filter @personal-design/inspora exec playwright install chromium`） |

## Monorepo Conventions

- `apps/web` — 唯一站点（Next.js 16 App Router + Tailwind v4），产品集门户
- `packages/<product>` — 每个产品的内容/数据包（catalog、类型、同步脚本）
- 新增产品：`packages/<product>` + `apps/web/app/products/<slug>/` + 在 `apps/web/lib/products.ts` 注册（必填 `date` 上线日期，首页时间轴按它排序；必填 `line` 线路标识，并在 `globals.css` 配一条明暗成套的 `--color-line-*` 线路色）；需要独立部署才拆 `apps/<product>`
- 首页是横向 lifeline 时间轴（`apps/web/components/lifeline/`：滚动驱动 rail + 列车进度点、灯箱），零动画库依赖，手写 rAF；时间轴节点用 `LifelineTimeline` + `LifelineNode` 组合
- 产品列表页：灵感集（muse）用图版拼幅 `apps/web/components/plate-wall.tsx`；布局参考用灵感墙 `apps/web/components/layout-wall.tsx`（两行反向 marquee「双向行车」、分类 tab 重发、点击灯箱；刊头站牌化带 L·01 编号牌）
- 站点内图片一律放 `apps/web/public/`，由包的同步脚本生成，不手写路径
- 页脚不放协议/署名行；CC BY 法律署名收在首页「关于」节点（`home-view.tsx` 引包的 `upstream` 常量）
- 产品 truth 在 `PRODUCT.md`，视觉系统在 `DESIGN.md`（地铁导视系统：纸白站牌底/信号黑/3px 线路带、每产品一条功能线路色、展示字 Barlow Condensed、明暗切换 `html[data-theme]`、直角唯站环正圆、mono 只载数据）；改 UI 前先读 `DESIGN.md`，新表面沿用它的 tokens 与规则

## layout-compositions 包

- `catalog.json` 是上游原样拷贝，**不要改内容**；`category_slug`、`id` 是稳定标识
- 上游 v2 图片存在系统性图文错位，`corrections.json` 记录「内容 id → 实际源文件」的纠正映射（319 条 v2 重映射、3 条 v1 补齐、8 条上游缺失）；sync 脚本与 `hasImage()` 都依赖它，改动前先看脚本里的说明
- 查询一律用 `src/index.ts` 的 API（`catalog`、`categories`、`imageUrl`、`thumbnailUrl`、`hasImage`…），不在 app 里拼路径
- 图片署名（CC BY 4.0）统一收在首页「关于」节点，引用包的 `upstream` 常量渲染，不在各页脚重复

## inspora 包

- 从 inspora.design 增量同步的灵感库：`inspora.db`（SQLite，`node:sqlite` 读写）+ `apps/web/public/inspora/`（媒体全量本地化），两者都是生成物但随仓库提交
- 列表 API `/api/posts` 被 Vercel checkpoint 拦截，sync 脚本必须用 Playwright 在页面上下文里 fetch；详情无 API，从 `/posts/<slug>` HTML 的 RSC payload 提取（脚本头部注释有完整说明）
- 增量逻辑：feed 遇到已入库 id 即停；`enriched_at IS NULL` 才补详情；媒体按文件存在性跳过——可随时中断重跑
- 查询一律用 `src/index.ts` 的 API（`listPosts`、`getPostBySlug`、`listCategories`、`upstreamUrl`…），不在 app 里读 DB、不拼路径
- 每条内容的原始出处（`sourceUrl`，多为 X 原帖）与原始 JSON 在详情页「原始信息」区展示，是产品的核心承诺，改动页面时保留
- 产品对外的名字是「灵感集」，路由 `/products/muse`；**访客可见处（文案、链接、metadata）一律不得出现来源站点名**，事实性描述只留在本文件与包/脚本注释里
- 列表是 CSS columns 瀑布流（视频静音自动播放、IO 控制播停），详情是「左媒体 snap 轮播 + 右图签侧栏」；视觉从 `DESIGN.md`，不再复刻来源站样式
