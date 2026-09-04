# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- 站长本人：个人设计产品集的拥有者与主要使用者，日常把设计参考、灵感整理成可回溯的集合。
- 来访的设计师同行：来浏览、检索排版参考与设计灵感，关注内容质量与出处可信度。

## Product Purpose

个人产品集门户（Personal Design）：把自己做/整理的设计工具与参考内容组织成一组可浏览的「产品」，首页是一条按上线日期生长的横向 lifeline 时间轴，每个产品是一个时间节点，右侧永远留有「下一个」的位置。成功 = 内容可被快速浏览、检索、放大查看，且每条内容都能回溯到完整原始信息。

## Positioning

数据完全自有：所有内容（图鉴、灵感帖、图片、视频）都同步并本地化存储（SQLite + 本地媒体文件），站点不依赖任何第三方 CDN 或原站在线状态；每条灵感可查看完整的原始数据与作者出处。这是隔壁「随手收藏夹」类产品无法照抄的机制。

## Operating Context

pnpm monorepo（apps/web 唯一站点 + packages/* 内容数据包），Next.js 16 App Router + Tailwind v4，portless 本地开发（https://personal-design.localhost）。内容通过各包的 sync 脚本增量同步。

## Capabilities and Constraints

- 首页/产品浏览的核心交互是横向 lifeline 时间轴（滚动驱动 rail、hover 预览、灯箱、撕角），**用户明确确认保留这一交互方式**。
- 零动画库依赖，手写 rAF；中文界面为主。
- 灵感库每条内容含作者信息、原始出处（多为 X 原帖）与同步的原始 JSON，「查看原信息」是产品核心承诺。
- 用户确认：访客可见处不得出现数据来源站点的引用说明，产品改用自有命名；技术内部（包名、同步脚本）可保留事实性描述。

## Brand Commitments

- 整体视觉方向：**地铁导视系统**（用户确认）——站点是一张正在延伸的线路图，产品是车站、时间是线路，内容（图与视频）是绝对主角。
- 首页 lifeline 时间轴交互保留（用户确认）。

## Evidence on Hand

- layout-compositions 包：350 张排版构图图鉴（8 分类 33 主题），本地 WebP。
- inspora 包（拟改名「灵感集」）：151 条设计灵感，图片/视频/头像全部本地化于 apps/web/public/。
- 无 testimonials、客户、商业数据；不得虚构。

## Product Principles

1. 内容是主角，界面退让。
2. 数据自有自托管，出处可查。
3. 交互少而精：一个签名交互（lifeline 时间轴）做透，不堆砌动效。
4. 排印即界面：用字体、网格、留白建立秩序，而非装饰性组件。
