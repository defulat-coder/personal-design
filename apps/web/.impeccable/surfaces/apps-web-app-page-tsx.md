---
version: 1
slug: "apps-web-app-page-tsx"
primary_target: "apps/web/app/page.tsx"
related_targets: ["apps/web/app/products/muse/page.tsx","apps/web/app/products/layout-compositions/page.tsx"]
---

# Surface Brief: V2 全站产品入口与内容浏览

Scope: 首页、两个产品列表与全部详情、媒体、404及状态。
Mode: 首页 Experience（沿时间发现作品）；列表 Experience/Operate（发现与检索）；详情 Read/Experience（查看与追溯）。
Audience: 站长及设计师同行；快速找到设计参考，理解内容并回溯出处。
Constraints: 首页为唯一产品选择入口；2026-09-07 最新用户指定 Lifeline 参考，覆盖此前地铁、LED 与时钟方向。未来产品按日期自动入列；不设置全站导航菜单或侧栏，不添加关于、许可或宣传说明。保留真实内容、原作出处、双主题及零动画库。

## Direction contract

THESIS: 稀疏单色的横向作品时间轴，以细轨道、日期、真实预览和大量留白表达个人作品的持续积累。
OWN-WORLD: 继承 OpenDesign 中性语义 tokens、Albert Sans 和中文零字距；没有彩色线路、站牌面板或 LED，媒体自身提供颜色。
STORY: 从早到晚沿横轨阅读，日期在上、产品入口在下，末端虚线通向更多作品；单一原生链接直达产品。
FIRST VIEWPORT: 适度标题与时期、留白、日期及细轨道、产品名称与真实媒体；手机保留横向轨道并露出下一列，页脚提供前后操作。
FORM: code-led Experience；用户指定 https://lifeline-evil-rabbit.vercel.app/ 为 pinned reference，覆盖随机方向种子；没有 imagegen comp。轨道分段铺开、作品裁切展开；hover/focus 与指针驱动叠纸展开，首页灵感集播放真实视频。reduced-motion 取消空间动画与自动播放。
FINISH: 独立 review/lifeline/review.md disposition 为 Ship；review 检查桌面 1440、手机 390 和用户 1280 截图。源码具备日期/list/link 语义、命名按钮、可见焦点、左右键滚动、首尾禁用、图片失败占位及 reduced-motion；本记录不宣称已完成辅助技术测试。

## Implementation status

首页已实现为单色「作品时间轴」（2026-09-07 Lifeline 方向）：日期升序、细轨道与 7px 节点、下方单一产品链接与真实媒体。列宽 380px，≥1440px 420px，≤1100px 340px，≤640px 290px；手机横向溢出，按钮及左右键按一列滚动。标题层级 28/24px，手机均 22px；未来标题 16px、用途 14/13px、日期 13px、辅助标签 12px。首页采用 650–950ms 展开入场与 450–650ms 减速反馈，支持鼠标拖动及防误点；灵感集预览使用真实视频，reduced-motion 移除空间过渡并即时滚动。其余状态如下。

- 轻量页头实际为桌面最小 88px / 手机 72px，仅品牌/首页链接及主题开关；首页不追加关于与许可说明。
- 灵感集静态网格 4/3/2/1 列，统一 4:3 媒体框；视频可视时静音循环、离屏暂停，列表默认预览，不显示播放开关；分类/搜索、滚动自动加载、详情返回现场。
- 布局参考静态 5/4/2 列网格；当前 catalog 350 条（含 8 条上游缺图）均可按分类/主题/关键词检索和进入详情，数量依查询 API 更新。
- 详情标题在媒体之前，实际说明在媒体后，原作链接并入作者栏；布局图鉴保持大尺寸阅读，关联内容在下方。
- 视频详情测量剩余视口，预留原生控制与工具条；只对视频限制高度，图片按内容比例保持阅读尺度。灯箱仅从详情放大触发。
- 源 tokens、中文排印、共享按钮、双主题与局部 CSS 归属保留；侧栏、自动墙、列表灯箱不再是当前体验；首页当前以用户最新指定的单色横向时间轴取代地铁导视。

本轮动效修订以桌面为准；review/motion/review.md 已完成桌面范围复核。列表与详情动态视频恢复，首页与列表默认预览，不显示暂停／播放开关；不添加新的详情缩略图导航，保留原有前后翻页。
