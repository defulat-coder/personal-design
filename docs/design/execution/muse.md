# G3 灵感集实施与验证

状态：列表、详情、轮播与恢复路径已实现，针对性浏览器行为检查和文件检查通过；全站截图、构建与集成复核由主任务登记。

## 范围与实现

- `app/products/muse/page.tsx`：保留既有 PageHeading、搜索 keywords 和简洁 metadata。通过包 API 读取 155 条；没有封面或尺寸的条目保留详情入口，尺寸以展示比例 4:3 退化，不改数据。分类数量按实际展示条目计算；空库日期安全处理。
- `components/plate-wall.tsx` 与相邻 CSS Module：共享 CategoryTabs、按钮、灯箱、视频可视区 hook；两至四列媒体墙（320px 边界一列）。标题完整换行；作者采用正文，日期采用辅助文字。搜索直接从 URL 读取，浏览器恢复不会被旧 React state 覆盖。分类与搜索组合、清除入口、结果计数、自动追加和显式「加载更多」均可操作。
- 返回现场：从列表打开媒体或详情前保存列表 URL、已展示数量和滚动位置；`return-link.tsx` 使用校验过的本站列表地址恢复。直接进入详情时回到该条目的分类。sessionStorage 不可用时仍使用普通链接。
- `[slug]/page.tsx` 与相邻 CSS Module：桌面媒体 / 信息面板两栏，1199px 以下自然堆叠。取消线路带及旧全局 muse-detail/gallery-plate/detail-in 依赖。长标题、描述、标签、原始 JSON 均有明确换行/滚动范围。元数据、作者、分类、来源和完整原始 JSON 保留；JSON 改为面板内展开，不被窄侧栏裁切。
- `inspora-media-carousel.tsx` 与相邻 CSS Module：单/多媒体原生 snap；上一张/下一张、Home/End 和方向键；计数与边界禁用；旋转/调整宽度保持当前项。视频保留原生播放、声音、进度与全屏控制，离开当前项暂停。详情使用主动播放，避免自动播放 hook 抢占用户暂停；列表仍保留静音自动预览。路由切换按 slug 重建轮播以重置索引。
- 媒体加载最长 15 秒后给出重试和打开原媒体；原媒体入口始终在工具栏可用。列表媒体加载失败/超过可视区等待时间时显示说明，仍可打开详情或灯箱。缺媒体详情仍可阅读来源。
- `error.tsx`：真实路由错误恢复入口，重试保留当前 URL 分类/关键词；不展示内部错误内容。

## 规范追溯与适配

依据 `open-design/rules.md` 对应 source `tokens.css`、`button.module.css`、`typography.md`、`accessibility-baseline.md`、`state-coverage.md`。使用主任务统一的中性语义 token；普通控件 4px、卡片 12px、面板 16px、媒体内层 8px，主操作使用共享胶囊 Button。标题 26px / 1.35、正文 14px / 1.75，中文零字距，数据 12px。卡片 hover 只反馈边界；按钮状态复用共享实现。轮播原生滚动在 reduced-motion 下即时移动，不引入动画库或无用途的进入动画。1199px 堆叠是为侧栏外壳下的实际内容宽度保留可读媒体/长描述而做的响应式适配。

## 状态覆盖

| 表面 | loading | empty | error | populated / edge |
| --- | --- | --- | --- | --- |
| 列表数据 | Suspense 有文字状态 | 无库内容与无匹配分别说明 | 路由错误恢复 | 155 条；缺媒体/尺寸保留入口 |
| 搜索/分类 | 本地同步过滤，无网络 loading | 保留查询并可清除 | 非法分类标准化为全部 | 分类+查询、URL 刷新、长关键词 |
| 分批 | 同步追加，无虚构 spinner | 到末尾明确总数 | 显式按钮不依赖 IO | 自动追加与按钮追加 |
| 列表媒体 | 原比例占位、可视区 15 秒上限 | 缺媒体说明 | 失败说明且入口保留 | 图片灯箱、视频详情、视频播停交给共享 hook |
| 详情媒体 | 可见文字、15 秒上限 | 媒体缺失仍有信息 | 重试 + 原媒体链接 | 单图、多图、视频、首尾、局部键盘、调整宽度 |
| 信息/来源 | 同步服务端数据，不造 loading | 缺作者/来源/分类/JSON 各自退化 | 媒体失败不影响出处 | 长标题/描述、JSON 展开、完整原值、外链 |
| 导航 | Next 路由行为 | 首末禁用 | 返回普通链接作为 storage 退化 | 列表现场、相邻条目、键盘与 raw JSON 不冲突 |

## 实际验证证据（2026-09-05）

通过 Playwright Chromium 对 `http://localhost:3000` 执行两批断言（`goto` 使用 domcontentloaded，等待开发环境 hydration 后操作）：

1. 搜索无结果，URL `q` 正确，刷新仍保留输入；清除恢复内容；`dashboard` 筛选进入 `file-management-dashboard`，返回列表恢复相同查询。
2. `product-comps`：Home/End 轮播到首末、对应按钮 disabled；原始 JSON 实际展开且文本非空，焦点在 pre 时 ArrowRight 不跳详情；Escape 后焦点回到 summary。
3. `portfolio-page` 视频 DOM 的 `controls` 为 true、首条前导航禁用；`404-page` 尾条后导航禁用。
4. 最长标题条目 `1-23` 在宽 1440、1024、390、320px 的文档宽度均未超过 viewport；该批页面 `pageerror` 数量为 0。
5. 390×844、dark + reduced-motion：非法分类 URL 回退显示结果；Product 分类保留 `dashboard` 查询；清除与显式加载更多增加可见数量；180 字符关键词不产生整页横向溢出。
6. 拦截单图原媒体请求不返回：15 秒后实际出现「媒体暂时无法加载」、重试及原媒体入口；解除拦截并点击重试成功触发恢复流程。
7. `pnpm --filter @personal-design/web typecheck` 最终通过。
8. `pnpm --filter @personal-design/web exec eslint components/plate-wall.tsx components/inspora-media-carousel.tsx app/products/muse/page.tsx 'app/products/muse/[slug]/page.tsx' app/products/muse/return-link.tsx app/products/muse/error.tsx` 通过。

数据变体由包 API 只读确认：155 条；单图 `file-management-dashboard`、视频/第一件 `portfolio-page`、多媒体 `product-comps`、最长标题 `1-23`、最后一件 `404-page`。当前数据没有缺作者/出处/媒体的样本，对这些退化仅完成代码路径检查；未修改生成数据来制造样本。浏览器验证确认原生视频控件与超时恢复，不把外部服务器媒体的实时可达性写成保证。路由 error 边界为实现/类型检查，未刻意破坏服务端数据诱发。代表性视觉截图与完整构建由主任务集成批次负责。

## 可重复执行脚本

上述两批通过的浏览器断言已原样保留（仅整理格式、加入浏览器退出清理及可配置 base URL）：

```sh
node scripts/design-checks/muse-behavior.mjs
node scripts/design-checks/muse-recovery.mjs
```

默认访问 `http://localhost:3000`；可用 `DESIGN_BASE_URL` 指定已启动的预览服务器。脚本从项目依赖导入 Playwright，recovery 脚本通过包 API 读取当前媒体地址，需使用项目要求的 Node 版本。两批最初均由 `node --input-type=module` heredoc 直接运行，没有依赖 `/tmp` 测试脚本；先前 `/tmp/muse-response.html` 仅用于检查开发服务器 HTTP 响应，不是验收输入。

保存后重新运行两份脚本均 exit 0；behavior 再次报告四组 PASS、`pageerrors []`，recovery 再次报告两组 PASS。未更改 UI。
