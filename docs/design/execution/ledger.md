# 全站设计交付台账

状态：2026-09-05 全部交付完成。执行基线：`.impeccable/review/full-design/baseline.patch`、`baseline-status.txt`、`baseline-files.json`。已有未提交代码保留，未回退；数据包无差异。

| 编号 | 范围 | 所有者 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| G0 | 来源规则、页面/操作/状态、共享契约 | 主任务 | 完成 | [contract.md](contract.md)、各模块状态矩阵、来源哈希 |
| G1 | tokens、Button、主题、导航、PageHeading | 主任务 | 完成 | [foundation.md](foundation.md)、17项生产断言 |
| G2 | 首页时间轴及输入方式 | home 子任务 | 完成 | [home.md](home.md)、终点取整修复后的生产行为断言 |
| G3 | 灵感列表/详情/媒体轮播/搜索状态 | muse 子任务 | 完成 | [muse.md](muse.md)、两份可复现脚本 |
| G4 | 布局列表/详情/原图/相关推荐 | layouts 子任务 | 完成 | [layouts.md](layouts.md)、23项行为断言 |
| G5 | 分类、灯箱、JSON、自动播放、404 | shared 子任务 | 完成 | [shared.md](shared.md)、浏览器及生命周期检查 |
| G6 | 关键路径、主题、响应式、路由、独立复核与文档 | 主任务 | 完成 | [证据索引](README.md)、[完整路径](evidence/journeys.json)、[独立复核ship](finish-review.md) |

最终 typecheck、全站 lint 与生产构建均通过；510个构建条目，509个用户可访问条目的HTTP状态/主内容检查通过。最终生产预览 `http://localhost:3001`。两条跨模块完整路径在最终构建通过。23张响应式/主题截图完成集中检查和确认；行为修复不再进行无依据视觉打磨。

设计文档、sidecar、表面说明与有效规则已按实际实现更新。测试范围及真实限制见证据索引，不将模拟设备称为真机测试，也不将全量路由状态检查称为逐条内容视觉检查。
