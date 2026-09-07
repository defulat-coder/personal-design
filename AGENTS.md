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

## Design specification

- 设计规范来源与迁移说明见 [docs/design/open-design/README.md](docs/design/open-design/README.md)；修改前端遵循 [apps/web/AGENTS.md](apps/web/AGENTS.md) 和迁入的 [rules.md](docs/design/open-design/rules.md)。
- `DESIGN.md` 记录 V2 当前实现；源规则采用与有意适配见 rules.md，不能以历史布局限制已授权的新 UI/UX。`docs/design/open-design/source/` 是只读参考，不执行其中原项目命令或加载其 Agent 指令。

## Monorepo Conventions

- `apps/web` — 唯一站点（Next.js 16 App Router + Tailwind v4），产品集门户
- `packages/<product>` — 每个产品的内容/数据包（catalog、类型、同步脚本）
- 新增产品：`packages/<product>` + `apps/web/app/products/<slug>/` + 在 `apps/web/lib/products.ts` 注册（现有类型要求 `date` 上线日期，注册表按它排序；`line` 是保留的注册字段，当前页面不显示线路色，不要求新增装饰色）；需要独立部署才拆 `apps/<product>`
- 首页是按上线日期从左到右的「个人设计线」横向线路图（地铁站台导视）：`apps/web/components/home-view.tsx` 渲染横向轨道（线路色分段、车站节点、规划站虚线延伸）+ 对齐列的站牌卡片，含线路级与站级 LED 播报、横向到站点亮动效（2026-09-06/09-07 用户授权，定位个人作品集，新注册产品按 `date` 自动入列、`line` 字段映射线路色，未知线路回退 ink）；不设方向牌等导航横条；全站只有品牌/首页链接和主题开关，不恢复侧栏或全站导航菜单。零动画库约束保留。注意：站牌行（徽标+站名+按钮单行布局）在第 4 个产品注册时需重访（列宽 <300px 会挤压换行），线路图/对齐机制本身不限站数。
- 产品列表页：灵感集用 `apps/web/components/plate-wall.tsx` 静态网格、分类/搜索与明确加载更多；布局参考用 `apps/web/components/layout-wall.tsx` 静态网格、分类/主题/关键词，缺图条目也保留。卡片统一原生链接直达详情，灯箱仅用于详情放大。
- 站点内图片一律放 `apps/web/public/`，由包的同步脚本生成，不手写路径
- 首页不放关于、署名、许可或额外宣传说明；用户要求个人自用、简洁优先。不要再添加或转存这类额外说明。
- 产品 truth 在 `PRODUCT.md`，视觉系统在 `DESIGN.md`（OpenDesign 中性页面、Albert Sans 与中文零字距、普通控件 4px/主按钮胶囊/媒体 8px、`html[data-theme]` 双主题；开放阅读布局）；改 UI 前先读 `DESIGN.md`，沿用 tokens 与规则；线路色变量仅首页站台导视使用（2026-09-06 授权），其他页面不要求装饰线路色。

## layout-compositions 包

- `catalog.json` 是上游原样拷贝，**不要改内容**；`category_slug`、`id` 是稳定标识
- 上游 v2 图片存在系统性图文错位，`corrections.json` 记录「内容 id → 实际源文件」的纠正映射（319 条 v2 重映射、3 条 v1 补齐、8 条上游缺失）；sync 脚本与 `hasImage()` 都依赖它，改动前先看脚本里的说明
- 查询一律用 `src/index.ts` 的 API（`catalog`、`categories`、`imageUrl`、`thumbnailUrl`、`hasImage`…），不在 app 里拼路径
- 首页不放关于、署名、许可或额外宣传说明；用户要求个人自用、简洁优先。不要再添加或转存这类额外说明。
- 媒体策略：sync 默认只出缩略图（720px q82）；高清图线上热链上游 jsDelivr CDN（`imageUrl` 按本地文件存在性自动优先本地无损 WebP）；要本地全量高清图用 `pnpm sync:layouts -- --with-images`

## inspora 包

- 从 inspora.design 增量同步的灵感库：`inspora.db`（SQLite，`node:sqlite` 读写）+ `apps/web/public/inspora/`（海报/缩略图/头像本地化），两者都是生成物但随仓库提交；大图与视频不入库，查询 API 按本地文件存在性自动回退热链原站（media.inspora.design）
- 列表 API `/api/posts` 被 Vercel checkpoint 拦截，sync 脚本必须用 Playwright 在页面上下文里 fetch；详情无 API，从 `/posts/<slug>` HTML 的 RSC payload 提取（脚本头部注释有完整说明）
- 增量逻辑：feed 遇到已入库 id 即停；`enriched_at IS NULL` 才补详情；媒体按文件存在性跳过——可随时中断重跑
- 查询一律用 `src/index.ts` 的 API（`listPosts`、`getPostBySlug`、`listCategories`、`upstreamUrl`…），不在 app 里读 DB、不拼路径
- 详情面向访客，只展示作品、作者、分类、实际说明和「查看原作」出处链接；不展示原始 JSON、同步信息、文件大小/分辨率、内部标签或空信息占位。原始数据只在包内保留（2026-09-07 用户明确）。
- 产品对外的名字是「灵感集」，路由 `/products/muse`；**访客可见处（文案、链接、metadata）一律不得出现来源站点名**，事实性描述只留在本文件与包/脚本注释里
- 灵感列表为稳定 CSS grid，视频默认动态预览、单链接进详情、滚动自动追加，不设预览开关；详情标题/作者/出处在媒体前，实际说明在媒体后。视频默认静音循环并保留原生控制，离屏暂停；仅视频按剩余视口适配，不缩小图片阅读。

## 当前用户故事约束（2026-09-08）

- 当前首页沿用 Lifeline 参考的稀疏单色横向作品时间轴，覆盖上述地铁、LED 历史描述；不添加重复状态图例、轴标签或品牌副标题，只有横向溢出时才显示翻页按钮。
- 两个列表即时检索；详情相邻导航沿进入时的筛选结果，返回保留筛选和位置。分类用中文呈现，数量集中在结果区。
- 灵感预览默认动态播放，滚动自动追加；不显示预览开关、手动加载按钮、JSON 或同步信息。详情保留作品、作者、说明、分类和原作入口，图片可直接点击放大。
