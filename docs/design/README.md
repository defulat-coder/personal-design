# 设计文档入口

现行版本：2026-09-12。本站现有设计的统一规范，不另换视觉体系。

## 阅读顺序与职责

| 文档 | 职责 |
| --- | --- |
| [PRODUCT.md](../../PRODUCT.md) | 用户、产品能力与内容边界 |
| [DESIGN.md](../../DESIGN.md) | 全站视觉、控件、主题、排印、布局与动效标准 |
| 本文件 | 页面流程、实现入口与验收要求 |
| [控件标准](controls/README.md) | 共享控件用途及获准例外 |
| [OpenDesign 迁移规则](open-design/rules.md) | 来源依据与本站适配；source 只读 |
| [前端 Agent 指引](../../apps/web/AGENTS.md) | 修改和验证代码的操作要求 |

`execution/`、`redesign-v2/`、`emil-design-eng/` 及历史 review 图像记录当时交付结果，不能覆盖以上现行规范。不要把旧截图或单次检查当作当前版本已通过验收。

## 页面契约

### 首页 `/`

- Lifeline 风格的稀疏单色横向时间轴；作品按 date 升序，同日保持注册顺序，未确认上线日的作品明确标注收录日期。
- 日期在细轨上方，名称、用途与真实预览在下方；每个作品一个链接。末尾只留“未完待续”，不恢复站牌、LED、轴标签、图例或额外关于／许可说明。
- 布局参考预览为八本分类书，随机逐本抽取展示封面；灵感集预览为真实动态媒体；个人网站预览保留小票打印与网站画面。
- 水平滚动与拖动浏览；超过 6px 后判定拖动并抑制误点，仅溢出时出现翻页按钮；方向键即时移动一列。
- 进入三个作品时名称衔接到内页页头；返回时原页面先退场，再反向衔接到首页。原生新标签、复制链接与预取行为保留。
- 页头头像为点击触发的太极彩蛋，支持 Esc 收起；不阻塞作品链接。

实现：[home-view.tsx](../../apps/web/components/home-view.tsx)、[workspace-shell.tsx](../../apps/web/components/workspace-shell.tsx)、[site-receipt-preview.tsx](../../apps/web/components/site-receipt-preview.tsx)、[taichi-avatar.tsx](../../apps/web/components/taichi-avatar.tsx)。

### 布局参考 `/products/layout-compositions`

- 分类入口是八本实体书脊，不是旧图鉴网格。保留常驻检索；搜索匹配名称、编号、中英文分类和主题。
- URL 使用 q、theme、cat、page；命中项进入对应分类并定位所在跨页。没有命中的分类禁用；缺图条目保留查询能力。
- 点击从实际书脊抽出、展示封面、对齐并翻开画册；直达地址不重播抽书。序列期间抑制重复打开和翻页。
- 画册每个真实图鉴占一页；双页显示，单次翻动一个跨页；方向键、触摸横滑可用。图片保持比例，点击放大即为详情阅读，不另加“查看详情”跳转。
- 翻页按钮位于书本左右中部，每张实际书页下方居中显示独立页码；结束空页不编号，不在书外重复展示总页码。
- 搜索只留在书架。指针点击页头返回时先合册退场再回书架；Esc及减少动态效果即时返回。恢复书脊焦点和书架滚动；关闭放大回到当前书页。

实现：[layout-bookshelf.tsx](../../apps/web/components/layout-bookshelf.tsx)、[book-opening.tsx](../../apps/web/components/book-opening.tsx)。

### 灵感集 `/products/muse`

- 中文分类与搜索即时过滤；保持稳定 CSS grid，卡片单链接直达详情，无灯箱中转。
- 仅展示真实标题、作者与多媒体数量；结果数量集中呈现。
- 视频在可视范围默认静音循环；离屏、后台及减少动态效果暂停。预览失败仍可进入详情。
- 距列表末端约 600px 时每批追加 24 件；不设手动加载或预览开关。返回恢复筛选、已加载数量与滚动位置。
- 空数据和零搜索结果分别说明，后者保留查询与清除入口。

实现：[plate-wall.tsx](../../apps/web/components/plate-wall.tsx)、[CollectionSearch](../../apps/web/components/collection-search.tsx)、[CategoryTabs](../../apps/web/components/category-tabs.tsx)。

### 灵感详情 `/products/muse/[slug]`

- 作品名称、作者、分类与原作入口在媒体前，实际说明在媒体后；无信息就省略。
- 上一件／下一件为文字组与细长方向箭头，短竖线分组，无外框与导航行底线。
- 图片自然大尺寸阅读并可点击放大；只有视频按剩余视口适配，保留原生控制。
- 多媒体保留横向 snap，前后操作位于媒体左右中部，计数和原媒体链接随当前项同步。
- 相邻作品沿进入时的筛选结果；返回先播放详情退场，再恢复筛选现场。复制与新标签链接可恢复自身查询，不继承无关的旧会话。

实现：[详情页面](../../apps/web/app/products/muse/[slug]/page.tsx)、[browse-navigation.tsx](../../apps/web/components/browse-navigation.tsx)、[inspora-media-carousel.tsx](../../apps/web/components/inspora-media-carousel.tsx)。

### 布局独立详情 `/products/layout-compositions/[id]`

保留直达地址、编号、名称、分类、主题、原比例图鉴与相关内容。连续浏览采用共享描边按钮；缺图说明真实原因，不删条目。画册流程不额外跳转到此页。

实现：[详情页面](../../apps/web/app/products/layout-compositions/[id]/page.tsx)。

### 个人网站 `/products/personal-sites`

页头返回作品时间轴，正文保留两段静态介绍、唯一“打开网站”主按钮与真实宣传片。无龙卷风、逐字显现或其他文字入场逻辑。宣传片可视静音循环，点击或空格／Enter 切换播放，失败可重试；外链在新标签打开。首页的小票预览与这里的介绍文字是不同组件。

实现：[介绍页](../../apps/web/app/products/personal-sites/page.tsx)、[site-showcase-media.tsx](../../apps/web/components/site-showcase-media.tsx)。

### 灯箱与恢复状态

灯箱为局部暗房：背景 inert 与滚动锁、焦点约束、常驻关闭、Esc 和触发点焦点回归。高清等待使用缩略图兜底，失败可重试；组内翻图同步标题与计数。方向键不能抢占输入与视频原生操作。

404 提供清晰首页出口；页面错误提供重新加载和所属集合返回，不改变查询；媒体失败提供具体恢复动作。禁止原始 JSON、同步信息、内部文件字段或空信息占位。

## 修改后的验收要求

本节是要求，不是所有现有代码已达标的声明。

1. 对照修改范围运行类型检查、相关文件 lint、适用的已有测试；涉及路由或页面渲染时执行生产构建。
2. 使用项目规定的 ego-browser 检查 1280 / 1440px 桌面、双主题、键盘、减少动态效果；小屏检查现有布局与操作是否被裁切。
3. 改集合或详情时验证搜索 → 筛选 → 详情／画册 → 相邻浏览 → 返回现场；改媒体时验证等待、失败、暂停、放大、Esc 与焦点回归。
4. 改动效时同时列出进入和退出入口，按 DESIGN.md 的成对动效规则及状态矩阵验收；运行回退专项和综合动效回归。分别记录行为存在、状态正确、视觉连续三个门槛；站内返回与浏览器原生后退单独记录，缺少视觉证据时不得标为全部通过。
5. 报告实际检查范围与限制，不把共享模板数量写成逐页视觉验收数量。

## 已知核对项

- 首页进入作品的导航、标题清理、双主题、键盘及减少动态效果已有本会话功能检查；ego 截图接口持续超时，尚未完成视觉帧验收。
- 开册、首页预览与路由动效已接入统一输入／偏好策略；行为回归使用 `sh scripts/design-checks/workspace-navigation.sh`。回退专项检查为 `sh scripts/design-checks/back-motion.sh`。回退稳定性检查为 `sh scripts/design-checks/back-stability.sh`，覆盖旧画册移除后清理、书脊焦点恢复与整页／子项位移不叠加。这些脚本不能替代视觉关键帧验收。
- 书籍开册仍有局部 width / height 插值；属于现有实现，需实测性能，不能表述为全部动效仅使用 transform / opacity。
