# UI 优化 10 轮迭代日志

目标：使用 impeccable 技能，从全项目维度审视 apps/web 的 UI，完成 10 轮优化迭代。
边界：只改 apps/web 展示层；不动数据与同步脚本；不做 git 提交。
每轮验证：typecheck + eslint + build + dev server 截图/行为评审（子智能体）。

---

## 第 1 轮：键盘与焦点 a11y 功能性修复

**评审方式**：3 个 explore 子智能体并行（设计系统一致性 / a11y+响应式 / 动效性能+代码质量），共产出 30+ 条发现。

**本轮选取**（三份报告中的真实功能 bug，均为键盘/焦点路径）：

1. **灯箱翻图后焦点归还失效**（`lightbox.tsx`）：`previousFocusRef` 在 `[active]` effect 里无条件捕获，`go()` 翻图重跑 effect，把触发元素覆盖成灯箱内焦点，关闭后焦点掉到 body。修法：新增 `wasOpenRef`，只在「关闭 → 打开」跃迁时捕获一次。
2. **灯箱内 focus 环浅色主题不可见**（`globals.css` + `lightbox.tsx`）：全站 focus 环是近黑 ink，叠在灯箱近黑暗房遮罩上看不见。修法：dialog 加 `lightbox-surface` 类，globals.css 覆写其内 `outline-color: #edf1f6`（暗房字面量，符合 DESIGN.md 例外表面条款）。
3. **原生滚动模式下方向键双位移瞬移**（`timeline.tsx`）：`onKeyDown` 无 `nativeScroll` 守卫，`nudge` 写 transform 而浏览器同时走 scrollLeft，且 target/current 基准是旧值。修法：原生模式改用 `scrollBy/scrollTo`（reduced-motion 时 `behavior: 'auto'`）。
4. **详情页全局 ←/→ 劫持 + 轮播键盘不可达**（`detail-tools.tsx` + `inspora-media-carousel.tsx`）：window 级 keydown 不看 event.target；轮播轨道不可聚焦。修法：keydown 跳过输入控件与 `[data-detail-keys-ignore]` 区域并尊重 `defaultPrevented`；轮播轨道加 `tabIndex={0}` + `role="group"` + aria-label + `data-detail-keys-ignore`。

**验证**：
- `pnpm --filter @personal-design/web typecheck` ✅
- eslint（4 个改动文件）✅ 0 error
- `pnpm build` ✅（510 页静态生成成功）
- 行为+截图评审（coder 子智能体 + Playwright，7 张截图全部目视检查）✅ 六项全过：
  首页明暗截图无回归；灯箱翻图×2 → Esc 后焦点精确回到触发按钮；灯箱关闭钮焦点环实测 `2px solid #edf1f6`；窄屏 nativeScroll 方向键 scrollLeft 0→320 且 track transform 保持 none；详情轮播 Tab 聚焦后方向键翻页不跳路由；body 聚焦时 ←/→ 详情翻页正常。
- 评审附带观察（记入待办，非本轮引入）：详情页客户端导航后的极短过渡窗口内，新页 `DetailKeyboardNav` 的 keydown 尚未注册，落入的按键会丢；根除需把监听挂到 layout 层常驻组件。

---

## 第 2 轮：自动移动内容（WCAG 2.2.2）+ landmark

**评审方式**：1 个 explore 子智能体做 WCAG 2.2.2 专项复审（确认第 1 轮报告相关项 + 补充新角度），确认全部修法并补充 2 处（轮播首帧视频无暂停机制；RM 降级后 marquee 手动横滑会滑出副本）。

**本轮改动**：

1. **marquee 副本净化**（`layout-wall.tsx`）：无缝循环的副本按钮加 `aria-hidden` + `tabIndex={-1}` + `data-dupe` 标记——Tab 序不再翻倍（实测每行 171 张全部可达、0 副本进焦点）、读屏不再重复朗读；行容器加 `role="group"` + `aria-label`（上行/下行）补回分组语义。
2. **焦点进入暂停 marquee**（`globals.css`）：`.lifeline-marquee:focus-within { animation-play-state: paused }`，与 hover 暂停并列。
3. **RM 下隐藏副本**（`globals.css`）：reduced-motion 手动横滑模式下 `[data-dupe]` 不渲染，避免滑出重复卡片。
4. **视频自动播放统一 IO 化**（新 hook `lib/use-autoplay-video.ts` + `plate-wall.tsx` + `inspora-media-carousel.tsx`）：删掉 `autoPlay` 属性（挂载即拉流、IO 回调前离屏视频白解码），进视口播/出视口停；reduced-motion 用户不自动播只显 poster；轮播视频不再「只有首帧会播」。
5. **首页补 `<main>` landmark**（`app/page.tsx`）。

**验证**：
- typecheck ✅ / eslint（5 文件）✅ / build ✅
- 行为+截图评审（coder 子智能体，7 张截图目视）✅ 七项全过：灵感墙明暗截图无回归；Tab 序实测 171/171；focus-within 暂停实测 paused→running；RM 下副本 display:none + 行可横滑；muse 列表 21 个 video 无 autoplay 属性且 IO 播停正确、RM 下保持 paused；详情轮播视频 IO 路径验证（移出视口暂停、移回恢复）；首页 main 唯一 landmark。
- 评审说明：DB 中含视频的详情都是单帧，「翻走暂停」用运行时 transform 模拟同一 IO 路径验证；将来出现多帧视频帖子可补真实翻页验证。

---

## 第 3 轮：性能（URL 同步 / 客户端边界 / 死代码）

**评审方式**：1 个 explore 子智能体对三个候选项做实施前风险核实（全部「可以安全实施」，附关键证据：Next 16.3.3 源码确认 history.replaceState 会同步 useSearchParams；home-view 无 hook/函数 props；scrollToNode 全仓零消费方）。

**本轮改动**：

1. **搜索 URL 同步去导航化**（`plate-wall.tsx`）：每击键一次的 `router.replace`（完整 ACTION_NAVIGATE 流程、路由状态树重建）改为 `window.history.replaceState`（ACTION_RESTORE，useSearchParams 照常同步，原生不滚动天然等价 `scroll: false`）。
2. **首页 RSC 化**（`home-view.tsx`）：去掉整文件 `'use client'`——该文件无任何 hook/浏览器 API，改为 server component 后首页刊头/关于节点/产品卡片全部 RSC 直出，客户端 JS 只剩 timeline 交互壳。`upstream` 保持子路径引法（两种情况都合规）。
3. **删除死代码**（`timeline.tsx`）：`LifelineTimelineApi` + `forwardRef` + `useImperativeHandle(scrollToNode)` 全仓零消费方，约 35 行含双分支逻辑的死代码删除，组件改回普通函数（`data-node-index` 属性保留，`onFocusCapture` 仍在用）。

**验证**：
- typecheck ✅ / eslint ✅ / build ✅
- 行为+截图评审（coder 子智能体，10 张截图目视）✅：replaceState 路径实测（`?q=portfolio&cat=全部` 原地归一化、useSearchParams 同步、tab 点击 q 保留、刷新恢复）；首页明暗截图 + 文本确认 RSC 直出 + 滚轮/拖拽/列车点正常；时间轴方向键/Home/End/列滚动/移动端横滑全正常；灵感墙与详情页抽查无回归。

**重要发现（转入第 4 轮处理）**：muse 页从未给 `PlateWall` 传 `searchPlaceholder`——搜索框根本没接线，plate-wall 里整块搜索 UI 是死代码。DESIGN.md 有完整的 Inputs/Fields 规范（直角、hairline 描边、左侧搜索图标淡墨），说明搜索是设计内的功能，第 4 轮将其接线并补 a11y。

---

## 第 4 轮：搜索框接线 + 设计一致性收敛

**评审方式**：1 个 explore 子智能体对五项候选做核实（行号校准、方案论证、DESIGN.md 条文起草）。

**本轮改动**：

1. **搜索框接线**（`muse/page.tsx` + `plate-wall.tsx`）：`PlateWall` 传入 `searchPlaceholder="搜索灵感"`，搜索功能上线；items 补 `keywords`（category + industries + styles）扩命中面（实测行业词「Fintech」命中标题不含该词的条目）；input 补 `aria-label`。
2. **mono 叙述文字清理**（`home-view.tsx`）：「附注」改系统栈小字 + 拉开字距、「下一线路 · 规划中」去 font-mono（The Mono Carries Data Rule）；`?` 符号保留 mono（是符号不是叙述）。
3. **动效时长登记**（`DESIGN.md` + `lightbox.tsx`）：新增「The Signature Timing Register」条文，把 rail 0.9s / 节点级联 0.6s / detail-in 0.5s / 灯箱 FLIP 450ms / marquee 75s·95s 登记为签名机制编排例外（文档先行，450ms 有 Material/iOS 大表面过渡体感依据）；swipe 回弹 200ms 收进 150ms 档。
4. **数值收敛**：scale 全部归带（layout-wall 卡片 hover 1.03→1.02、active 0.95→0.97；详情推荐卡 1.03→1.02；灯箱五处控件 0.95→0.97）；第七档字级 14px 归档（图版署名链接→body 12.5px medium；「同主题」h2→font-display Title 档 15px）；灵感墙刊头数据行补「·」分隔。

**验证**：
- typecheck ✅ / eslint ✅ / build ✅
- 行为+截图评审（coder 子智能体，17 张截图目视）✅ 19/19 全绿：搜索全链路 8 项（渲染落位、逐字过滤、keywords 命中、清空恢复、切分类保留、刷新恢复、无 pageerror、移动端 390 落位）；视觉回归 8 项（署名 12.5px 实测、mono 清理后字体实测、刊头「·」、hover/active scale 计算样式实测 1.02/0.97、「同主题」Barlow 15px 实测）；灯箱 3 项。
- 评审澄清的测量陷阱（非产品 bug）：Tailwind v4 的 scale-* 走原生 CSS `scale` 属性而非 transform。

---

## 第 5 轮：timeline 健壮性 + 翻页监听常驻

**评审方式**：1 个 explore 子智能体对三个候选项做风险核实。重要纠偏：第 1 轮报告里的「timeline reduced-motion 一次性快照」是**误报**——`reduced` 是 MediaQueryList 活体、`.matches` 每帧求值，会话中切换系统设置下一帧即生效，无需 change 监听（撤项，仅改名 `reducedMq` 防误读）。

**本轮改动**：

1. **帧内布局读缓存化**（`timeline.tsx` 整体重构）：`scrollWidth`/`clientWidth` 由 ResizeObserver 在 paint 前刷新进 `maxOffsetRef`/`clientWidthRef`，tick（rAF 每帧）/wheel/drag/惯性/End 键/原生 onScroll 全部改读缓存，消除帧内强制同步 layout 风险；window resize 监听删除，位移收敛职责并入 RO 回调（RO 在 layout 后 paint 前投递，收敛无空窗）；声明顺序相应重排（schedule 提前）。
2. **翻页键盘监听常驻化**（`detail-tools.tsx`）：`DetailKeyboardNav` 不再自挂 keydown——page 用 `useLayoutEffect` 把 prev/next 写进 `<html>` dataset（paint 前就绪、卸载清理），模块级单例监听读 dataset 导航（window 标记防 HMR 重复注册）。详情→详情导航的提交边界内监听不卸，消除过渡窗口丢键；三个既有守卫（lightboxOpen / defaultPrevented / data-detail-keys-ignore）全部兼容。

**验证**：
- typecheck ✅ / eslint ✅ / build ✅
- 行为+截图评审（coder 子智能体）✅ 24/24 全绿：时间轴六项全功能（滚轮/拖拽惯性实测 +360px/点击吞没/方向键/列滚动优先）；连续 resize 位移收敛无越界无露白；移动端真实触摸手势 + 方向键；layout 详情 90ms 连按 5×→ 落 006 无丢键、dataset 逐页正确；守卫回归三项；muse 详情翻页。

**转入第 6 轮**：评审发现节点列 `overscroll-contain` 会吸收落在内容区的横向滑动手势（移动端大面积「划不动」），且该类自 8e1aeec 就存在（非本轮引入）——拟改 `overscroll-behavior-y: contain` 只锁垂直向。

---

## 第 6 轮：详情页 UX（横向手势 / 图片加载 / JSON 浮层）

**评审方式**：1 个 explore 子智能体做候选项风险核实（三项全部「可以实施」，并附带发现 pre 缺 `data-detail-keys-ignore` 的注释不一致）。

**本轮改动**：

1. **时间轴列横向手势链**（`timeline.tsx`）：列 `overscroll-contain` → `overscroll-y-contain` + `overflow-x-clip`。评审实测发现只改 overscroll 不够——列因 `overflow-y:auto` 另一轴计算为 auto，存在 4px 横向滚动量，scroll latching 会吞掉首次横滑；补 `overflow-x-clip` 后首次横滑即链到时间轴（0→320→640→848 连续生效），垂直锁列不受影响。
2. **轮播图片加载分级**（`inspora-media-carousel.tsx`）：首张 `fetchPriority="high"`（LCP），非首张 `loading="lazy" decoding="async"`（多媒体条目不一次性全拉跨站热链）。
3. **原始 JSON 浮层**（新组件 `raw-json-details.tsx` + `muse/[slug]/page.tsx`）：受控 details，补 Esc 与外部点击关闭；pre 加 `tabIndex={0}` + `data-detail-keys-ignore`（键盘可滚动、方向键不误翻页）。评审暴露既有视觉 bug：pre 左伸 49px 被侧栏滚动列整体裁掉（首行 4-5 字符不可见）——修法是把相对定位容器上移到全宽 div + pre 加 `max-w-full`，纯 CSS 无需 portal。

**验证**：
- typecheck ✅ / eslint ✅ / build ✅（补丁后补跑）
- 行为+截图评审两轮（coder 子智能体）：首轮确认 b/c 达标、a 修了一半并实证修复方向；补丁复验全绿——首次横滑即生效、列 scrollLeft 恒 0、垂直锁列正常；浮层 1440/768 两视口左不裁、首字符「{」Range 测量完整可见、Esc/外部点击关闭正常。
- 评审附注（非产品问题）：CSS Overflow 规范下 `overflow-x: clip` 在另一轴为 auto 时计算值为 `hidden`；Chrome lazy 阈值宽，相邻张仍会预拉。

---

## 第 7 轮：渲染层视觉走查（像素级）

**评审方式**：新角度——coder 子智能体对 6 路由 × 明暗 × 双视口做 25 张截图的像素级走查（不看代码只看渲染），按 DESIGN.md 条文逐张核对。发现 3 个真实视觉缺陷，其余全部面（刊头系统、字级层级、深色套、45° 站名、套准十字、灯箱、焦点环、404）无缺陷。

**本轮改动**：

1. **muse 详情信息牌色带撞主题钮**（`muse/[slug]/page.tsx`）：3px 朱红归属带 full-bleed 冲到视口右缘，fixed 右上的主题钮被红线横穿（布局详情的蓝带收在 padding 内、位置更低不撞——两详情页行为不一致）。修法：色带加 `lg:mr-16`，右端让出主题钮（复验实测右端停在右缘 −64px，与主题钮间隔 10px）。
2. **muse 列表移动端签注标题被挤没**（`plate-wall.tsx`）：figcaption 单行 flex 下作者名（@xxx）把标题挤到完全消失或单字符省略。修法：figcaption 改 `flex-wrap`，标题 `max-sm:order-last max-sm:basis-full` 移动端独占一行（复验：标题始终完整可见，桌面单行无回归）。
3. **首页移动端第二站 45° 站名初屏被裁**——本轮决定不修（横滑可解，次优先级），记录在案。

**验证**：
- typecheck ✅ / eslint ✅ / build ✅
- 复验（coder 子智能体，量测断言 + 放大截图）：两项修复全绿；侧栏其它内容与 JSON 浮层无位移；5 个上下文 0 pageerror。

---

## 第 8 轮：代码结构（CategoryTabs 抽取 + mono 口径统一）

**评审方式**：1 个 explore 子智能体核实重构方案（两处 select/tab nav 逐行同构确认；chip mono 五处位置清单；lightbox 映射判定为「重复的只有形状没有逻辑，维持现状」）。

**本轮改动**：

1. **抽取 `category-tabs.tsx`**（新文件）：`CategoryTabs` 组件（`line` 变体走字面类名映射，保证 Tailwind 扫描）+ `useCatParam()` hook（?cat= 读写）。`layout-wall.tsx` 与 `plate-wall.tsx` 删掉各自逐行相同的 select() 与 tab nav（约 45 行 × 2），容器结构（刊头内 vs 与搜索框同行）留本地——硬抽会带回一堆布局 props。顺清两个未使用的 `cn` import。
2. **mono 口径统一（纯文档）**（`DESIGN.md`）：The Mono Carries Data Rule 扩写——图签/信息牌上的枚举标签值（分类/主题/行业/风格/署名）是受控词表的「架位号」，属坐标类元数据而非叙述，纳入 mono 合法用途（Label 层级与 Do 条目同步）。这把第 1 轮审计的「chip mono 灰区」定为合规现状，避免每轮审计重复报同一点。
3. **lightbox 条目映射不抽**：三处映射重复的只有 `LightboxItem` 形状，字段来源与 siblings 语义各不相同（当前行/过滤结果/同主题），类型即抽象。

**验证**：
- typecheck ✅ / eslint ✅ / build ✅
- 重构回归评审（coder 子智能体，19 张截图 + git worktree HEAD 基线对照）：全部通过——两列表页 tab 渲染/aria-current/指示条色（蓝 rgb(26,111,180)、朱红 rgb(210,60,46) 与色带一致）/URL 同步/刷新恢复/搜索组合态/移动端换行；scroll anchoring 用基线对照证实非回归；0 pageerror、0 hydration 警告。
- 评审说明：分类计数之和 ≠ 全部计数是包 API 含无图条目的既有口径，非本轮引入。

**并发情况**：评审期间发现工作树被并行会话改动（左侧栏新设计：`app/layout.tsx`、`page-heading.tsx`、`workspace-shell.tsx`、`theme-toggle.tsx`、`public/fonts/` 等）。本目标后续轮次避开这些文件，验证以当前渲染为准。
