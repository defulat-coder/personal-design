# 设计迭代日志

每轮记录：4 维度问题清单摘要 → 选题 → 方案 → 验证结果。

---

## 第 1 轮（2026-09-03）—— 首页首屏重构 + 撕角彩蛋修复

### 审查清单摘要（4 个 SubAgent 并行）

**P0 共识（多维度交叉命中）**
- 首页塌陷：单产品 track ~800px 不溢出，滚轮/拖拽/键盘全部落空，下半屏死白，rail 断在屏幕中间（4/4 命中）
- 撕角全开 bug：clip polygon 退化为左下三角，front 层永远撕不干净，两层标题叠印成乱码（4/4 命中）
- 内页分类 tab 逻辑写反：只在搜索时出现且点击=退出搜索（3/4 命中）→ 列入第 2 轮

**P1 高票**
- 全站零强调色、rail 1px 细到看不见（UI）
- 时间轴无进度感：无渐隐边缘/进度条/位置提示（UX、动效）
- 移动端文案错误（「滚轮、方向键」对触屏不成立）（UX、动效、用户故事）
- 首页 hover 预览与封面同图，纯冗余（UI、UX、动效、用户故事 4/4 命中）
- 滚轮被超长列「劫持」（UX）→ 列入第 2 轮
- 拖拽松手无惯性、lerp 未按 dt 归一（120Hz 屏手感快一倍）（动效）
- 撕角可发现性低（96px 浅灰三角 + 12px 灰字）（UI、UX、动效）
- 灵感墙戏剧性不足，应暗房反转（UI）；首页缺 Attribution（用户故事，违反 CC BY 4.0）
- reduced-motion 只覆盖 CSS keyframes，JS 动效漏网（动效）→ 部分本轮修复，lightbox/corner-peel 遗留

### 选题
**首页首屏重构 + 撕角修复**。理由：首屏是 100% 用户第一眼所见，且撕角是全站唯一的「啊哈」时刻却全开即破版。

### 方案与实现
- `timeline.tsx`：rail 改为 `min-w-full` 全出血 + 右端 120px 渐隐（暗示延伸）；容器两端 40px mask 渐隐；新增左下角滚动进度条（仅可滚时显示）；lerp 按帧间隔 dt 归一化；拖拽松手惯性（指数平滑速度 × 220ms）；reduced-motion 直接 snap；移动端隐藏原生滚动条
- `corner-peel.tsx`：全开 700ms 后 front 层 `visibility: hidden`（修复叠印 bug）；首访 1.6s 自动微掀 72px 再落下（招手提示，reduced-motion 跳过）；纸角改白纸渐变 + 更强投影；提示文字加呼吸微动效
- `home-view.tsx`：h1 升至 text-5xl/6xl；产品节点加宽至 420px、封面 aspect-[16/10]、内容垂直居中（`center` prop）；新增「关于」文字节点（左缘粗线卡片）让首访者理解站点；日期标签去重（No.01 · 9 月 3 日）；移除冗余 hover 预览；提示文案按 hover 能力切换；底部补 Attribution
- `inspiration-wall.tsx`：**暗房反转**（bg-neutral-950，局部突破浅色基调——理由：撕开的瞬间需要明暗反差才成立「另一个世界」，且该层本就是 Playground 定位）；卡片放大至 w-40/52；补 Attribution
- `globals.css`：marquee 悬停暂停；hint 呼吸 keyframes；reduced-motion 覆盖新增动画

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser 截图走查（1512×828）：首屏 rail 全出血、三节点成立、垂直居中生效（`/tmp/r1-home.png`）；撕角全开后 front 层完全隐藏、暗房灵感墙完整呈现（`/tmp/r1-wall.png`）——P0 bug 确认修复

### 遗留（下轮候选）
- 内页分类 tab 常驻 + 点击平滑滚动到节点（P0）
- 滚轮被超长列劫持（P1）
- 搜索匹配分类/二级主题名；空结果引导（P1）
- 灯箱：transform 版 FLIP、关闭按钮、图注、左右切换（P1/P2）
- 内页条目行节奏与缩略图放大；二级标题 sticky（P1）
- 详情页右栏空洞 + 同主题推荐 + prev/next 上移（P2）
- 全站强调色引入评估（P1，需谨慎）
- 内页时间轴/网格视图切换（P1）

---

## 第 2 轮（2026-09-03）—— 内页分类导航与浏览体验 + 诚实性修复包

### 审查清单摘要（4 个 SubAgent 并行，均先读 design-log 复审）

**P0 共识**
- 内页分类 tab 逻辑仍写反（连续两轮 4/4 命中；3/4 的「只能改一件事」）

**P1 高票与新发现**
- 首访招手动画完全不可见：72px < 静止手柄 96px，帧比对零像素变化（动效，实锤）
- 首页宽屏（≥1280px）轨道不溢出：文案承诺「滚轮探索」落空、两端渐隐在「撒谎」（UX/动效/用户故事 3/4 命中）
- 移动端内页 peek 仅 2px + 无 snap 可停在两列各半的破碎态；渐隐/进度条在原生模式全灭（UI/UX）
- 内页/灵感墙移动端 hint 文案错误（首页第 1 轮已修，内页漏改）（3/4 命中）
- 灯箱：无关闭按钮/图注/详情入口、layout 版 FLIP、reduced-motion 漏网、暗房下遮罩失效（4/4 命中）→ 留第 3 轮整体升级
- reduced-motion 对 lightbox/corner-peel transition 漏网；RM 下 marquee 停播导致灵感墙 1/3 内容不可达；撕角关闭时 marquee 空烧合成器（动效）
- 二级分组标题随列滚动丢失上下文（UI/UX）
- 搜索不匹配分类/二级主题名；空态无引导（UX/用户故事）
- 「关于」节点文案「向左回望」与升序排列方向矛盾（UI）
- hover-preview lerp 未 dt 归一；未缓存图先显空白白卡（动效）

### 选题
**内页分类导航与浏览体验 + 诚实性修复包**。tab 是连续两轮唯一 P0；顺手清掉所有「承诺与事实不符」的诚实性问题。灯箱整体升级留第 3 轮。

### 方案与实现
- `timeline.tsx`：`forwardRef` 暴露 `scrollToNode(index)`（自定义模式 lerp 平滑、原生模式 scrollTo smooth）；新增 `onScrollableChange` 回调；两端渐隐与 rail 右端渐隐改为仅 `scrollable` 时启用（诚实化）；移动端节点 72vw（peek ~70px）+ `snap-x snap-mandatory`/`snap-start`；新增 focus 捕获（Tab 焦点进入屏外节点时自动滚入视口）；进度条加粗 2px 加长 w-32
- `layout-gallery.tsx`：tab 常驻（移动端横向滚动收纳），点击 = 平滑滚动到对应节点；IO 位置感应高亮（多节点取最靠左），点击意图锁（手动滚轮/拖拽/键盘才解锁）；二级分组标题 `sticky top-0`；搜索匹配 +二级主题 +分类名；空态加「试试词」快捷 chips + 清除按钮；hint 双文案按 hover 能力切换并移到底部
- `home-view.tsx`：提示文案按 `scrollable` 联动（不可滚时说「点击节点，进入产品。」）；「关于」节点方向矛盾修正（「从最早的出发，向右生长」）
- `corner-peel.tsx`：招手 72→168px（超过静止手柄，帧比对可见）+ sessionStorage 每会话一次；reduced-motion 时所有 transition 置 none；根节点 `data-peel-open` 供 CSS 联动
- `hover-preview.tsx`：lerp dt 归一（与 timeline 同公式）；未缓存图 `img.complete` 后才显形；下缘 clamp 修正（预览图实际高约 300px）
- `lightbox.tsx`：reduced-motion 时 transition 置 none（整体升级留第 3 轮）
- `globals.css` + `inspiration-wall.tsx`：撕角关闭时 marquee 暂停（不空烧合成器）；RM 时 marquee 行容器可手动横滑（内容可达）

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser 实测（1512×828）：首页提示文案联动为「点击节点，进入产品。」；内页 tab 常驻、点击「中国传统构图」平滑滚动至 -1848px 且高亮锁定（`/tmp/r2v-inner-click2.png`）；初始高亮最左节点「构图逻辑」；搜索「跨页」返回 9 条（二级主题匹配生效）
- 复测中出现过一次「截图与 DOM 高亮不一致」，复测两轮确认为自动化环境 artifact（HMR 帧），非代码问题

### 遗留（下轮候选）
- 灯箱整体升级：transform 版 FLIP、关闭按钮、图注（id+名称）、「查看详情」入口、左右切换、暗房下遮罩加深（P1，4/4 命中，第 3 轮首选）
- 滚轮被超长列劫持（tab 直达后弱化，仍存）
- 详情页右栏空洞 + 同主题推荐 + prev/next 上移 + query 同步 URL（P1/P2）
- 内页条目行节奏与缩略图放大（P1）
- 灯箱关闭动画飞回 marquee 旧位置（P2）
- 全站强调色引入评估（P1，需谨慎）
- 内页时间轴/网格视图切换（P1）
- 移动端撕角 HAND 96px 占比过大；招手动画触屏价值低（P2）

---

## 第 3 轮（2026-09-03）—— 灯箱整体升级（含 RM P0 根治）

### 审查清单摘要（4 个 SubAgent 并行；3 个曾因配额中断，恢复后完成）

**P0（本轮必修）**
- RM 下灯箱永远无法关闭、透明遮罩锁死整页——第 2 轮 RM 补丁把 transition 置 none，而卸载唯一路径是 `onTransitionEnd`（用户故事 + 动效双维度实测实锤，属第 2 轮引入的回归）

**P1 共识（灯箱设计输入，4/4 命中）**
- 灯箱是死胡同：无关闭按钮（移动端无 Esc = 死局）、无图注、无详情入口、无左右切换
- layout 属性 FLIP（left/top/width/height）主线程重排；frame 用 window 快照、resize 不重算
- 遮罩 0.6 在暗房 neutral-950 上增量不足；灯箱打开期间 marquee 继续跑，关闭动画飞回旧位置
- 全图点击才开始加载，慢网 FLIP 空放；缓存图 onLoad 可能不触发
- 移动端 active tab 会滚出 tab 栏可视区（UX 新发现）
- IO 高亮只看当前批次：慢速滚动滞留/跳格、末端三个 tab 永远无法被位置感应点亮（动效代码分析 + UX 实测）
- 详情页 prev/next 首屏外 + 跨主题跳页；query/tab 状态不进 URL（→ 第 4 轮「详情页与浏览闭环」）

### 选题
**灯箱整体升级**（4/4「只能改一件事」均为灯箱或其子项），RM P0 列为验收项。捆绑：IO 高亮规则修正、active tab scrollIntoView。

### 方案与实现（`lightbox.tsx` 重写）
- **卸载双通道**：transitionend + 超时（DURATION+80ms）兜底；RM 下直接状态卸载——根治 P0，同时消除「动画被打断留残影」类边缘
- **transform 版 FLIP**：img 固定终态 frame，起始态 `translate + scale` 反算，全程合成层；frame 按源 rect 纵横比适配 88vw/78vh，resize 监听重算
- **关闭目标动态化**：关闭瞬间重新测量触发元素 `getBoundingClientRect()`（sourceEl 断开则回退初始 rect）；打开期间 `body[data-lightbox-open]` 暂停 marquee（CSS 联动），位置不再漂移
- **图注栏**：`编号 + 名称` + 「查看详情 →」直达 `[id]` 页（打通灯箱→详情→下载动线）；**显式 × 关闭按钮**（移动端常驻）；**同组左右切换**（内页 = 同二级主题有图条目，灵感墙 = 该行条目；支持 ←/→ 键）
- **加载策略**：thumb 打底播 FLIP，高清图 onLoad 后淡入；ref 回调补检 `img.complete`（修缓存图 onLoad 不触发的真实 bug，验证中抓到）
- **遮罩**：`neutral-950/70 + backdrop-blur-sm`，明暗背景通用；`ring-1 ring-white/10` 保暗房下边缘
- 焦点进 dialog（键盘不再漏给背后的时间轴）；Esc/←/→ 键盘支持
- `layout-gallery.tsx`：IO 高亮改「全节点可见率最高（并列取最左）」，threshold 多档，修滞留/末端偏格；active tab 变化时 `scrollIntoView(inline:nearest)`；条目点击携带 siblings 上下文
- `inspiration-wall.tsx`：同样接入 siblings + serial + href

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser DOM 级实测：灯箱打开后 caption「001 三分法构图」、关闭/左右/详情链接齐全、`data-lightbox-open` 置位；「下一张」→ 002 黄金比例构图；× 关闭正常
- **RM 验收（CDP 模拟 prefers-reduced-motion）**：开 → Esc 关 → `elementFromPoint` 命中真实链接（P0 根治确认）
- 缓存高清图 opacity=1（ref 补检生效）
- 环境备注：隔离 tab rAF 节流导致截图常抓到 FLIP 中间帧，属自动化 artifact，真实前台 32ms 内双帧展开

### 遗留（下轮候选）
- **详情页与浏览闭环（第 4 轮首选）**：prev/next 上移到下载按钮下方 + 限定同二级主题（当前跨主题跳页）、同主题推荐条、主图限高一屏看全 + 点击进灯箱、query/activeCategory 同步 URL（返回原位/可分享）
- 搜索网格卡片也接灯箱（两视图心智一致）
- 内页条目行节奏与缩略图放大（移动端 56×74）
- 滚轮劫持残留（弱化后 P2，暂不加复杂度）
- 移动端撕角 HANDLE 96px 占比过大（P2）
- 全站强调色引入评估（P1，需谨慎）
- 内页时间轴/网格视图切换（33 个二级主题的直达入口）（P1）

---

## 第 4 轮（2026-09-03）—— 详情页与浏览闭环

### 审查清单摘要（4 个 SubAgent 并行）

**P0**
- 返回旅程全线失守：搜索词/tab/滚动位置全丢（query 纯组件 state；用户故事维度实测升级为 P0）
- 详情页 prev/next 跨主题跳页（catalog 线性相邻共 32 处跨主题边界）+ 桌面首屏外（y=939 > 828）

**P1 共识**
- 详情页：主图超一屏且不可放大、右栏 ~500px 空洞、零动效、键盘 ←/→ 缺失
- 搜索网格与时间轴点击行为不一致（网格整卡只能跳详情）
- 灯箱打磨：切条目「硬跳 + dip」需 crossfade、翻图无计数（3/15）、不预取相邻图、关闭动画 530ms 内按方向键会闪没（竞态）、翻多张后关闭飞回第一张位置、移动端箭头压图 17-30px

**P2**
- 001/350 硬编码、chips 语义混排、缺图占位双边框、暗房图注对比度、窄桌面 hint 错配

### 选题
**详情页与浏览闭环**（4/4 共识；用户故事建议 URL 状态与 prev/next 捆绑，正合本轮主题）。灯箱打磨包搭车（改动隔离在 lightbox.tsx）。

### 方案与实现
- **`[id]/page.tsx` 重排**：prev/next 限定同二级主题（组内相邻，跨主题 32 处边界消除）+ 上移到下载按钮下方（缩略图小卡片，首屏可达）；新增「同主题」推荐条（前后最近 6 张缩略图，填满右栏空洞）；主图 `lg:h-[calc(100dvh-12rem)]` + object-contain 一屏看全 + 点击进灯箱（`DetailMainImage`，siblings 同主题）；键盘 ←/→ 翻页（`DetailKeyboardNav`，新文件 `detail-tools.tsx`）；编号改 `catalog.length`；尺寸 chip 降格为纯文本；缺图占位去双边框；纯 CSS 入场 `detail-in`（server 兼容，页间导航重挂载即重播，RM 关闭）
- **URL 状态**（`layout-gallery.tsx`）：query/activeCategory ↔ `?q=&cat=`（router.replace 不产生历史）；初始 state 从 URL 读取 + cat 恢复时 scrollToNode 定位；useSearchParams 需要 Suspense 边界（page.tsx 已包）
- **搜索网格接灯箱**：图片区点击开灯箱（siblings = 本组有图条目），文字链接进详情——两种视图心智一致
- **灯箱打磨包**（`lightbox.tsx`）：切条目 crossfade（旧高清图保留到新图 onLoad 再淡出，消灭硬跳+dip）；图注加 `index+1 / total` 计数；展开后预取相邻两张高清图；关闭竞态修复（`go()` 清卸载倒计时 + 显式 `closingRef` 替代 `!expanded` 推断）；翻页后 sourceEl 置空（关闭原地微缩淡出而非飞回第一张）；移动端切换按钮并入图注栏（侧翼箭头 sm 起才显示，不再压图）；图注 text-shadow（暗房亮色卡片上可读）

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser 实测（桌面）：/132 详情页 nav 只有「下一张 · 133 双栏版式」（同主题、navTop=312 首屏内）、推荐条 6 张、编号 132/350；主图灯箱 caption + 计数 1/8；tab 点击 → `?cat=07-chinese-composition`、搜索 → `&q=跨页`、进详情 → 返回 → URL/搜索词/9 条结果全部恢复；详情页 ArrowRight → /133
- 过程中修一处 lint 拦截：恢复 effect 里多余的 setState（初始 state 已读 URL），删除后通过

### 遗留（下轮候选）
- 时间轴滚动位置恢复（本轮只恢复了 q/cat，scrollLeft 恢复存 sessionStorage 可做）
- 灯箱 swipe 手势（移动端翻图）
- 内页条目行节奏与缩略图放大（移动端 56×74）
- 内页时间轴/网格视图切换（33 个二级主题直达）
- 滚轮劫持残留（P2，暂不加复杂度）
- 移动端撕角 HANDLE 96px 占比过大（P2）
- 窄桌面 hint 与 nativeScroll 状态对齐（P2）
- 全站强调色引入评估（P1，需谨慎）
- 灯箱：RM 下 crossfade 的 outgoing 清理即时化已做；切条目时 frame 不随条目纵横比重算（当前全站 3:4 统一，无忧）

---

## 第 5 轮（2026-09-03）—— 冲突修复 + 反馈与状态恢复打磨包

### 审查清单摘要（4 个 SubAgent 并行）

**主链路 verdict**：无 P0 级新问题（3/4 明确「主链路没有死路」，UI 维度「骨架可停手一轮、零强调色维持不加」）。「按主题翻图鉴」旅程桌面 8.5/10、移动 6.5/10。

**唯一功能性 bug（3/4 命中，动效定 P0）**
- 详情页打开灯箱后按 ←/→：灯箱翻图与 DetailKeyboardNav 跳页同时触发——第 4 轮两条新动线在同一个按键上互相拆台

**P1**
- 搜索结果深滚后返回，scrollTop 归零（q/cat 恢复了但位置没恢复，「记得一半比全丢更出戏」）
- 翻页后关闭灯箱：thumb 层 opacity 恒 0.99，「微缩淡出」只缩不淡、结尾硬切
- 全站没有任何 `:active` 按压反馈（触屏唯一即时反馈渠道缺失）
- detail-in 连翻时每页强制重播 0.5s，翻图鉴节奏被拖慢

**P2 一批**：推荐条缩略图无编号、sizes 过度声明 2.6 倍、搜索网格缺图双边框、移动端撕角 HANDLE 占 1/4 屏宽、窄桌面 hint 与 nativeScroll 脱钩、灯箱缺 swipe、nav 孤立分隔线（不会触发）

### 选题
**冲突修复 + 反馈与状态恢复打磨包**。无新 P0 可做，清掉冲突 bug 与「记得一半」的状态断点，补齐触屏反馈。

### 方案与实现
- **键盘冲突**：`DetailKeyboardNav` 回调开头守卫 `document.body.dataset.lightboxOpen === 'true'`（一行）
- **关闭淡出硬切**：thumb 层 opacity 改 `expanded ? 1 : hasOrigin ? 0.99 : 0`（无回飞目标时一并淡出）
- **搜索滚动位置**：sessionStorage 按关键词存 scrollTop（150ms 防抖），回到搜索视图时恢复
- **`:active` 按压反馈**：tab/chips/下载按钮/NavCard/推荐卡/灯箱全部按钮 `active:scale-[0.95-0.98]`，条目行 `active:bg-neutral-200`，`transition-colors` 相应改 `transition`
- **detail-in 翻页跳过**：详情→详情导航（NavCard/推荐条/键盘）sessionStorage 记目标路径，到达后 `html[data-detail-nav]` 禁用当页 detail-in。调试中连抓两个真实时序问题：导航过渡期旧树会跑 effect 提前消费标记（改记目标路径、到达才消费）+ StrictMode 双跑 effect 把刚设置的 dataset 删掉（consumed ref 守卫）
- **灯箱 swipe 翻图**：手写 pointer 手势（8px 激活、64px 或 0.5px/ms 触发、0.9 阻尼跟手、200ms 回弹），RM 保留手势去回弹动画
- **小项**：推荐条缩略图下加编号、sizes 改 `(min-width:1024px) 140px, 33vw`、搜索网格缺图占位 inset-3 装裱式、撕角 HANDLE 改 `min(96px, 22vw)`、nav 加 `prev || next` 条件、hint 媒体查询对齐 nativeScroll 判定 `(hover:hover) and (min-width:768px)`（首页+内页）

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser 实测：灯箱打开按 → URL 不变 caption 翻图（冲突修复）；NavCard/键盘导航后 `data-detail-nav=true`（动画跳过）、直接进入详情 flag 为空（入场保留）；搜索「跨页」scrollTop 存取一致（298=maxScroll，clamp 正确）
- 过程中修两处自己引入的问题：swipe 起始行多余表达式（lint 拦截）、detail-nav 标记的两个时序 race（见上）

### 遗留（下轮候选）
- 灯箱 focus trap + 关闭后焦点还源（P2，~20 行）
- 33 个二级主题直达：节点列顶部 chips 列内锚点（UX 推荐的最小方案）或时间轴/网格视图切换
- `?q=&cat=` 组合链接清除搜索后 cat 语义丢失（P2，稀少场景）
- 时间轴 scrollLeft 精确恢复（UX 建议降级关闭：cat→scrollToNode 已覆盖节点粒度）
- 内页条目行缩略图移动端放大（UI 建议关闭：非必需）
- 全站强调色：UI 维度结论「维持不加」，若未来要加只考虑进度条与灯箱「查看详情」两处

---

## 第 6 轮（2026-09-03）—— 灯箱 Portal 根治 + 焦点/无障碍包

### 审查清单摘要（4 个 SubAgent 并行）

**P0（动效实测实锤，藏了两轮）**
- 详情页灯箱被 `detail-in` 的 transform fill 污染：fixed dialog 以主图容器为包含块——遮罩只有主图区域、图注栏被 overflow 裁掉不可见不可点、点击穿透命中背景。第 4 轮引入，历次 DOM 级验收（caption/计数/标记都对）发现不了 paint/hit-test 层的问题

**P1**
- 灯箱初始聚焦从未生效：dialog 渲染被 `active && frame` 门控，`[active]` effect 跑时 dialog 未挂载，focus() 静默落空——第 3 轮日志宣称的「焦点进 dialog」实际不成立（UX 实测 focusin 为空）
- 撕角关闭时灵感墙 48 个按钮占据 Tab 序头部（键盘旅程第一个接触点断链）
- swipe 回弹后 transition 残留：后续拖拽全程慢 200ms（首次拖拽是好的所以第 5 轮没抓到）

**P2**
- 时间轴条目行灯箱热区是 `a > span[onClick]`：键盘不可达，与搜索网格（button）能力不一致
- 按压反馈漏两处（首页产品卡、灵感墙卡片）；swipe 速度判定用全程平均读不到「末尾发力」；hover-preview 无 RM 处理（第 1 轮漏网清单最后一项）；搜索新词不清零滚动位置；节点列 webkit 滚动条粗糙；移动端「拉回来」hint 与 footer 过近

### 选题
**灯箱 Portal 根治 + 焦点/无障碍包 + swipe 残留**（P0+P1 集中修复）。二级主题 chips 直达（UI/UX 共同推荐的最后一个功能性断点）排第 7 轮。

### 方案与实现
- **Portal**：dialog `createPortal(…, document.body)`——根治 transformed 祖先污染，此后任何新入场动画都不会再伤灯箱
- **焦点三件套**：初始聚焦移到 `[active, frame]` effect（frame 就绪即 dialog 已挂载）聚焦关闭按钮；dialog 上 Tab/Shift+Tab 循环 trap；关闭后焦点还源到 `document.activeElement` 记录
- **inert 灵感墙**：back 层 `inert={!open}` + `aria-hidden`（React 19 原生属性），48 个不可见焦点停顿消除
- **swipe 残留**：onSwipeStart 清 transition，翻图分支也清；速度判定改指数平滑尾部速度（与 timeline 拖拽同口径）
- **条目行键盘可达**：`a > span[onClick]` 重构为「button（图，开灯箱）+ Link（文字，进详情）」并列结构
- **小项**：首页产品卡/灵感墙卡片补 `active:scale`；搜索新词显式 scrollTop=0；节点列 webkit 滚动条细条样式；hover-preview RM（lerp 吸附 + tilt 置 0）；移动端「拉回来」hint 隐藏（max-sm）

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser **截图级验收**（吸取 P0 教训不再只查 DOM）：详情页灯箱全视口 1496×846、parent=body、图注可见、×按钮带焦点环（初始聚焦生效）（`/tmp/r6v-portal.png`）
- 焦点还源实测：Esc 后回到打开前的 activeElement（合成点击环境下为 BODY，行为正确）
- 过程中修一处 lint 拦截（swipe 改尾部速度后 event 参数未用）

### 遗留（下轮候选）
- **二级主题 chips 直达（第 7 轮首选）**：节点列顶部单行横滚 chips（安静款描边 pill，不要黑底与一级 tab 争层级）+ 列内锚点 scrollTo + 列内 scroll 感应高亮（UX 建议 chips 不 sticky，UI 建议 sticky——选题时倾向 UI 的 sticky 方案因「构图逻辑」列 15.5 屏深，需实测权衡）
- 详情页主题 chip 链到 `?cat=<所属分类>`（一行）
- tablist 方向键漫游（WAI-APG，危害小）
- 时间轴 scrollLeft 精确恢复 / 条目缩略图移动端放大（审查建议关闭，归档）

---

## 第 7 轮（2026-09-03）—— 二级主题 chips 直达 + focus trap 漏洞修复

### 审查清单摘要（4 个 SubAgent，收紧轮：验证第 6 轮 + chips 设计输入）

**第 6 轮回归验证**：portal（截图级通过）、inert（Tab 序 50+ → 4-5 站）、swipe 残留、初始聚焦、焦点还源全部通过。

**P1（3/4 命中，第 6 轮引入的回归）**
- focus trap 未过滤 `sm:hidden` 隐藏按钮：桌面端 Tab 死停在「下一张」（first 锚点是隐藏按钮，focus 静默落空）、Shift+Tab 泄漏出 dialog——「查看详情」对键盘用户永远不可达。第 6 轮只验证了正向路径

**P2**
- 撕角 Enter 打开后焦点滞留在已隐藏手柄上，首个 Tab 落在「拉回来」（再 Enter 又关掉了）

**chips 设计输入（三维度收敛）**
- sticky 之争由动效维度的第三方案终结：**chips 放 `LifelineNode` 头部插槽**（label 与滚动列之间），常驻可见、零 sticky 堆叠、不占滚动空间
- 锚点滚动：手写 rAF tween（`clamp(200+dist×0.1, 260, 550)`ms，ease-out cubic），不用原生 smooth（时长随距离线性膨胀）；RM 直接落位
- 高亮感应：rAF 节流 scroll + 锚点数组比较（h3 sticky 恒 intersecting，IO 不可信）；锚点随 RO 重算
- chips 条自带 deltaX 滚轮拦截（否则被 timeline wheel 放大成整轴位移）；溢出时右缘渐隐
- 样式：安静款描边 pill，active 只加深描边（不与一级 tab 黑底争层级）
- 与 tab 的 intentLock 天然正交（只动列内 scrollTop）

### 选题
**二级主题 chips 直达**（第 6 轮交接的既定选题）+ trap 漏洞先行修复。

### 方案与实现
- `timeline.tsx`：`LifelineNode` 新增 `header` 插槽（label 与列之间，常驻可见）
- `layout-gallery.tsx`：新增 `SubChipsBar`——单行横滚 chips + 点击 tween 直达（目标 `offsetTop - column.offsetTop`，clamp maxScroll）+ rAF 节流 scroll 感应高亮 + 溢出右缘渐隐 + active chip scrollIntoView + deltaX 滚轮拦截；分组 div 挂 `data-sub-slug` 作为锚点
- `lightbox.tsx`：trap 的 focusable 查询过滤 `getClientRects().length > 0`
- `corner-peel.tsx`：Enter/Space 打开后 750ms 焦点移入墙内首个按钮
- 过程中修两处 lint 拦截：useCallback 未导入；tween 用 `performance.now()` 触发 react-hooks/purity（改 rAF 时间戳）

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego-browser 实测：8 条 chips 栏（首栏 7 个主题名正确）；点击「视点、景深与空间感」→ 列 scrollTop 5656 精确落位、高亮同步、sticky h3 确认到达（截图 `/tmp/r7v-chips-scrolled.png` 四列 chips 栏与各列高亮状态正确）
- trap 修复：dialog 内可见可聚焦元素 = [查看详情, 关闭, 上一张, 下一张]（隐藏按钮已过滤）

### 遗留（下轮候选）
- tablist 方向键漫游（WAI-APG，危害小）
- `?q=&cat=` 组合链接清除搜索后 cat 语义丢失（P2，稀少）
- 归档关闭项（不再评估）：时间轴 scrollLeft 精确恢复、条目缩略图放大、tab 栏两行折行、全站强调色
- 剩余轮次（8-10）若无实质选题，按停止规则提前汇报

---

## 第 8 轮（2026-09-03）—— scrollIntoView 污染 P0 修复 + 渐隐对齐

### 审查清单摘要（4 个 SubAgent）

**P0（4/4 独立命中，第 7 轮引入的回归）**
- `SubChipsBar` 的「active chip 保持可视」effect 在 mount 时对 8 个栏各执行 `scrollIntoView({inline:'nearest'})`——它滚动**所有可滚动祖先**（`overflow:hidden` 的时间轴容器也是程序化可滚动容器），容器被拖到 scrollLeft=1560：
  - 冷启动首屏从「网页与 UI」（第 5 类）开始而非「构图逻辑」，IO 把 URL 污染成 `?cat=05-web-ui`
  - `?cat=` 分享链接双重位移（transform -1848 + scrollLeft 1560），整屏空白
  - 所有 tab 点击视觉失效（transform 值正确但叠加 scrollLeft 后目标恒在屏外）
- 实锤方式：UI 维度用 `addScriptToEvaluateOnNewDocument` 把 scrollIntoView 置 noop 后冷启动恢复正常；用户故事维度手动 scrollLeft=0 后单发一次 scrollIntoView 立即复现
- **教训（连续第三轮验证盲区埋雷：r5 键盘冲突、r6 focus trap、r7 scrollIntoView）**：新交互验收必须包含「冷启动首屏」和「带参分享链接首屏」两条路径，不能只测点击驱动的中间态

**P1**
- 移动端 EDGE_FADE=40 > 轨道 px-6=24：第一节点左缘 16px 被渐隐吃掉，「350 种」「布局参考」首字缺半（桌面 padding 40 恰好对齐所以没暴露）

**P2**
- chips tween 途中高亮翻牌（点击瞬间「亮→灭→再亮」）；tablist 语义与锚点行为不符（无 tabpanel/aria-controls，应为 nav + aria-current）；列底残行读作杂点（记录不修）

### 选题
**P0 修复 + 冷启动回归验收**（4/4 无悬念），顺手带渐隐对齐与两个 P2。

### 方案与实现
- `layout-gallery.tsx`：active chip 滚动收敛为只动 chips 条自身——手动算 `chipLeft = chip.offsetLeft - bar.offsetLeft` 与 bar 视口比较后赋 `bar.scrollLeft`，零祖先副作用；tween 加点击意图锁（期间 scroll 感应不抢高亮，终点一致后自然同步）；一级 tab 与 chips 的 role=tablist/tab 改 `nav` + `aria-current`
- `timeline.tsx`：渐隐宽度改 `min(EDGE_FADE, track paddingLeft)`（RO 中实测 padding，移动端 24 不再切字）

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- **冷启动回归（本轮核心验收）**：无参首屏 scrollLeft 从 1560 → 40（残留 40px 稳定常量，来源未查明但无症状）、node0 可见、active tab=构图逻辑、URL 无污染（`/tmp/r8v-cold.png`）；`?cat=07` 分享链接 node6 可见、active=中国传统构图
- tab 点击「影视画面」：transform -1848 + node5 可见（left=184）、高亮正确——P0 三症状全消
- 停止规则评估：本轮有实质 P0，「连续无实质改进」计数清零

### 遗留（下轮候选）
- scrollLeft=40 残留常量排查（无症状，低优先）
- 列底残行视觉杂点（记录不修）
- 归档关闭项不再评估（scrollLeft 精确恢复、缩略图放大、tab 折行、强调色）
- 剩 2 轮（9-10），无实质选题则按停止规则提前汇报

---

## 第 9 轮（2026-09-03）—— 移动端 snap 吃字 P1 + 清除搜索落点 P1 + 五个 P2

### 审查清单摘要（4 个 SubAgent）

**P1（2 条，UX + 用户故事维度各命中 1 条）**
- 移动端 375px 冷启动：`snap-x snap-mandatory` 把容器吸附到 scrollLeft=24（越过 track px-6 padding），第 8 轮按「scrollLeft=0 只 fade padding 区」校准的左缘渐隐正好压住实际内容——「350 种」读作「50 种」、「演示文稿」读作「示文稿」，内页首列同样被吃。第 8 轮只验证了桌面路径，移动端 snap 位移使校准前提失效（截图 `/tmp/r9-m-home2.png`）
- 清除搜索后三方不一致：点 tab（滚到 node6）→ 搜索 → 清空，时间轴重挂载在 scrollLeft≈0，但 active tab 与 URL `?cat=` 仍是旧分类，intentLock 持有期间 IO 不自我纠正，不一致持续到手动滚动。第 4 轮「返回旅程不丢状态」在这条路径上漏了位置恢复（`/tmp/r9-after-clear.png`）

**P2（5 条采纳）**
- RM + 原生滚动模式下 tab 点击仍走 ~700ms 平滑滚动（native 分支漏判 reduced-motion，自定义分支早有）
- 退出搜索时 8 节点重播 ~1.5s 入场级联（条件渲染卸载/重挂载所致，高频往返拖节奏）
- 详情页面包屑「布局参考」href 无参，回到列表状态全丢（浏览器返回键却能完整恢复，两条回路行为不一致）
- 详情页一级分类 chip 视觉与全站可点 chip 同构但不可点，断了一条导航回路（第 6 轮遗留候选）
- 灵感墙 hint 触屏仍承诺「悬停暂停」（第 2 轮双文案方案的漏网点）

**未采纳**：corner-peel 单击无反馈（审查结论：affordance 是拖拽，可辩护设计，不修）；UI/动效维度无 P0/P1。

**附带线索**：已知遗留「scrollLeft=40 残留常量」移动端实测残留 24，恒等于轨道左 padding——疑似某处以 `inline:'start'` 语义对齐首节点，下轮排查的强线索。

### 选题
两个 P1 都修（移动端首屏文字被吃是真机级缺陷；落点不一致是诚实性问题），带五个低成本 P2。

### 方案与实现
- `timeline.tsx`：native 容器加 `scroll-pl-6 sm:scroll-pl-10`（scroll-padding 对齐 track padding，snap 归位到 padding 之后）；scrollToNode native 分支按 `matchMedia('(prefers-reduced-motion: reduce)')` 选 auto/smooth
- `layout-gallery.tsx`：pendingNode effect 加兜底——`!searching` 且 pendingNode 为空且 activeCategory 索引>0 时 scrollToNode 回去（用 activeCategoryRef 镜像避免依赖触发反复滚动）；`timelineReentry` state（进入过搜索态才置位，不能首挂载置位——`animation:none` 会掐断首屏入场）+ 容器加 `lifeline-no-entry`
- `globals.css`：`.lifeline-no-entry .lifeline-rail, .lifeline-no-entry .lifeline-node { animation: none }`
- `[id]/page.tsx`：抽 `categoryHref = /products/layout-compositions?cat=<slug>` 常量，面包屑与一级分类 chip（span→Link）共用；二级主题 chip 维持 span
- `inspiration-wall.tsx`：复用 home-view 的 `[@media(hover:hover)]` 双 span 模式，触屏文案去掉「悬停暂停、」

### 验证
- typecheck / lint / build（354 页 SSG）全部通过
- ego 9 项走查全过（站点已切 portless，走查地址 **https://personal-design.localhost**）：移动端首屏 scrollLeft=0、文字完整（A/B）；tab→搜索→清空滚回 node6、高亮一致（C）；RM 下 native 滚动瞬时落位（D，0 个 scroll 事件 vs 对照 29 个）；退出搜索无级联、首屏级联保留（E）；面包屑带参返回落点正确（F）；chip DOM 语义（G）；触屏 hint 无「悬停暂停」（H）；桌面冷启动与 `?q=&cat=` 带参回归（I）
- 环境变更：用户中途把 dev 切到 portless（`pnpm dev` → https://personal-design.localhost，绕过用 `pnpm dev:direct`）；AGENTS.md 已同步该约定
- 停止规则评估：本轮有实质 P1×2，计数清零

### 遗留（下轮候选，第 10 轮为最后一轮）
- scrollLeft=padding 残留常量排查（线索已收窄：恒等于轨道左 padding，疑似 `inline:'start'` 对齐副作用，无症状）
- ego 工具侧坑记录：`fillInput('')` 不清受控 input（用真实键盘 Backspace）、窄视口 click helper 失灵（用 el.click()）、`setEmulatedMedia`/touch 模拟跨导航不持久
- 归档关闭项不再评估（scrollLeft 精确恢复、缩略图放大、tab 折行、强调色、corner-peel 单击）
- 第 10 轮跑完后按用户上限汇报收工

---

## 第 10 轮（2026-09-03，最终轮）—— 对比度/tab 渐隐/404 三个 P2 收官

### 审查清单摘要（4 个 SubAgent）

- **UX 维度：无实质发现**（合法停止信号）。验证矩阵全绿：冷启动双路径、r9 全部修复回归保持、交互链路（tab/搜索/灯箱/详情翻页/撕角/hover 预览）无断点。附带结论：遗留项「`?q=&cat=` 清除搜索丢 cat」两条路径实测 cat 均保留且落点正确，疑似已被 r9 兜底顺带消解，从遗留清单移除。
- **动效维度：无实质发现**（合法停止信号）。r9 回归全保持；节奏/缓动/惯性/反馈/RM 合规全链路无新发现；RM 下 hover 即时反馈保留属 WCAG 2.3.3 允许范围，不报。
- **UI 维度：2 个 P2**——① 浅底上 neutral-400（#a3a3a3，~2.4:1）用于非装饰文本：CC 署名（合规文本）、面包屑（导航）、搜索空态（主反馈）；② 一级 tab 栏移动端横滚无溢出渐隐，第三个 tab 被硬切半个字，与同页 chips 栏两套表现。
- **用户故事维度：1 个 P2**——全中文站缺 not-found.tsx，坏 URL 落到 Next.js 默认英文 404，零导航零品牌，唯一出路是浏览器返回键。

### 选题
UX/动效已收敛；采纳 UI 2 条 + 用户故事 1 条（均为单 token/模式复用/15 行级改动），作为收官修复。

### 方案与实现
- `attribution.tsx` / `[id]/page.tsx` 面包屑 / `layout-gallery.tsx` 空态：text-neutral-400 → 500（#737373，~4.3:1 接近 AA）；条目编号、placeholder、图标等纯辅助维持 400
- `layout-gallery.tsx`：tab 栏复用 SubChipsBar 口径（ResizeObserver + scrollWidth>clientWidth+1）加右缘 32px mask 渐隐 + pr-4；lg:flex-wrap 折行后无横向溢出，mask 自然禁用，无需断点判断
- 新增 `app/not-found.tsx`（22 行 server 组件）：中文「页面不存在或已移动」+ 回首页/去布局参考两个链接，沿用详情页字号阶梯与站内按钮样式

### 验证
- typecheck / lint / build 全过（354 页 SSG + 新增 `/_not-found`）
- ego 走查 4 项全过：404 桌面/移动中文文案+双链接可跳（A）；tab mask 移动有/桌面无（B，scrollWidth 实测佐证）；三处 computed color #737373（C，canvas 像素换算）；冷启动与带参回归（D，本次连 scrollLeft=40 残留都未出现）

### 收官状态
- 用户设定的 10 轮上限已到；UX/动效两维度本轮明确「无实质发现」，站点进入收敛状态
- 遗留归档（均无症状，不再跟踪）：scrollLeft=padding 残留常量、列底残行杂点、tablist 方向键漫游（P2）
- 归档关闭项（不再评估）：scrollLeft 精确恢复、缩略图放大、tab 折行、全站强调色、corner-peel 单击
