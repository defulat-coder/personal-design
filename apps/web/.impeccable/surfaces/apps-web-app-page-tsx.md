---
version: 1
slug: "apps-web-app-page-tsx"
primary_target: "apps/web/app/page.tsx"
related_targets: ["apps/web/app/products/muse/page.tsx","apps/web/app/products/layout-compositions/page.tsx"]
---

# Surface Brief: V2 全站产品入口与内容浏览

Scope: 首页、两个产品列表与全部详情、媒体、404及状态。
Mode: 首页 Operate（选择产品）；列表 Experience/Operate（发现与检索）；详情 Read/Experience（查看与追溯）。
Audience: 站长及设计师同行；快速找到设计参考，理解内容并回溯出处。
Constraints: 首页为唯一产品菜单；不设置全站导航菜单。保留真实内容、出处/JSON、署名、双主题、零动画库、可访问性。用户2026-09-05授权替换全部旧UI/UX。

## Direction contract

THESIS: 从首页选择工具，在稳定的内容平面里找到、观看和追溯设计；每一步去向明确。
OWN-WORLD: OpenDesign原始中性色、Albert Sans、中文零字距、控件状态与CSS归属；大面积留给真实媒体，少量分隔组织信息，避免面板套面板。
STORY: 首页两个产品直接入口 → 分类/搜索的静态内容网格 → 统一直达详情 → 查看媒体与原信息 → 返回保留浏览现场。
FIRST VIEWPORT: 轻量品牌与主题开关，不放菜单；首页标题下两个产品用途及真实媒体同时可见。列表标题、检索、首批内容连续组织；详情标题在媒体前，不挤在窄侧栏。手机按同一阅读顺序自然重排。
FORM: 用户指定OpenDesign的设计语言和首页即菜单的UX；code-led。seed 958cc9c7仅为历史记录，随机分配不覆盖用户指定。签名体验为“不中断的浏览”：原生直接链接、稳定列表和上下文返回，动效只辅助状态变化。契约 docs/design/redesign-v2/contract.md。
FINISH: 独立视觉与UX复核、实际完整流程及源码/文档一致后交付；不得沿用旧ship。全目标 docs/goals/ui-ux-redesign-v2.md。

## Implementation status

V2 页面与交互已实现，当前文档已按最终源码同步；整体完成状态、独立评审和本轮验证由 `docs/design/redesign-v2/` 台账维护，旧报告不作为本轮证明。

- 轻量页头实际为桌面最小 88px / 手机 72px，仅品牌/首页链接及主题开关。首页两个单链接产品入口；不追加关于与许可说明。
- 灵感集静态网格 4/3/2/1 列，统一 4:3 媒体框；视频只展示海报；分类/搜索、明确加载更多、详情返回现场。
- 布局参考静态 5/4/2 列网格；当前 catalog 350 条（含 8 条上游缺图）均可按分类/主题/关键词检索和进入详情，数量依查询 API 更新。
- 详情标题在媒体之前，说明与出处/原始 JSON 自然展开在其后；布局图鉴保持大尺寸阅读，关联内容在下方。
- 视频详情测量剩余视口，预留原生控制与工具条；只对视频限制高度，图片按内容比例保持阅读尺度。灯箱仅从详情放大触发。
- 源 tokens、中文排印、共享按钮、双主题与局部 CSS 归属保留；旧时间轴、侧栏、自动墙、列表灯箱不再是当前体验。

用户最新简化要求：首页不展示关于、许可说明、宣传段落或重复统计。只保留产品集标题、产品入口及一句简短用途；也不另建说明文档。
