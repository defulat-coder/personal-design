# G1 共享基础

状态：实现与生产浏览器验收通过。

## 来源与适配

- tokens：以 source/apps/web/src/styles/tokens.css 的应用/面板/正文/边框值为准。工作区已由上一轮 #f6f6f6/#121212 改成 #fff/#202020；面板 #fafafa/#353535。
- 小字不用源 --text-soft #848484（白底不足4.5:1），ink-faint 与 ink-soft 使用 #5c5c5c/#bdbdbd；可读性优先于低对比度装饰色。
- Albert Sans 已有本地 OFL 文件；不复制许可未核实的 JiduMono。系统等宽保留数据用途。
- Button 复刻默认4px/36px/14px500、主按钮胶囊、图标按钮；coarse pointer 增至44px。2px焦点环是保留的增强规则。
- 通用过渡按迁入规则200ms进入/140ms退出；Button保留源50ms颜色/100ms位移。
- WorkspaceShell、PageHeading 样式已从全局搬到模块；导航原生链接，跳至内容仍可用；移动导航自然文档流避免固定高度遮挡。

## 状态清单

| 功能 | 适用状态/操作 | 实现位置 | 验证 |
| --- | --- | --- | --- |
| Button/链接视觉 | 默认/hover/focus/active/disabled/coarse/RM/forced-colors | button.tsx/module.css | ESLint、三尺寸截图及键盘行为通过 |
| 首帧主题 | 无偏好/有效偏好/无效偏好/存储不可用 | app/layout.tsx | 生产 Chromium 通过 |
| 主题切换 | 明暗/刷新记忆/系统偏好变化/跨标签storage变化 | theme-toggle.tsx | 生产 Chromium 通过 |
| 桌面导航 | 页面/详情归属、hover/focus、跳至内容 | workspace-shell.tsx/module.css | 生产 Chromium 通过 |
| 手机导航 | 自然流/44px操作、320px边界 | workspace-shell.module.css | 生产 Chromium 通过 |
| 标题 | 中文tracking0/1.35行高、描述14px/1.75、长内容换行 | page-heading.tsx/module.css | 生产 Chromium 通过 |

同步导航与控件没有独立 loading/error：由实际导航目标/数据表面负责，不人为闪出加载态。

## 集成证据

`evidence/foundation.json`：17 项实际断言，包括系统主题动态变化、手动持久化、跨标签同步、无效值、存储不可用、跳转焦点，以及320px/720px六种路由的重排。720px用于1440px页面200%缩放的等效CSS布局宽度；未将它表述为真实桌面浏览器缩放测试。

补充修复：主题effect注册后即时同步，避免首次hydration前系统主题变化丢失；首页与404补主内容landmark。搜索placeholder使用可读辅助文字色且不透明，边框采用control-border。
