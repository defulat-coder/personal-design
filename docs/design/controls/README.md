# 全站控件标准

现行版本：2026-09-12。视觉基准以 [DESIGN.md](../../../DESIGN.md) 为准；本文件记录用途、共用入口与明确例外，不保存逐次修改日志。

## 控件映射

| 用途 | 组件／外观 | 状态与行为 |
| --- | --- | --- |
| 主要动作 | Button primary | 实心胶囊，页面内突出一个主要去向 |
| 次要动作、布局详情连续浏览 | Button default | 细边框胶囊 |
| 返回、清除、次级恢复 | Button ghost 或上下文链接 | 透明、低视觉重量；保持原生按钮／链接语义 |
| 弱表面操作 | Button subtle | plate 衬底，不使用旧 subtle 底色描述 |
| 主题、翻页、灯箱操作 | Button icon | 44×44px 圆形，18px / 1.6px 图标，必须有名称 |
| 搜索 | CollectionSearch | 240px 行内底线，最小高44px；无外框、填充或提交按钮 |
| 分类 | CategoryTabs | 44px目标、选中1px下划线、aria-pressed；计数不分散在分类标签 |
| 页头上下文返回 | WorkspaceShell / WorkspaceBack | 首页 → 产品 → 书架／画册的上一级职责，书内仅一个返回书架入口 |
| 首页作品入口 | WorkspaceLink | 整件作品单链接；进入箭头向右、外链向右上，360ms标题位置衔接；返回增加180ms原页面退场 |
| 灵感详情连续浏览 | BrowseNavigation text | 无外框文字、细长箭头、短竖线；不改成描边按钮 |
| 书脊与纸页 | LayoutBookshelf | 保留实体书内容语义；图像点击放大即阅读详情 |
| 视频 | MotionVideo / SiteShowcaseMedia | 作品详情保留原生控制；个人网站宣传片采用点击／键盘切换的已确认例外 |

## 状态契约

返回／关闭控件遵循 [DESIGN.md 的成对动效规则](../../../DESIGN.md#进入与退出必须成对设计)：所有同类入口同时覆盖，原表面先退场再切换；即时路径与中断行为统一按状态矩阵处理。

- Button 文字为14px / 500 / 22px，图文间距8px，常规内边距10px 18px；ghost 横向12px。
- 文字按钮胶囊、图标圆形。default 为 paper / ink，primary 为 ink / paper，ghost 为透明 / ink-soft，subtle 为 plate / ink。
- 悬停仅针对精细指针，按下缩至 .96；键盘与减少动态效果取消空间反馈。首页作品按下 .975 是局部入口反馈。活动动画共同读取 instantMotion / observeMotionPolicy；循环预览必须停止队列，不能仅将CSS时长归零。
- 共享按钮焦点环2px、外偏3px；链接与分类按局部间距采用4–8px；搜索用加深底线，forced-colors 恢复明确轮廓。
- disabled 必须实际阻止动作；首尾导航保留明确不可用状态。无文字操作有可访问名称。
- 搜索支持 `/` 聚焦；输入即过滤；有词才显示清除；清除后保留输入焦点，Esc退出焦点但保留查询。
- 返回先播放离开表面的退出动作，再切换状态并恢复焦点与现场；画册合册260ms、页面退场180ms，键盘／减少动态效果即时完成。不添加第二个同级退出入口。
- 原生文字链接、书籍造型、图片放大提示及视频控件不强制包装成同一种按钮。

## 实现入口

- [共享按钮](../../../apps/web/components/button.tsx) 与 [样式](../../../apps/web/components/button.module.css)
- [搜索](../../../apps/web/components/collection-search.tsx) 与 [样式](../../../apps/web/components/collection-search.module.css)
- [分类](../../../apps/web/components/category-tabs.tsx) 与 [样式](../../../apps/web/components/category-tabs.module.css)
- [连续浏览](../../../apps/web/components/browse-navigation.tsx) 与 [样式](../../../apps/web/components/browse-navigation.module.css)
- [页面契约与验收](../README.md)

全局 tokens 在 globals.css；组件几何与状态在相邻 CSS Module。新增样式优先复用以上入口，不再建立第二套控件库。
