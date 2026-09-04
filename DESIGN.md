---
name: Personal Design 产品集
description: 地铁导视系统——站点是一张正在延伸的线路图，产品是车站，时间是线路
colors:
  paper: "#ffffff / #0d1015 (dark)"
  plate: "#f3f4f2 / #161b23 (dark)"
  ink: "#11151b / #edf1f6 (dark)"
  ink-soft: "#566070 / #97a2b1 (dark)"
  ink-faint: "#66707e / #7d8794 (dark)"
  hairline: "#e4e7ea / #242b36 (dark)"
  hairline-strong: "#c8ced6 / #39424f (dark)"
  line-muse: "#d23c2e / #e86050 (dark)"
  line-layouts: "#1a6fb4 / #55a0e0 (dark)"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', 'SF Pro Display', -apple-system, system-ui, 'PingFang SC', sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1
  headline:
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', 'SF Pro Display', -apple-system, system-ui, 'PingFang SC', sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.05
  title:
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', 'SF Pro Display', -apple-system, system-ui, 'PingFang SC', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.02em"
  body:
    fontFamily: "'SF Pro Text', 'SF Pro Display', -apple-system, system-ui, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "11.5px"
    fontWeight: 400
rounded:
  none: "0"
  station: "9999px"
  avatar: "9999px"
  theme-toggle: "9999px"
spacing:
  page-x: "24px"
  page-x-sm: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.plate}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink} @ 85%"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  line-badge:
    backgroundColor: "{colors.line-muse}"
    textColor: "#ffffff / {colors.paper} (dark)"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "1px 6px"
  tab:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.none}"
    padding: "6px 6px"
  tab-active:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 6px"
  plate-card:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px"
  station-ring:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.station}"
    size: "15px"
---

# Design System: Personal Design 产品集

## Overview

**Creative North Star: "地铁导视系统（Transit Wayfinding）"**

站点是一张正在延伸的地铁线路图：产品是车站，时间是线路，内容永远主角。语言取自真实导视系统——纸白站牌底、墨黑站牌字、3px 粗线路带、空心圆环站节点、45° 斜排站名标注、每个产品一条功能线路色。深色套是「夜行灯箱站牌」：同一套 token 换值，不新增角色。密度服务于进站浏览：图版媒体占满画面，界面退成一行行 mono 小字与一条横贯的线路。

**Key Characteristics:**
- 纸白底 + 信号黑站牌字，3px 粗线路带承担主干结构；明暗双套 token（`html[data-theme='dark']`，深色 = 夜行灯箱）
- 每个产品一条功能线路色（灵感集朱红、布局参考蓝），只活在编号牌/站环 hover/3px 色带/active 指示条；干线本身用墨
- 直角全站，正圆只给站环、列车点、主题切换钮、作者头像
- 展示字 Barlow Condensed（导视 grotesque，next/font 仅 latin 字重 500/600/700，CJK 落系统栈）；mono 只载数据
- 签名交互是横向 lifeline 线路图：站环 + 45° 站名 + 列车进度点（手写 rAF，零动画库）

## Colors

纸、墨、两级 hairline 构成中性骨架；两条线路色是全站仅有的彩色，且都是功能色。全部颜色是语义 token，明暗两套同义互换——深色只改值，不改角色。

### Primary
- **灵感集线 朱红（line-muse）**（#d23c2e / 深 #e86050）：灵感集产品的线路色——M·01 编号牌底、灵感集刊头与详情信息牌的 3px 色带、图版拼幅 active tab 指示条、主按钮内的线路小色块。
- **布局参考线 蓝（line-layouts）**（#1a6fb4 / 深 #55a0e0）：布局参考产品的线路色，用法同上（L·01 编号牌、灵感墙刊头色带、双向行车卡片的 focus 环）。

### Neutral
- **站牌纸（paper）**（#ffffff / 深 #0d1015）：页面 ground，所有表面的底；站环的纸色心。
- **图版底（plate）**（#f3f4f2 / 深 #161b23）：图版、信息牌、浮层的衬底，与 paper 半度之差。
- **信号黑（ink）**（#11151b / 深 #edf1f6）：正文、标题、已通车干线、active 态、主按钮底。
- **软墨（ink-soft）**（#566070 / 深 #97a2b1）：摘要、次级文字、非 active 控件。
- **淡墨（ink-faint）**（#66707e / 深 #7d8794）：mono 数据、占位、方向标、套准十字。
- **细线（hairline）**（#e4e7ea / 深 #242b36）：卡片框、分隔线、chips 描边。
- **粗线（hairline-strong）**（#c8ced6 / 深 #39424f）：规划段虚线、灵感墙卡片框、缺失媒体占位。

### 例外表面
灯箱是恒定暗房，不随主题翻转：遮罩 `#0d1015`/70 + 毛玻璃、内部控件白/10→白/20，色值取暗色 palette 原值字面量而非 token——暗房属于产品内容，不属于皮肤。

### Named Rules
**The Functional Line-Color Rule（线路色是功能色规则）.** 线路色只出现在五处：编号牌底色、站环 hover 染色、刊头/信息牌底缘的 3px 色带、active tab 指示条、主按钮内的线路小色块。它永远标识「这条内容属于哪条线」，绝不作大面积铺底或装饰。新增产品 = 新增一条 `--color-line-*`，不在现有色之外发明彩色。
**The Ink Trunk Rule（干线用墨规则）.** lifeline 干线永远是 3px ink 实线（已通车段）+ hairline-strong 虚线（规划段）；线路色不上干线。列车点也是 ink 身 + paper 边的站环造型。

## Typography

**Display Font:** Barlow Condensed（next/font/google，weight 500/600/700，subsets latin，`display: swap`）——刊头大字、站名、详情 h1；CJK 无字重，落系统栈兜底。
**Body Font:** 系统栈（`'SF Pro Text','SF Pro Display',-apple-system,system-ui,'Helvetica Neue','PingFang SC','Microsoft YaHei',Arial`）。
**Label/Mono Font:** 系统等宽栈（`ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas`）。

body 基准 12.5px / 1.5，`text-rendering: geometricPrecision`，`min-width: 20rem`；页面滚动条 overlay 化（节点列等局部滚动条有显式覆写）。`--font-display` 直接命名字体而不引用 next/font 的 CSS 变量（`:root` 求值时变量未定义会静默落回 sans）。

**Character:** Barlow Condensed 的窄身 grotesque 是站牌的声音；系统栈承担一切叙述；mono 是图上的「手写标注」，只写数据。

### Hierarchy（根 16px）
- **Display**（600, 30px, leading-none）：站牌式刊头大字（「产品集」「灵感集」「布局参考」）；404 用 42/56px。
- **Headline**（600, 26px, 1.05, text-balance）：详情页 h1。
- **Title**（600, 15px, tracking 0.02em）：45° 站名标注、产品名。
- **Body**（400, 12.5px, 1.5, ink / ink-soft）：正文与摘要。
- **Tab/Nav**（400→600, 12px）：active 转 semibold + 2px 线路色指示条。
- **Label**（mono, 400, 11.5px, ink-faint / ink-soft）：站号（M·01）、日期、尺寸、计数、方向标（上行 UP / 下行 DOWN）、404 坐标。

### Named Rules
**The Mono Carries Data Rule（Mono 只载数据规则）.** 等宽字体只写编号、日期、尺寸、计数、方向标等可度量信息；一段叙述文字设成 mono 即违规。
**The Display Never Narrates Rule（展示字不叙述规则）.** Barlow Condensed 只写刊头、站名、标题等「挂牌文字」；正文与摘要永远走系统栈。

## Layout

页面横向 padding 24px（sm 40px）。所有刊头是同一「站牌式」：左 = 返回链接 + 线路编号牌 + Display 大字站名，右 = mono 数据行（在营数/收录数/最近日期），底缘一条 3px 色带（首页用 ink 干线色，产品页用线路色）。**首页**是横向线路图：3px ink 干线横贯（右端接规划段虚线），站环骑线、45° 站名、内容列垂直滚动，列车进度点随滚动沿线移动。**产品列表页**：灵感集用图版拼幅（分类 tab + CSS columns 大图，2/3/4 列随断点，滚动按批追加）；布局参考用灵感墙（两行反向慢速 marquee「双向行车」，行首 mono 方向标，悬停暂停、点击灯箱，分类 tab 点击 key 重挂载重发两行）。**详情页**：左媒体 + 右信息牌侧栏（侧栏顶一条 3px 线路归属带，全页只此一条）；灵感集详情为 snap 轮播 + 固定宽侧栏（clamp 360–510px），布局参考详情为 3:2 网格 + 同主题翻页/推荐。移动端一律纵向堆叠，时间轴回退原生横滑（scroll-snap 对齐站）。页脚不放协议/署名行；法律署名收进首页「关于」站。

## Elevation & Depth

无卡片阴影。深度由 hairline 描边 + paper/plate 半度分层构成；3px 粗线路带替代细线承担主干结构（干线、刊头底缘、信息牌归属带）。仅有的阴影与毛玻璃属于灯箱暗房——它是「暗房」的本体，不是装饰性浮层。

### Named Rules
**The Flat Concourse Rule（站厅无浮层规则）.** 容器深度只能靠描边与纸色分层表达；给卡片加投影即违规（灯箱暗房机制除外）。线路带是结构（轨道/站牌底缘），不是投影。

## Shapes

直角（0 radius）贯穿全部界面元素：按钮、卡片、chips、tab、编号牌、输入框。正圆只给四处：站环（15px，2px ink 边 + paper 心，骑在干线上）、列车进度点（13px，3px paper 边 + ink 身）、明暗主题切换钮（24×24）、作者头像。规划站用虚线环 + 虚线段，与已通车站的实线环形成「未来/现在」的一对。反复出现的几何签名：图版四角的套准十字（`.plate-reg`，9px ink-faint 十字）、45° 斜排站名标注。

## Components

### Buttons
- **Shape:** 直角（0）。
- **Primary:** 墨底（ink）+ 图版底文字（plate），8–12px × 16px padding，内部可带一块 12px 线路色小方块标识归属线（「查看原始出处」「下载高清图」）。
- **Hover / Focus:** hover 降为 ink/85；active scale(0.97–0.98)；focus-visible 全站统一 2px ink 描边 + 2px offset。
- **Ghost:** hairline 描边 + 软墨文字，hover 描边转 ink（翻页箭头、关闭、次链接）。
- **Theme Toggle:** 24×24 正圆，fixed 右上（30px），日/月 SVG 用 `dark:` 变体切换（不读 state，首帧与内联初始化脚本一致），hover 底 plate。

### Tabs
- **Style:** 无框小字（ink-soft 12px），直角；计数用 mono 11.5px opacity-60。
- **State:** active = ink semibold + 底部 2px 线路色指示条（absolute），无底色反转。

### Cards / Containers（图版）
- **Corner Style:** 直角。
- **Background:** 图版底（plate）衬底 + 6px 内衬，媒体置于其上；hover 媒体 scale(1.02)。
- **Border:** 1px hairline（灵感墙卡片用 hairline-strong）。
- **Signature:** 四角套准十字（`.plate-reg`）。
- **Shadow Strategy:** 无（见 The Flat Concourse Rule）。

### Inputs / Fields
- **Style:** 直角，hairline 描边，图版底，左侧搜索图标淡墨。
- **Focus:** 描边转 ink，无发光。

### Links
- 文本链接 hover：转 ink；外链/卡片入口用 ArrowUpRight，hover 时箭头向右上挪 2px。

### Navigation
- 面包屑：淡墨 11.5px + ChevronRight 3.5px 分隔，产品层级带线路编号牌。
- 线路编号牌（LineBadge）：直角色底小方块 + mono 字（`M·01` / `L·01`），浅色下白字、深色下字翻 paper 保对比度。
- 上下件翻页：钉在信息牌底缘（站牌 footer），ghost 方钮，禁用态 hairline-strong。

### 签名组件：线路图（LifelineTimeline）
3px ink 干线横贯（入场时从左「画」出，expo-out 0.9s），右端接规划段虚线；站环骑线（hover 染线路色），45° 斜排站名 = 编号牌 + 站名 + mono 日期；列车进度点（ink 身 paper 边的正圆）随滚动沿线移动——对进度做二次 lerp（TRAIN_LERP 0.3），行驶中尾随、停车时滑入站位。滚动驱动为手写 rAF（轨道 lerp 0.12，按帧间隔归一化，120Hz 与 60Hz 手感一致），支持滚轮/触控板映射、鼠标拖拽（松手惯性）、方向键、焦点跟随；移动端回退原生横滑 + scroll-snap。节点级联入场（90ms/站）。

### 签名组件：双向行车灵感墙（LayoutWall）
两行反向慢速 marquee（75s / 95s，悬停暂停），行首挂 mono 方向标（上行 UP / 下行 DOWN）；分类 tab 点击 key 重挂载重发两行；灯箱打开时 marquee 暂停（关闭动画要飞回卡片）。矮视口（max-height 30rem）卡片收窄保两行在屏。

### 签名组件：灯箱暗房（Lightbox）
恒定暗房表面（见 Colors 例外表面）：FLIP 从触发卡片飞出/飞回，缩略图先显、高清后替，同组 crossfade 切换 + 相邻预取；reduced-motion 瞬时显隐。

## Do's and Don'ts

### Do:
- **Do** 用 mono 写一切可度量的值（站号、日期、尺寸、计数、方向标）。
- **Do** 让媒体占满图版，界面退让（细线 + 留白 + 微字号）。
- **Do** 用 3px 色带、编号牌、站环、45° 标注延展「导视」词汇到新表面；刊头一律站牌式。
- **Do** 新表面只用语义 token（paper/plate/ink/hairline/line-*），让它自动获得深色套。
- **Do** 动效走全站编排：单一 expo-out 缓动（cubic-bezier(0.22,1,0.36,1)）+ 两档时长（150/300ms），reduced-motion 全量瞬时化。
- **Do** 内容列表沿用既定呈现：灵感集 = 图版拼幅（PlateWall），布局参考 = 双向行车灵感墙（LayoutWall），不发明第三种列表样式。

### Don't:
- **Don't** 把线路色当装饰：铺大底、染干线、染普通强调文字都违规（The Functional Line-Color Rule）。
- **Don't** 引入第三种线路色之外的彩色，也不引入中性色板（neutral-* 一律禁止，灯箱暗房字面量除外）。
- **Don't** 给任何容器加圆角或卡片阴影（站环/列车点/主题钮/头像、灯箱暗房机制除外）。
- **Don't** 用 hairline 替代 3px 线路带承担主干结构；干线与刊头底缘永远是 3px。
- **Don't** 引入动画库——滚动驱动与列车惯性手写 rAF，全站动效从 --ease-out / --dur-* 出。
- **Don't** 在页脚放协议/署名行——法律署名收进首页「关于」站。
- **Don't** 在访客可见处引用数据来源站点（法律署名除外）；产品一律使用自有命名。
