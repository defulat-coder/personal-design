# 从 OpenDesign 迁入的设计规则

本文件是来源依据与适配说明，不是第二份全站现行标准，也不是合规认证。本站视觉与交互以根 `DESIGN.md` 为准，产品能力与内容边界见 `PRODUCT.md`，页面流程见 `docs/design/README.md`。上游完整原文保存在 `source/`，原项目数值不自动覆盖本站已确认适配。

## 规范与实现的边界

- 原项目应用源码决定其真实控件与 token；`craft/` 提供跨品牌原则，不用示例色值替换应用实际色板。
- 下述工程、排印、状态与可访问性原则继续采用；原项目控件尺寸等具体值保留为来源快照，本站有意适配集中在末尾。发现源码与标准不一致应记录差异，不能反向修改来源事实。
- 源文档矛盾时，在此明示取舍。用户明确指定的产品约束优先；不要照搬聊天、生成器、Electron 或收费账户界面。

## 样式归属与组件复用

依据：[根 AGENTS.md](source/AGENTS.md) 的 `Web CSS ownership` 与 `Web component reuse`。

- 全局 CSS 只拥有主题 tokens、reset、基础排印、共享布局契约；组件自身样式放相邻 CSS Module。现有 Tailwind 工具类可继续使用，但不要追加大段组件专用全局选择器。
- 只有确实跨组件共享的契约才使用全局类，并标明所属功能；拆样式时保留原导入顺序、级联与优先级。
- 优先复用共享控件，而不是每页重新写主按钮、图标按钮、输入框和弹窗。同一个控件的大小、状态和焦点规则只有一个实现。
- 原项目 `@open-design/components` 是其内部包，本站未安装；本站复用 `apps/web/components/`，需要时补一个小型基础组件，不为迁规范新建无用 monorepo 包。
- 保留原生按钮、链接和表单语义；内容标签和特殊控件不为统一外观被强行包装。

## 色板、字体与几何

依据：[tokens.css](source/apps/web/src/styles/tokens.css)、[base.css](source/apps/web/src/styles/base.css)。下列数值为原项目快照，不是上一轮抽象的「浅灰工作台」印象。

| 角色 | 原项目 token / 值 | 本站对应角色 |
| --- | --- | --- |
| 应用/普通底 | `--bg-app`、`--bg`: `#fff`；深色 `#202020` | `--color-workspace`、`--color-paper`，已按明暗角色采用 |
| 次级表面 | `--bg-panel: #fafafa` | `--color-plate` |
| 正文/强文字 | `--text: #494949`、`--text-strong: #202020` | `--color-body` / `--color-ink`；辅助文字使用独立的 `ink-soft` |
| 边框/软边框 | `--border: #dbdbdb`、`--border-soft: #ededed` | `--color-hairline-strong` / `--color-hairline` |
| 普通强调 | `--accent: #353535` | 中性主控件；本站以中性控件强调操作；保留的线路色变量当前未用于页面 |
| 品牌绿 | `--brand: #87ea5c`，选中辅助 `--brand-ink: #007106` / `--brand-surface: #F2FFF2` | 原项目品牌，不自动变成本站产品归属色 |
| 正文/展示字体 | Albert Sans + PingFang SC / Microsoft YaHei | Albert Sans 已本地化；保留中文和系统回退 |
| 等宽字体 | JiduMono Pro + ui-monospace / SFMono-Regular | 本站使用系统等宽；不擅自复制未核实许可的字体 |
| 圆角 | `0 / 2 / 4 / 8 / 12 / 16px`，另有 `50%` 与 `999px` | 按角色采用全档位；不能概括为只有 8/12/16 |
| 圆角别名 | xs=2、sm=4、base/md=8、lg=12、xl=16 | 本站保留 `--radius-control: 4px` 供局部提示；共享文字操作用胶囊、图标操作用圆形；utility 按本站映射核对 |

颜色按用途命名；明暗主题覆盖同一组角色。源项目显式深色与跟随系统的深色值保持同步。本站以 `html[data-theme]` 和首帧脚本实现系统默认与用户记忆，不引入第二套冲突的主题机制。

## 按钮与材质

依据：[button.module.css](source/packages/components/src/button.module.css)、[material.css](source/apps/web/src/styles/material.css)。

- 普通按钮：36px 高，左右 16px 内边距，图标文字间距 8px，14px/500，默认圆角 `--radius-sm` 即 4px。
- 主按钮：深色实底、浅色文字、胶囊圆角。Ghost / Subtle / PrimaryGhost 有各自 hover/active 表面，不共享一个万能灰底。
- 图标按钮：至少 36×36px，圆角 `--radius-medium` 即 4px。禁用时取消位移动效，使用明确的禁用文字/表面。
- 点击位移为 `translateY(1px)`；键盘焦点保持可见，不以 hover 代替焦点。本站使用可见的 2px 焦点环，不降到源按钮的 1px；按下反馈已适配为缩放，见现行标准。
- 内容卡片使用实色表面。毛玻璃属于菜单、浮层、工具栏等功能层；使用时一并实现降低透明度、不支持 backdrop-filter、forced-colors 等退化，不把玻璃当装饰。

## 排印

依据：[typography.md](source/craft/typography.md)、[typography-hierarchy.md](source/craft/typography-hierarchy.md)。

- 每个视觉区域一个主入口；字号、字重、间距、字距、对齐至少两项协同建立层级。语义标题级别不等于视觉字号。
- 字号遵循有限比例阶梯；不为每个局部发明一个微小差异。源码的应用字号档与 craft 的编辑型 Display 范围属于不同场景，不能把 48–72px 展示标题套给全部控件。
- **中文展示字不使用负字距**，多行中文标题行高 1.3–1.4；中文正文按 1.7–1.8 检查。Latin 的紧字距与紧行高只作用于 Latin 元素。
- 正文默认字距 0；英文全大写使用 0.06–0.1em；展示与正文配对最多两类字体，始终提供 fallback。
- 用有差异的间距建立组间关系，避免所有文本同等粗细/间距；长段正文控制行长，不使用两端对齐。

## 动效

依据：[根 AGENTS.md](source/AGENTS.md) 的 `UI animation philosophy`、[animation-discipline.md](source/craft/animation-discipline.md) 和 tokens。

- 仅在导航、状态变化、展开、进度、手势反馈时使用动效；不为空白或「高级感」添加动效。
- 原文存在差异：AGENTS 推荐 `cubic-bezier(0.23,1,0.32,1)`、进入约 200ms/退出约 140ms；tokens 实际 `--ease-out` 为 `(0,0,0,1)`、进入 200ms/退出 150ms；Button 另用 50/100ms。
- 本站新通用过渡采用 AGENTS 的非对称 200/140ms 和 ease-out 方向；复刻具体控件时保留其源码状态节奏并注明例外。禁止全站强套一个时长。
- 不从 `scale(0)` 入场；使用至少 `scale(.9)` 配合透明度。需要退出动画时保持挂载至退出完成。
- 折叠可用 grid `0fr → 1fr` 配合 opacity；原文称其类在 index.css，而 index.css 又被规定为 import-only，因此迁入机制，不迁入该过时路径。
- 位移、缩放、旋转和视差响应 reduced-motion；本站保留零动画库约束；V2 仅在真实操作需要时使用动效，不保留旧 rAF 时间轴或自动墙作为设计要求。

## 状态与可访问性

依据：[state-coverage.md](source/craft/state-coverage.md)、[accessibility-baseline.md](source/craft/accessibility-baseline.md)。

- 数据表面覆盖加载、空、错误、有内容、极端内容；错误说明发生了什么及恢复方式，保留用户输入。原文的支付/客服/10,000行场景按真实能力选择，不凭空增加功能。
- 加载不能无限持续；搜索空状态保留查询上下文，提供可行的清除或调整途径。
- 使用 button/link 原生语义；键盘可达、焦点顺序符合阅读顺序、灯箱可退出并归还焦点；图标按钮有名称，输入框有标签。
- 普通文字对比度至少 4.5:1，大字及必要 UI 图形至少 3:1。原文 color.md 的「18px/14px bold」定义与 accessibility-baseline.md 冲突：采用后者的 24 CSS px 普通 / 约 18.67 CSS px 粗体阈值，不误用 px 与 pt。
- 触摸目标参考原文 24×24 CSS px 最低档及 44×44 增强档；区分界面选择和合规声明，不把迁文档当作已经通过审计。

## 避免模板化

依据：[anti-ai-slop.md](source/craft/anti-ai-slop.md)、[color.md](source/craft/color.md)。

- 使用真实内容与功能强调色；不填虚构指标、空泛占位文案、默认紫蓝渐变、emoji 功能图标或彩色左边框圆角卡片。
- 中性表面承载内容，强调色有明确任务；产品媒体自身的颜色不计入界面强调色配额。
- 原项目 `lint-artifact`、`data-od-id`、`.ph-img`、`od.craft.requires` 属于其生成器运行时。本站未移植这些机制，不宣称已自动检查，也不在产品 DOM 加无用标记。

## 当前采用状态与有意适配

更新于2026-09-12。以下为用户已确认的本站适配；原始规范数值留在上文及 source 中，不因此修改源文件。

| 项目 | 现行适配 |
| --- | --- |
| 主题 | workspace / paper / plate 等中性语义色，html[data-theme] 双主题；不得另造装饰线路主题 |
| 字体 | 本地 Albert Sans、中文系统回退、中文字距0；页头17px、首页作品24px、独立详情32px；具体角色见 DESIGN.md |
| 操作 | 44px最小操作高，文字胶囊、图标圆形；图标18px / 1.6px；共享 Button / buttonClassName |
| 输入与分类 | 常驻240px底线搜索、即时过滤；中文分类以下划线选中，计数集中结果区 |
| 内容 | 媒体8px圆角，开放阅读流；普通页面不增加装饰投影和层层面板 |
| 局部材质 | 八本分类书、米白纸面、装订阴影与首页书籍预览允许实体书造型；不扩展到全站 |
| 动效 | 通用进入200ms / 退出140ms；按钮缩放100ms；首页导航360ms；书籍使用专属序列。键盘、减少动态效果与中断路径按 DESIGN.md 验收 |
| 内容浏览 | 灵感稳定网格、自动追加、单链接详情；布局为书架和画册、图片点击放大即详情；无JSON／同步信息 |
| 导航 | 首页选择产品；页头按当前层级返回；灵感相邻浏览采用文字组，布局独立详情采用共享按钮 |
| 工程 | globals.css只拥有tokens、基础样式和明确共享契约，组件样式归相邻CSS Module；不安装原项目内部组件包或动画库 |

具体页面与验证要求见 [设计文档入口](../README.md)，控件用途见 [控件标准](../controls/README.md)。历史 execution / redesign-v2 报告只记录其交付时间的结果，不作为新修改的设计入口。

书架开册已接入统一键盘与偏好策略；开册宽高插值的性能风险仍在设计文档入口列出。本表不宣称全站已经逐项符合规范。source 保持只读，更新来源副本另行核对 manifest。
