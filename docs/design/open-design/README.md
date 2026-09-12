# OpenDesign 设计规范迁移

本目录依据用户指定的原始代码提取设计规范。上一轮页面改版只是视觉实现，不能作为「已经忠实复刻原规范」的证据。本次迁移的是原文、采用规则和 Agent 阅读入口；不改页面代码。

## 原项目真正的规范入口

核对版本：`d4138ea81832c792f28cb69f2637a35e52f20f5a`。文件来源与 SHA-256 见 [manifest.json](manifest.json)。副本保留原始字节，包括原有署名；许可证见 [LICENSE](source/LICENSE)。源目录可能包含工作区改动，因此文件哈希是副本保真依据，commit 是定位基线。

| 发现 | 作用 | 本项目处理 |
| --- | --- | --- |
| 根 `CLAUDE.md` 内容只有 `@AGENTS.md` | Agent 入口复用 | 根 `CLAUDE.md` 链接到 `AGENTS.md`，保持单一入口 |
| 根 `AGENTS.md` 的 Web CSS ownership / Web component reuse / UI animation philosophy | 应用前端的工程与交互规则 | 迁移到 [apps/web/AGENTS.md](../../../apps/web/AGENTS.md) 与 [rules.md](rules.md) |
| `apps/AGENTS.md` | 应用边界；非视觉规范 | 保留原文用于溯源，不迁入 daemon、Electron 等约束 |
| `apps/web/src/styles/tokens.css`、`base.css` | 应用真实颜色、字体、圆角、间距、动效值 | 保存原文并建立语义映射；不作为浏览器全局 CSS 直接加载 |
| `apps/web/src/styles/material.css` | 功能浮层材质及无障碍退化 | 按功能浮层场景采用，不把毛玻璃施加到所有卡片 |
| `packages/components/src/` | Button、Dialog 等基础组件实际状态契约 | 保存关键源码；本项目优先复用已有组件，缺失时本地补齐 |
| `craft/*.md` | 与品牌无关的排印、色彩、状态、动效、无障碍规则 | 完整保留；按任务阅读，不宣称原项目 daemon 检测已接入 |
| `design-systems/*/DESIGN.md` | 为生成作品提供的品牌/风格目录 | 不任意挑一个当作 OpenDesign 应用自身样式 |
| `docs/design-systems.md` | 上述风格包的制作规范 | 保留说明；不要求本站引入 manifest/daemon/picker 运行时 |

未找到根 `DESIGN.md`、根 `Cloud.md` 或根 `Agent.md`；实际名字是 `CLAUDE.md` 和 `AGENTS.md`。检索到的局部 `Theater/AGENTS.md` 属于演示剧场组件，不是全站设计规则。

## 使用顺序

1. 根 [AGENTS.md](../../../AGENTS.md) 与 [PRODUCT.md](../../../PRODUCT.md)：项目与产品边界。
2. 根 [DESIGN.md](../../../DESIGN.md)：本站唯一现行视觉与交互标准。
3. [设计文档入口](../README.md) 和 [控件标准](../controls/README.md)：页面流程、组件用途与验收。
4. [apps/web/AGENTS.md](../../../apps/web/AGENTS.md)：前端修改与验证要求。
5. [rules.md](rules.md)：来源说明、采用原则与有意适配；需要溯源时再读 source。

`source/` 是来源证据，不是新项目指令树；其中路径、命令、包名与自动检查说明均属于原项目，不直接执行。更新副本时同时更新 manifest；更改采用规则时记录源文件依据。
