# 全站实施契约

- 依据：`docs/design/open-design/rules.md` 及 source，用户指定规范优先；code-led，沿用已确定工作台拓扑，按规则重做各表面而非重新征选风格。
- 主任务拥有 globals.css、layout、WorkspaceShell、PageHeading、ThemeToggle、Button、文档、测试集成。页面任务自己拥有相邻 CSS Modules，禁止改全局文件。
- 全局 tokens 将对齐源值：workspace/paper 白 #fff、深 #202020；plate #fafafa / #353535；body #494949 / #ededed；ink #202020 / #fafafa；ink-soft #5c5c5c / #bdbdbd；ink-faint 采用同 ink-soft 保证小字可读；hairline #ededed / #494949；hairline-strong #dbdbdb / #5c5c5c；subtle #ededed / #494949；border-hover #bdbdbd / #848484；accent #353535 / #ededed。线路色保留本产品功能归属。
- 圆角变量：--radius-control=4px、--radius-card=12px、--radius-panel=16px、--radius-pill=999px；Tailwind 默认 rounded-xs/sm/md/lg/xl/2xl 将明确映射 2/4/8/8/12/16px，禁止 6px 漂移。
- 字体 Albert Sans + 中文回退；中文标题 tracking 0、leading 1.35，正文 14px/1.75。语义数据可 mono 12px；标题 30/26/20/16，辅助文字 12/13，适配不无限缩小文字。
- --ease-out=cubic-bezier(.23,1,.32,1)，--dur-enter=200ms、--dur-exit=140ms、--dur-fast=150ms、--dur-base=200ms；原 Button 反馈 50/100ms；签名轨道/灯箱有明确理由的机制可保持更长时长并登记，禁 scale(0)，reduced-motion 完整保留操作。
- 已可用 `@/components/button`：Button 原生 button props + variant='default'|'primary'|'ghost'|'subtle'、icon?:boolean；导出 buttonClassName({variant,icon,className}) 给 Next Link 或 a，主按钮胶囊、普通4px、键盘2px焦点、触摸44px。不要把链接包在按钮里。
- PageHeading 现有接口保持：title/description/meta?/children?。所有者会将 CSS 移入 module、中文排印对齐。
- CategoryTabs/useCatParam、LightboxProvider/useLightbox、RawJsonDetails、useAutoplayVideo 的现有接口保持兼容；共享任务可扩展可选 props，新增必须项先协调。
- 全局 shell 内容区高度变量 --workspace-height：桌面 calc(100dvh - 24px)，手机 calc(100dvh - 112px)。页面使用此变量；避免 viewport高度独立叠加导航；移动端内容自然滚动。
- 全局已有 legacy .lifeline-*/.detail-in 等暂保留至页面任务迁走；页面/媒体所有者必须把自己的效果及 .timeline-caption/.gallery-plate/.muse-detail/.layout-detail 等选择器纳入局部 CSS，不依赖旧全局覆盖。完成后通知主任务删去 legacy 块。
- 每个所有者在 docs/design/execution/<task>.md 写清清单、状态覆盖、源规则/适配、实现和验证证据。只标记自己实际验证的项；全站截图由主任务按批采集，不各自无限视觉循环。
- 不提交、不推送、不部署；不编辑内容数据包生成物。独立功能回归可以加测试，页面样式用真实浏览器验证。
