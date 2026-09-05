---
name: Personal Design 产品集
description: OpenDesign 中性视觉语言下的设计参考门户，首页选产品、静态检索、直接阅读与内容溯源
colors:
  workspace: "#ffffff"
  paper: "#ffffff"
  plate: "#fafafa"
  body: "#494949"
  ink: "#202020"
  ink-soft: "#5c5c5c"
  ink-faint: "#5c5c5c"
  hairline: "#ededed"
  hairline-strong: "#dbdbdb"
  subtle: "#ededed"
  border-hover: "#bdbdbd"
  control-border: "#848484"
  accent: "#353535"
  dark-workspace: "#202020"
  dark-paper: "#202020"
  dark-plate: "#353535"
  dark-body: "#ededed"
  dark-ink: "#fafafa"
  dark-ink-soft: "#bdbdbd"
  dark-ink-faint: "#bdbdbd"
  dark-hairline: "#494949"
  dark-hairline-strong: "#5c5c5c"
  dark-subtle: "#494949"
  dark-border-hover: "#848484"
  dark-control-border: "#848484"
  dark-accent: "#ededed"
typography:
  display:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1.35
  headline:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.35
  body: "#494949"
  ink: "#202020"
  ink-soft: "#5c5c5c"
  ink-faint: "#5c5c5c"
  hairline: "#ededed"
  hairline-strong: "#dbdbdb"
  subtle: "#ededed"
  border-hover: "#bdbdbd"
  control-border: "#848484"
  accent: "#353535"
  dark-workspace: "#202020"
  dark-paper: "#202020"
  dark-plate: "#353535"
  dark-body: "#ededed"
  dark-ink: "#fafafa"
  dark-ink-soft: "#bdbdbd"
  dark-ink-faint: "#bdbdbd"
  dark-hairline: "#494949"
  dark-hairline-strong: "#5c5c5c"
  dark-subtle: "#494949"
  dark-border-hover: "#848484"
  dark-control-border: "#848484"
  dark-accent: "#ededed"
typography:
  display:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1.35
  headline:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.35
  detail:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: "2px"
  control: "4px"
  media: "8px"
  card: "12px"
  panel: "16px"
  pill: "999px"
  circle: "50%"
spacing:
  page-x: "48px"
  page-x-compact: "24px"
  page-x-mobile: "20px"
components:
  button-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    rounded: "{rounded.control}"
  button-subtle:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.body}"
    rounded: "{rounded.control}"
  gallery-card:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.media}"
---

# Design System: Personal Design 产品集

## Overview

**Creative North Star: "随手可查的设计参考（Design Within Reach）"**

本站采用 OpenDesign 的中性色、Albert Sans、清晰中文排印与克制控件；真实媒体承担主要视觉内容。源快照见 [OpenDesign 规范](docs/design/open-design/README.md)，采用与适配见 [rules.md](docs/design/open-design/rules.md)。本文记录 V2 当前实现，不把历史布局当作产品约束，也不把源码对齐等同于用户认可。

首页本身承担产品菜单。访客从两个真实内容入口选择产品，在稳定网格中检索，直接进入详情阅读媒体和原始信息，再返回浏览现场。全站仅保留轻量品牌/首页链接与主题开关，不设置侧栏或顶部产品菜单。

**Key Characteristics:**
- 白色页面与浅灰媒体衬底，深色使用同一组语义角色。
- 首页两个产品入口；内页以返回列表、相邻内容和首页链接提供上下文导航。
- 静态内容网格、单一详情去向、标题优先的自然阅读顺序。
- 边框留给控件和分组边界，媒体之外减少包框；组件样式归相邻 CSS Module。

## Colors

界面采用中性层次，媒体自身的颜色成为视觉重心。前置 `dark-*` 记录运行时主题覆盖；组件始终引用同名 CSS 语义变量。

### Primary

- **普通强调（accent）**：主按钮的中性悬停表面。
- 产品身份用名称与实际媒体表达。CSS 中仍保留 `line-muse` / `line-layouts` 明暗变量及产品注册字段，但 V2 页面未使用，不属于当前可见识别系统，也不要求新产品增加装饰线路色。

### Neutral

- **工作区 / 普通底（workspace / paper）**：页面、普通按钮与信息背景。
- **次级表面（plate）**：媒体衬底、失败占位与原始数据区。
- **正文 / 强文字（body / ink）**：正文与标题分工；ink 同时承担主按钮和选中下划线。
- **辅助文字（ink-soft / ink-faint）**：说明与元数据；当前同值是小字可读性适配。
- **软边界 / 普通边界（hairline / hairline-strong）**：资料区分隔和筛选组边界。
- **状态表面 / 悬停边界（subtle / border-hover）**：共享按钮的交互反馈。
- **输入边界（control-border）**：搜索框与原生主题选择框的可辨识边界。

**The Semantic Theme Rule.** 新表面使用成套语义主题；详情灯箱保持恒定暗房与亮色焦点环。

## Typography

**Display Font / Body Font:** 本地 Albert Sans 可变字体（100–900），中文回退 PingFang SC / Microsoft YaHei；字体及 OFL 位于 `apps/web/public/fonts/`。
**Label/Mono Font:** 系统等宽栈，用于编号与原始 JSON 等数据；一般计数可使用 tabular-nums，不要求所有元数据都等宽。

### Hierarchy

- **Display:** 首页主标题，手机 34px；首页产品名 26px/500，简短用途 16px。
- **Headline:** 列表标题，手机 28px；说明 15px，手机 14px。
- **Detail:** 详情标题，窄屏 26px；资料分组标题 20px，相关内容标题可为 24px。
- **Body:** 正文 14px/1.75，长段控制为约 65–68ch；标题下辅助信息通常 13/14px。
- **Label:** 编号与原始数据主要 12px；分类计数为 11px 的辅助数字，不作为可交互文字或正文尺度模板。

**The Chinese Typesetting Rule.** 中文标题字距为 0、行高 1.35，正文行高 1.75；用空间和层级组织内容，不用负字距压缩中文。

## Layout

外壳仅提供自然文档流页头：最大宽度 1440px，桌面最小高度 88px、内边距 20px 48px；1100px 以下横向 24px；639px 以下最小高度 72px、内边距 12px 20px。页头仅品牌/首页链接和主题开关。高度变量相应扣除 88/72px，它不是所有页面固定全高的要求。

首页最大宽度 1280px，两个产品媒体入口桌面并排、640px 以下纵排，页面到产品入口结束，不追加关于或来源许可说明。内容入口预览比例为 16:10；媒体、产品名、用途与“开始浏览”在同一个链接内。

列表最大宽度 1440px，标题、分类与检索、结果计数和网格顺序清晰。灵感网格为桌面 4 列、1199px 以下 3 列、759px 以下 2 列、359px 以下 1 列；媒体统一 4:3、object-contain，静态海报预览视频。布局网格为 5 / 4 / 2 列（断点 1199 / 759px），图鉴保持 3:4。分类横向可滚动，检索工具窄屏重排。

详情按返回/相邻内容、标题/作者/分类、媒体、说明与出处的自然顺序排列。灵感详情最大宽度 1200px；资料区位于媒体下方，桌面两列、759px 以下一列。布局详情大图最大宽度 720px（较窄桌面 640px），保持可读大图；相关内容在下方。没有固定媒体空井或全高资料侧栏。

## Elevation & Depth

页面通过留白、排印和少量分隔建立层级，媒体使用浅灰衬底与裁切。普通内容没有装饰投影或毛玻璃；详情灯箱使用高不透明暗色遮罩，保持媒体与控制的对比。

**The Open Reading Surface Rule.** 标题、说明和出处直接落在阅读平面，边界用于分组与操作，不把每段资料套进独立面板。

## Shapes

共享普通/图标按钮、搜索框、原生选择框采用 4px；主按钮同样采用 4px。列表及详情媒体主要为 8px；首页预览为 12px；头像保留圆形。16px 面板 token 仍在基础表中，但 V2 不以大面板包裹页面或资料区。

Tailwind xs/sm/md/lg/xl/2xl 的兼容映射为 2/4/8/8/12/16px。组件优先引用语义 radius，避免因别名相同误用上游不同档位。

## Components

### Buttons

共享 `Button` / `buttonClassName` 提供 default、primary、ghost、subtle 与 icon，保留原生 button/link 语义。普通与图标按钮统一最小 44px，14px/500、8px 图标间距、8px 16px 内边距。搜索组内提交按钮采用 34px 紧凑高度，外层输入框仍为 44px。

颜色和边界反馈 150ms，按下位移 100ms、translateY(1px)；主按钮悬停转 accent。禁用态无位移且有语义；焦点默认 2px、offset 3px，局部按空间增加或内收 offset。reduced-motion 移除空间反馈。

### Categories / Filters

分类复用共享 Button，44px 高、4px 圆角，选中项为 ink 底色与 paper 文字；横向单行溢出可滚动，`aria-pressed` 表达选中。

灵感集提供分类与关键词；布局参考提供分类、主题原生 select 和关键词。结果区说明命中与筛选状态，清除操作可恢复完整列表。主题必须属于当前分类，无效参数通过既有 URL 规则归一。

### Content Links

列表每张内容卡片是一个原生详情链接；媒体、标题与作者共同构成入口，不在卡内再嵌套重复链接。悬停标题下划线，键盘焦点有完整外框。列表不打开灯箱、不自动播放视频、不自动滚动，也不因滚到末尾被动追加。

灵感集明确点击“加载更多灵感”追加下一批；返回详情前的筛选、已加载数量和位置由列表恢复机制保留。布局参考静态呈现所有符合筛选的 catalog 条目，包括缺图条目；缺图用名称与说明表达，不伪造媒体。

### Inputs / Fields

搜索与主题选择框共用 field.module.css 的边界、焦点与交互状态。搜索采用 4px 圆角、control-border 边界、14px 字体与明确标签；占位文字 ink-soft、opacity 1。灵感搜索框最小高度 44px，布局搜索组有显式搜索按钮，主题使用原生 select。焦点始终可见，不以悬停替代。

### Header / Context Navigation

页头只含品牌/返回首页链接与主题控制；首页即产品菜单。内页提供返回列表和上一件/下一件，边界处给出禁用或首尾提示。跳至内容链接在聚焦时显示。不在页头、侧栏或详情中恢复全站产品菜单。

### Media Reading

灵感详情先展示标题、作者与分类，再显示媒体。图片按实际比例、object-contain，默认高度上限约 70dvh（手机 65dvh），保留大图阅读；多媒体可横向 snap 并有页数和直接切换操作。

仅视频使用剩余视口测量：按媒体文档位置、视口高度及工具条高度计算可用高度（最小 240px），为原生播放控制与媒体工具条留空间；普通滚动不改变视频尺寸。长标题、矮屏或恢复提示仍允许自然页面滚动，不把“控件同屏”变成任意视口下强制缩小图片的规则。

详情图片提供放大与原图入口；视频保留原生控制，由用户主动播放。加载与失败在媒体位置给出反馈，失败可重试或使用可用原文件操作。布局缺图详情保持真实名称、主题与返回路径。

### Detail Lightbox / Motion

灯箱只作为详情内的放大工具：触发媒体 FLIP 进入 200ms、退出 140ms，采用 `cubic-bezier(0.23, 1, 0.32, 1)`，保留焦点回归与退出控制。通用快速状态 150ms、基础 200ms；首页入口箭头采用进入/退出 200/140ms，reduced-motion 去除位移。首页布局预览以三张图鉴展开构图，灵感预览用三张真实作品横向切换；进入视野时播放一次，离开视野暂停，悬停与键盘聚焦提供预览反馈。reduced-motion 下保留静态构图。

## Do's and Don'ts

### Do:

- **Do** 让首页承担产品选择，内页只提供上下文返回和阅读操作。
- **Do** 用稳定网格、真实媒体与一个详情链接建立可预期的浏览流程。
- **Do** 让详情标题在媒体之前、说明与原始信息在媒体之后自然展开。
- **Do** 保留主题、可见焦点、原生视频控制、明确追加与返回现场。
- **Do** 沿用源 tokens、中文排印、共享按钮和局部 CSS 归属。

### Don't:

- **Don't** 恢复全站菜单、固定侧栏、强制时间轴或自动移动内容墙。
- **Don't** 将列表点击改为灯箱中转、列表自动播放或被动无限追加。
- **Don't** 用固定全高媒体井、窄资料侧栏或层层面板挤压阅读。
- **Don't** 因兼容 tokens 仍存在而恢复产品装饰线路色。
- **Don't** 删除缺图条目、出处、原始 JSON 。首页不添加关于或许可说明，也不另建说明文档。

用户最新约束：首页只保留“产品集”标题、真实产品入口和一句用途；不添加宣传段落、重复统计或与操作无关的说明。
