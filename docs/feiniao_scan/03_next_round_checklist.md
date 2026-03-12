# 飞鸟下一轮核对清单（v13）

> 仅保留本轮复核后仍未完全坐实、且值得继续核对的点。

## P0（仍需数据库/运行态确认）
1. `route` 表里 `name=pages` 的当前实际 rule 是否仍为 `page-:name`（源码只看到“从表读取并注册”，看不到数据库现值）。
2. `route` / `addons_site_route` 中 `about / agreement / privacy` 在各站点是否都启用、规则是否一致。
3. `/home/page-*` 这类历史 URL 是否仍存在于线上数据库（`route`、`nav_info`、`addons_site_nav`、配置项）而非仓库源码。

## P1（结构收口）
1. 统一 `Pages.name` 约束：后台校验（`lower|min:3`）与前台路由（`[a-z-]+`）是否需要收敛为同一规则。
2. 专用页 `agreement/privacy` 的真实落地方案：补齐控制器/视图，或统一改为模板弹窗/通用页承载。
3. 长尾第一版 route 命名是否独立于现有 `pages`（避免与历史单页语义耦合）。
