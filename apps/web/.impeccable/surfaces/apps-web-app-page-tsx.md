---
version: 1
slug: "apps-web-app-page-tsx"
primary_target: "apps/web/app/page.tsx"
related_targets: ["apps/web/app/products/muse/page.tsx","apps/web/app/products/layout-compositions/page.tsx"]
---

# Surface Brief: 全站（首页 lifeline + 产品列表/详情）

- Scope: apps/web 全部路由（首页 /、/products/muse、/products/layout-compositions 及详情页）
- Mode: Experience（作品/内容是主角，界面退让）
- Audience: 站长本人 + 来访设计师同行；job = 快速浏览、检索、放大查看设计参考与灵感，每条内容可回溯出处
- Constraints: lifeline 横向时间轴交互保留（用户确认）；明暗双主题保留（html[data-theme]）；内容永远主角；禁止模板/AI 味；动效不过度；访客可见处不得出现来源站点名

## Direction contract

THESIS: 站点是一张正在延伸的地铁线路图——产品是车站，时间是线路；拒绝 masonry 画廊与极简编辑 hairline 两个品类默认。
OWN-WORLD: 导视系统语言：纸白底（深底 = 夜行灯箱站牌）+ 墨黑站牌字 + 每个产品一条功能线路色；粗线路带（非 hairline）、空心圆环站节点、45° 站名标注；展示字 Barlow Condensed（导视 grotesque，webfont），中文系统字兜底，mono 只载站号/日期/计数；直角，唯站环用正圆。
STORY: 访客第一眼读到「一条在生长的产品线」，进站浏览；图版内容永远主角，每条内容可回溯原始出处。
FIRST VIEWPORT: 顶部站牌刊头（线路色带 + 大字「产品集」+ mono 站数），主体横贯线路图：彩色已通车段 + 灰色虚线规划段，圆环站点沿线排开、45° 站名，列车式进度点标示当前位置。
FORM: 地铁导视系统（grounded 候选第 1 位，IMPECCABLE'S PICK，用户选定），seed c7659076。风险：线路图即时间轴是该品类最熟悉的隐喻，靠执行保真度取胜。
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
