# 飞鸟下一轮核对清单（v14）

> 本轮收口：只保留 Pages / 长尾承载链相关的 P0/P1，并转成测试站可直接执行的最小核实清单。

## P0（必须数据库 / 运行态确认）
1. `route` 表里 `name=pages` 的当前生效 `rule` 是否仍为 `page-:name`。
2. `route` / `addons_site_route` 中 `about / agreement / privacy` 是否在目标测试站启用，且规则一致。
3. 历史 URL 线索（如 `/home/page-*`）是否仍以 route/nav/config 形式残留在测试站数据中。

## P1（源码已可下结论 + 少量运行态兜底）
1. `Pages.name` 约束口径当前不一致：后台校验 `lower|min:3`，前台路由约束 `[a-z-]+`（源码结论已成立）。
2. `agreement/privacy` 专用页链路不完整：路由存在，但 `User` 控制器仅实现 `about()`（源码结论已成立）。
3. 长尾第一版 route 建议独立命名（如 `longtail`），避免与既有 `pages` 语义耦合（架构建议，待落地时再验证）。

## 本轮输出物指引
- 测试站执行清单：见 `05_testsite_minimal_validation_plan.md`。
- 已确认源码事实基线：见 `02_current_confirmed_facts.md`。
