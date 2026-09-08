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
    fontWeight: 500
    lineHeight: 1.35
  detail:
    fontFamily: "'Albert Sans', -apple-system, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "20px"
    fontWeight: 500
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

# Personal Design · 设计规范

本规范于 2026-09-08 在实现前整理，覆盖全站页面与功能。视觉基础为 OpenDesign 的中性色与 Albert Sans；交互采用项目安装的 [emil-design-eng](.agents/skills/emil-design-eng/SKILL.md)。用户最新约束优先于技能示例，保留零动画库、Lifeline 首页与 PC 阅读重点。此前地铁、LED、手动加载、技术信息展示等历史方案不再作为当前规范。

## 1. 设计目标与边界

让访客从作品入口进入集合，快速检索，连续查看内容，返回时继续原来的位置。界面在操作时给出清晰反馈，作品本身承担视觉表达。

- 首页：稀疏单色横向作品时间轴；真实日期、作品名称、简短用途与媒体。不添加轴标签、重复图例、品牌副标题、宣传、关于或许可说明。
- 列表：标题与搜索同行、中文分类、稳定网格；计数仅在筛选结果区域出现。灵感视频默认播放、滚动自动追加；图鉴保持规整网格与停留放大。
- 详情：PC 宽屏阅读，返回及上一件／下一件在自然文档流中。标题、作者、分类与原作入口在媒体前，实际说明在后。不存在的信息不占位。
- 媒体：图片直接点击放大；视频静音循环且有原生控制，离屏及后台暂停。原始 JSON 与同步信息仅在数据包内保留。
- 全站：品牌返回首页与主题切换；不增加菜单、侧栏、吸顶目录或缩略图导航。

## 2. 视觉基础

沿用上方语义 tokens。亮色为白色页面、#fafafa 媒体底、#202020 强文字、#5c5c5c 辅助文字；深色对应 #202020 页面、#353535 媒体底、#fafafa 强文字、#bdbdbd 辅助文字。线路色仅保留为历史 token，当前界面不使用。

| 项目 | 规范 |
| --- | --- |
| 字体 | 本地 Albert Sans，中文回退 PingFang SC／Microsoft YaHei；中文字距 0 |
| 页面标题 | 集合 36px/500/1.35；详情 32px/500/1.35；首页 28px/500/1.35 |
| 内容标题 | 首页产品24px；图鉴卡片15px、灵感卡片16px；相关分组24px |
| 正文 | 14px/1.75，说明最大68ch；日期13px、辅助信息12–13px，数字 tabular-nums |
| 间距 | 4/8/12/16/24/32/48/64px；同组紧凑、组间留白，不为每块内容加面板 |
| 圆角 | 普通控件4px，主按钮及搜索入口胶囊，媒体8px；节点／头像圆形 |
| 控件 | 默认44px目标；搜索48px，内部图标36px；键盘2px清晰焦点环 |
| 边界 | 仅输入、操作和必要分组使用细边界；媒体没有装饰投影或玻璃 |
| 状态 | 默认、悬停、按下、焦点、禁用；禁用保留原生语义，颜色不能独自承担状态 |

## 3. 动效规范（按用途而非装饰）

| 触发 | 处理 | 理由 |
| --- | --- | --- |
| 键盘快捷键、键盘开关、方向键翻页 | 即时，无过渡等待 | 高频操作不能被动画拖慢 |
| 搜索结果、分类切换、自动追加 | 内容即时就位，不做整墙错位入场 | 保持视觉位置和浏览节奏 |
| 指针按下按钮 | 100ms，scale(.98)，释放140ms | 确认输入，不影响布局 |
| 指针悬停 | 120–200ms，颜色用 ease，空间用 cubic-bezier(.23,1,.32,1) | 反馈轻、退出快 |
| 搜索开合 | 指针进入200ms／退出140ms，右侧为原点；可反向中断 | 维持搜索入口与输入的空间关系 |
| 首页首次出现 | 260ms短显现、列间40ms；内容从可见状态进入 | 保留时间顺序，不遮挡入口 |
| 图鉴停留放大 | 停留180ms、进入200ms／退出140ms；固定框内2.2倍 | 快速掠过不误触，阅读局部不移动卡片 |
| 灯箱 | 指针进入200ms／退出140ms，保持触发图关系；键盘即时 | 从阅读到放大的连续关系 |
| 图片就绪 | 最多160ms透明度过渡 | 已缓存图不必重新漫长淡入 |
| 自动视频 | 可视且前台播放，离屏／后台／减少动态效果暂停 | 作品动态保留，资源按需使用 |

仅命名实际过渡属性，避免 transition:all；不动画布局尺寸。动态开关使用可中断 transition；预设入场允许 CSS 动画。hover 空间反馈限于 `(hover:hover) and (pointer:fine)`；键盘模式移除 UI 动画，原生视频控制不受此规则影响。减少动态效果取消空间运动及自动播放，手动视频控制保持可用。

## 4. 页面与功能设计

### 首页 `/`

品牌在自然页头，作品时间轴标题与年份在上。日期位于1px轨道上方，产品块位于下方。产品按 `date` 升序、同日维持注册顺序；列宽420/380/340/290px适配现有断点。末端虚线对应「未完待续」。每件作品一个原生链接，布局预览展示三张真实图鉴，灵感使用真实动态媒体。

原生水平滚动可用；仅溢出时出现翻页按钮，禁用端点明确。鼠标拖动在6px阈值后捕获指针，拖动后不误点链接；无溢出不启动拖动。键盘方向键即时移动一列。悬停只作小幅预览反馈，不对每个指针坐标写父元素样式。

### 布局列表 `/products/layout-compositions`

1440px页面、桌面48px边距。标题与辅助搜索入口同行，分类下划线选中；保留现有主题链接，但没有主题下拉。默认网格4列，1199px以下3列，759px以下2列；统一3:4媒体，不错落排布。标题与箭头在媒体下方，不重复编号及分类。

即时查询匹配名称、编号、分类、主题，URL为筛选真值；已有主题与分类组合正确归一。零结果保留查询、给出清除入口。缺图条目保留名称、点击和详情；实际图片失败在原框显示状态。图鉴停留放大只移动框内图像，卡片和标题不位移。

### 灵感列表 `/products/muse`

与图鉴相同的标题／搜索／分类布局；网格4/3/2/1列、媒体4:3。卡片只保留标题、实际作者和多媒体数量。视频可视默认静音循环，非当前／离屏／后台暂停；海报在等待时可读。

分类和关键词即时检索，分类以中文呈现；不显示预览开关或手动追加按钮。接近底部600px自动追加24件，返回恢复已加载数量。失效预览仍是可进入详情的链接；空结果与空内容分别说明，不无限展示加载状态。

### 布局详情 `/products/layout-compositions/[id]`

1440px宽屏页面、标题区960px、图鉴原图720px；原图不通过低清优化，缩略图仅作等待／失败兜底。标题下显示图鉴编号、分类和主题链接。主图可直接放大，指针悬停提示点击放大。无图片时显示简短原因及同主题入口。下方保留同主题相关图鉴。

### 灵感详情 `/products/muse/[slug]`

1200px宽屏页面，标题、作者、分类、原作链接在前；图片自然大尺寸阅读、说明在后。无作者／说明时不占位。视频按剩余视口适配并保留原生控制；图片不套用视频缩小策略。多媒体保留原生横向 snap、前后按钮、当前页数；首尾禁用，选中项变化同步原媒体链接。

### 详情连续浏览

由列表进入时，上一件／下一件沿筛选结果，不跳回分类默认顺序；返回恢复 URL、滚动位置、已追加数量与来源焦点。直接访问详情使用默认上下文，不误用旧会话。由列表进入的链接携带实际分类／主题／关键词；新标签与复制链接可独立恢复顺序。返回位置按产品与规范化筛选地址分别保存，不能被另一筛选覆盖。详情、轮播、灯箱的方向键各自处理，输入框与原生媒体操作不被抢占。导航分组沿用自然文档流，不增加吸顶结构。

### 灯箱

恒定暗房、图片按原始比例 contain、不拉伸；关闭常驻可见。Tab留在灯箱内，Esc关闭并恢复触发焦点，背景 inert 与滚动锁。高清图等待时展示缩略图；失败可重试。同组翻图可以循环，计数与标题同步；换图后不飞回第一张的触发框。键盘进入、退出及切换没有动画等待。

### 404、页面错误与媒体状态

404给出唯一清晰首页出口。页面错误显示发生了什么、重新加载与返回集合，重试不改 URL。错误／空／加载均使用中性排印，正文14px，标题24px，单个主要恢复操作；不用空的技术字段。新增根页面级 error 边界覆盖其下页面（根 layout 异常不在该边界内），灵感保留集合专属恢复入口。

## 5. 端到端验收

按 [交付目标与验收表](docs/design/emil-design-eng/delivery.md) 逐项记录实际结果。验收重点为1440与1280桌面、双主题、键盘、真实内容以及错误状态；小屏仅验证既有响应式不破坏，不扩展新的移动端设计。类型检查、全站Lint、已有浏览上下文测试和生产构建必须通过；浏览器验证搜索→筛选→详情→相邻→返回、自动追加、媒体放大与Esc焦点回归。生成页面共享模板，不把每条内容误报成独立设计。
