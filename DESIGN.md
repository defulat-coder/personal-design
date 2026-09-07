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
  line-muse: "#d23c2e"
  line-layouts: "#1a6fb4"
  led-screen: "#161616"
  led-text: "#fafafa"
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
  dark-line-muse: "#e86050"
  dark-line-layouts: "#55a0e0"
typography:
  display:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.35
  home-project:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.35
  home-mobile-title:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.35
  home-future:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  home-date:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 20px
  home-label:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.75
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

首页是稀疏、单色的「作品时间轴」，作为个人作品集索引：产品按注册表 `date` 从早到晚横向排列，日期位于细轨上方，产品标题、简短用途和真实媒体预览位于下方；虚线末端通向「未完待续」。大量留白与细刻度建立节奏，每件作品是单一原生链接。全站仍仅保留轻量品牌/首页链接与主题开关，不设置侧栏或顶部产品菜单。

**Key Characteristics:**
- 白色页面与浅灰媒体衬底，深色使用同一组语义角色。
- 首页为单色横向作品时间轴，按 `date` 从左到右排列并延伸至「未完待续」；内页以返回列表、相邻内容和首页链接提供上下文导航。
- 稳定内容网格、可视视频动态预览、单一详情去向、标题优先的自然阅读顺序。
- 边框留给控件和分组边界，媒体之外减少包框；组件样式归相邻 CSS Module。

## Colors

界面采用中性层次，媒体自身的颜色成为视觉重心。前置 `dark-*` 记录运行时主题覆盖；组件始终引用同名 CSS 语义变量。

### Primary

- **普通强调（accent）**：主按钮的中性悬停表面。
- **保留线路色（line-muse / line-layouts）**：基础 token 仍保留，当前首页不使用；不因 token 存在而添加装饰色。

### Neutral

- **工作区 / 普通底（workspace / paper）**：页面、普通按钮与信息背景。
- **次级表面（plate）**：媒体衬底、失败占位与原始数据区。
- **正文 / 强文字（body / ink）**：正文与标题分工；ink 同时承担主按钮和选中下划线。
- **辅助文字（ink-soft / ink-faint）**：说明与元数据；当前同值是小字可读性适配。
- **软边界 / 普通边界（hairline / hairline-strong）**：资料区分隔和筛选组边界。
- **状态表面 / 悬停边界（subtle / border-hover）**：共享按钮的交互反馈。
- **输入边界（control-border）**：搜索框与原生主题选择框的可辨识边界。
- **保留 LED 色（led-screen / led-text）**：历史 token；当前首页不再渲染 LED 播报带。

**The Semantic Theme Rule.** 新表面使用成套语义主题；详情灯箱保持恒定暗房与亮色焦点环。

**The Neutral Timeline Rule.** 首页轨道、日期、标题和操作沿用中性语义 token；真实媒体提供内容颜色。

## Typography

**Display Font / Body Font:** 本地 Albert Sans 可变字体（100–900），中文回退 PingFang SC / Microsoft YaHei；字体及 OFL 位于 `apps/web/public/fonts/`。
**Label/Mono Font:** 系统等宽栈，用于图鉴编号等数据；一般计数可使用 tabular-nums，不要求所有元数据都等宽。

### Hierarchy

- **Display / 首页层级:** 页面标题 28px/500/1.35，产品标题 24px/500/1.35；≤640px 两者均为 22px。未来作品标题 16px；用途说明 14px/1.75（手机 13px）；日期 13px/20px、tabular-nums；时期、轴标签、入口与图例 12px。首页实际字号为 28/24/22/16/14/13/12px。
- **Headline:** 列表标题，手机 28px；说明 15px，手机 14px。
- **Detail:** 详情标题，窄屏 26px；资料分组标题 20px，相关内容标题可为 24px。
- **Body:** 正文 14px/1.75，长段控制为约 65–68ch；标题下辅助信息通常 13/14px。
- **Label:** 编号与原始数据主要 12px；分类不重复显示数量，结果区统一呈现命中数。首页日期与时期使用 Albert Sans 及 tabular-nums，不使用等宽大写导视标签。

**The Chinese Typesetting Rule.** 中文标题字距为 0、行高 1.35，正文行高 1.75；用空间和层级组织内容，不用负字距压缩中文。


## Layout

外壳仅提供自然文档流页头：最大宽度 1440px，桌面最小高度 88px、内边距 20px 48px；1100px 以下横向 24px；639px 以下最小高度 72px、内边距 12px 20px。页头仅品牌/首页链接和主题开关。高度变量相应扣除 88/72px，它不是所有页面固定全高的要求。

首页以大量留白围绕单色横向时间轴，最小高度为 `100dvh - 88px`（≤640px 扣除 72px）。顶部内边距 56px，标题与时间轴相距 94px；手机为 34px 与 68px。左右边距 48px，≤1100px 为 24px，≤640px 为 20px。时间轴不再添加重复的轴标签。

时间轴用 `ol` 的横向 flex 列表，产品列宽默认 380px，≥1440px 为 420px，≤1100px 为 340px，≤640px 为 290px；未来列 190px（手机 170px）。滚动容器左侧留 152px（宽屏按居中空间扩大），≤1100px 为 120px，手机为 20px。日期下方 27px 接 1px 轨道，7px 实心节点与中间细刻度标出节奏；轨道下方 29px 接产品。每列产品右边距 60px，≤1100px 为 40px，手机为 36px。媒体高度 196px，≥1440px 为 220px，手机为 174px。保持横向溢出浏览，手机露出下一列；仅横向内容溢出时提供前后按钮，边界按钮禁用；不显示状态图例。页面不追加关于或来源许可说明。

列表最大宽度 1440px；标题与搜索同行，下方一行分类。移除说明段落，默认不单独显示计数；筛选后显示命中数与清除入口。卡片去掉重复分类／主题和布局编号，保留名称与灵感作者。灵感网格为桌面 4 列、1199px 以下 3 列、759px 以下 2 列、359px 以下 1 列；媒体统一 4:3、object-contain，可视视频静音循环预览，离屏暂停。布局网格为 5 / 4 / 2 列（断点 1199 / 759px），图鉴保持 3:4。分类横向可滚动，检索工具窄屏重排。

详情按返回/相邻内容、标题/作者/分类/原作链接、媒体、实际说明的自然顺序排列。灵感详情最大宽度 1200px；实际说明位于媒体下方，不设技术信息面板。布局详情恢复宽屏阅读布局：最大页面宽度 1440px、标题区 960px、大图 720px；主题信息、原图入口与相关内容保留。没有固定媒体空井或全高资料侧栏。

## Elevation & Depth

页面通过留白、排印和少量分隔建立层级，媒体使用浅灰衬底与裁切。普通内容与首页媒体没有装饰投影或毛玻璃；详情灯箱使用高不透明暗色遮罩，保持媒体与控制的对比。

**The Open Reading Surface Rule.** 标题、说明和出处直接落在阅读平面，边界用于分组与操作，不把每段资料套进独立面板。

## Shapes

共享普通/图标按钮、搜索框、原生选择框采用 4px；主按钮采用胶囊圆角。列表及详情媒体与首页预览主要为 8px；首页作品入口本身无面板边框，焦点轮廓沿 4px 圆角显示；时间轴节点为圆形。16px 面板 token 仍在基础表中，但 V2 不以大面板包裹页面或资料区。

Tailwind xs/sm/md/lg/xl/2xl 的兼容映射为 2/4/8/8/12/16px。组件优先引用语义 radius，避免因别名相同误用上游不同档位。

## Components

### Buttons

共享 `Button` / `buttonClassName` 提供 default、primary、ghost、subtle 与 icon，保留原生 button/link 语义。普通与图标按钮统一最小 44px，14px/500、8px 图标间距、8px 16px 内边距。搜索组内提交按钮采用 34px 紧凑高度，外层输入框仍为 44px。

颜色和边界反馈 150ms，按下位移 100ms、translateY(1px)；主按钮悬停转 accent。禁用态无位移且有语义；焦点默认 2px、offset 3px，局部按空间增加或内收 offset。reduced-motion 移除空间反馈。

### Categories / Filters

分类使用 44px 高原生文字按钮，选中用中性下划线、`aria-pressed` 表达；桌面优先完整呈现，空间不足自然换行，避免水平隐藏分类。

灵感集提供分类与关键词；布局参考提供分类和关键词，移除主题下拉；已有主题链接仍按主题过滤并在结果行显示主题名。结果区说明命中与筛选状态，清除操作可恢复完整列表。主题必须属于当前分类，无效参数通过既有 URL 规则归一。

### Content Links

列表每张内容卡片是一个原生详情链接；媒体、标题与作者共同构成入口，不在卡内再嵌套重复链接。悬停标题下划线，键盘焦点有完整外框。列表不打开灯箱、不自动滚动，接近列表底部时自动追加内容；视频在视口内静音循环，默认预览，不显示播放开关。

灵感集在滚动接近底部600px时自动追加下一批，不显示手动加载按钮；返回详情前的筛选、已加载数量和位置由列表恢复机制保留。布局参考静态呈现所有符合筛选的 catalog 条目，包括缺图条目；缺图用名称与说明表达，不伪造媒体。

### Inputs / Fields

搜索与主题选择框共用 field.module.css 的边界、焦点与交互状态。搜索采用 4px 圆角、control-border 边界、14px 字体与明确标签；占位文字 ink-soft、opacity 1。灵感搜索框最小高度 44px，两个列表输入后即时检索，无额外提交按钮，主题使用原生 select。焦点始终可见，不以悬停替代。

### Header / Context Navigation

页头只含品牌/返回首页链接与主题控制；首页作品时间轴即产品选择入口。详情恢复自然流内的横向返回列表与上一件／下一件按钮，不使用吸顶目录或目录弹出层；筛选结果连续浏览与返回现场仍保留。跳至内容链接在聚焦时显示。不在页头、侧栏或详情中恢复全站产品菜单。

### Home Timeline（首页作品时间轴）

日期在轨道上方，原生产品链接在下方，包含名称、用途、真实内容预览与「浏览作品」提示。产品按 `date` 升序排列，新产品自动加入；末端用空心节点与虚线表达「未完待续」。没有站牌卡片、线路徽标、时钟或 LED。

布局参考预览为三张图鉴叠纸，默认左右轻旋转，hover / focus-visible 时展开；灵感集使用真实视频默认动态预览，不显示播放开关。图片失败显示「预览暂不可用」。标题与箭头缓缓偏移，预览跟随指针轻微移动。链接焦点轮廓为 2px、offset 8px；滚动区域可聚焦，提供命名 region、左右方向键浏览及原生滚动，前后按钮按一列宽度移动并反映首尾禁用状态。

首页沿时间顺序铺开轨道（900ms），日期错位显现（650ms），作品以裁切展开（950ms）；列间120ms。鼠标拖动直接跟手且屏蔽拖动后的点击；触摸保留原生滚动。灵感集首页预览为真实静音循环视频。reduced-motion 取消空间动画、使用即时滚动并停止自动播放。

### Media Reading

灵感详情先展示标题、作者与分类，再显示媒体。图片按实际比例、object-contain，默认高度上限约 70dvh（手机 65dvh），保留大图阅读；多媒体保留横向 snap、上一张／下一张按钮和页数，原图入口跟随选中媒体。

仅视频使用剩余视口测量：按媒体文档位置、视口高度及工具条高度计算可用高度（最小 240px），为原生播放控制与媒体工具条留空间；普通滚动不改变视频尺寸。长标题、矮屏或恢复提示仍允许自然页面滚动，不把“控件同屏”变成任意视口下强制缩小图片的规则。

详情图片提供放大与原图入口；视频默认静音循环并保留原生控制；非当前媒体、离屏、页面隐藏或减少动态效果时暂停自动播放，用户仍可操作原生控制。加载与失败在媒体位置给出反馈，失败可重试或使用可用原文件操作。布局缺图详情保持真实名称、主题与返回路径。

### Detail Lightbox / Motion

灯箱只作为详情内的放大工具：触发媒体 FLIP 进入 200ms、退出 140ms，采用 `cubic-bezier(0.23, 1, 0.32, 1)`，保留焦点回归与退出控制。通用快速状态 150ms、基础 200ms。首页箭头450ms、标题550ms、预览650ms，使用 cubic-bezier(.16,1,.3,1)；叠纸在指针／焦点下展开，指针驱动轻微预览偏移。灵感列表按行内45ms阶梯入场（650ms），预览悬停反馈550ms。详情图片载入淡入500ms，多媒体保留原有翻页方式。reduced-motion 移除空间过渡并暂停自动视频。

## Do's and Don'ts

### Do:

- **Do** 让首页承担产品选择，内页只提供上下文返回和阅读操作。
- **Do** 用稳定网格、真实媒体与一个详情链接建立可预期的浏览流程。
- **Do** 让详情标题在媒体之前、实际说明在媒体之后自然展开，原作链接放在作者栏。
- **Do** 保留主题、可见焦点、原生视频控制、滚动自动追加与返回现场。
- **Do** 沿用源 tokens、中文排印、共享按钮和局部 CSS 归属。
- **Do** 让首页的日期、细轨道、真实媒体和充足留白表达作品的时间顺序。

### Don't:

- **Don't** 恢复全站菜单、固定侧栏或自动移动内容墙。
- **Don't** 将列表点击改为灯箱中转、列表自动滚动或重复追加已加载内容。
- **Don't** 用固定全高媒体井、窄资料侧栏或层层面板挤压阅读。
- **Don't** 因保留线路色 tokens 而恢复装饰线路色、站牌或待机循环动效。
- **Don't** 删除缺图条目、原作出处或包内原始数据 。首页不添加关于或许可说明，也不另建说明文档。

用户最新约束：2026-09-07 用户指定 Lifeline 参考后，首页改为稀疏单色横向作品时间轴，日期在上、作品在下，以真实缩略图和留白形成节奏；此方向覆盖此前地铁、LED 与时钟方案。首页仍不添加关于、许可或宣传说明，也不另建说明文档；侧栏与全站导航菜单仍然禁止。

2026-09-07 动态媒体恢复：用户最新要求覆盖先前静态预览限制。共用 MotionVideo 在距视口160px时装载媒体、可见比例达到30%时静音循环；非当前媒体、离屏、后台及 reduced-motion 暂停。详情原生手动暂停不会被 canplay 重新启动。列表保留筛选、滚动自动追加和返回现场，原作出处保留，JSON 只存内部。

2026-09-07 详情内容收敛：取消 JSON 与同步信息、文件规格和内部行业/颜色/风格标签；无作者/分类/说明时不显示空占位。原作链接并入作者行，只有真实且不重复标题的说明才在媒体下方展示。单视频不显示额外工具栏，单图片保留放大及原图，多媒体保留翻页。

2026-09-08 用户故事优化：两个列表即时检索，中文化灵感分类；从列表进入详情时保留筛选结果顺序，上一件/下一件沿该结果浏览，返回恢复筛选和位置。直接访问详情使用默认上下文，避免套用旧会话。图片直接点击放大，保留原图入口与焦点回归。首页移除重复轴标签、状态图例、冗余品牌副标题与无溢出时的翻页控件。


2026-09-08 范围纠正：用户明确“每个作品点进去的列表页”才是减法对象。两个列表合并标题与搜索、精简筛选与重复元数据；详情撤回上一版 PC 交互与宽屏阅读，不保留本轮误改的吸顶目录或多图缩略图栏。原始数据、动态预览、自动追加与筛选返回继续保留。

2026-09-08 布局列表继续减法：保留搜索与横排分类，移除主题下拉；搜索入口减轻视觉权重。已有详情主题链接保持有效，主题过滤状态在结果行说明，切换分类或清除筛选即可退出。


2026-09-08 布局详情默认读取高清原图，主图不经缩略图优化；移除独立“打开高清原图／下载高清图”操作。缩略图只用于载入占位或失败兜底，点击主图仍可放大。

2026-09-08 图鉴交互修订：用户否定大小错落的排布，改为统一规整网格（桌面4列、较窄3列、现有小屏2列）。鼠标在图鉴内停留180ms后，图片在固定裁切框内放大2.2倍，按指针位置查看局部；离开恢复完整图片。卡片与文字不位移，点击直达详情。使用本地720px缩略图原始分辨率，避免放大经过缩小优化的图片；触屏和减少动态效果保持完整静态图。


2026-09-08 搜索入口重设计：两个列表默认只显示紧凑的“搜索”胶囊按钮；点击或 / 在标题行原位向左展开380px搜索区并聚焦，内容不移位。即时检索，Enter/右箭头或 Esc 收起并保留关键词；点击外部或 Tab 移出也收起。收起后按钮显示当前关键词，避免隐形过滤；清除仅移除关键词并保留分类。减少动态效果取消展开动画。

2026-09-08 搜索入口减轻权重：收起按钮使用透明底、细描边与常规字重的辅助文字，悬停时轻微加强边界与文字；展开后的收起箭头同步取消实心底色。尺寸、展开方式、即时筛选与键盘行为保留。
