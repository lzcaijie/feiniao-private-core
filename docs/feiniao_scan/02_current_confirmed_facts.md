# 飞鸟当前已确认事实（v13）

> 只记录本轮“Pages / 长尾承载链”可由源码直接验证的事实。

## 1) 路由与控制器
1. 前台通用单页路由来自 `route`（或 `siteGroupRouteHook`）里的 `name=pages`，绑定到 `Pages::detail()`，并对参数加了 `name=[a-z-]+` 约束。
2. 前台同时保留 `about / agreement / privacy` 三条专用路由，指向 `User` 控制器。
3. `User` 控制器当前只实现了 `about()`，未见 `agreement()` / `privacy()` 方法。

## 2) Pages 字段边界
1. 后台对 `Pages.name` 的校验是：`lower|min:3|unique:pages`。
2. 前台通用 pages 路由对 `name` 的匹配是 `[a-z-]+`。
3. 后台与前台对 `name` 的约束口径不完全一致，实际允许字符集合仍需继续以数据库/运行态配合确认。

## 3) Pages.template 与模板来源
1. 后台 Pages 新增/编辑时的模板来源固定读取 `template/<theme.template_pc>/pages/`。
2. 前台渲染执行 `view($detail['template'])`，当前 `template` 字段语义是页面模板文件名槽位。
3. 三套主题 `default_mobile/default_pc/tadu_pc` 的 `pages/` 目录本轮都只发现 `default.html`。

## 4) 前台/API/后台三套口径并存
1. 前台 `Pages::detail()` 按 `name` 取 pages，当前未加 `status=1`。
2. API `Common::pages()` 按 `status=1 + name` 取 pages。
3. 后台模板候选固定跟随 `theme.template_pc/pages`，与前台运行时主题选择逻辑并非同一口径。

## 5) 模板直查 pages 与 URL 输出
1. 三套模板中存在多处 `model('pages')` 按 `name`（about/agreement/privacy）直接取内容。
2. 未检索到现成 `furl('pages', ...)` 调用样例。
3. 本仓源码未检索到 `/home/page-*` 字面量；此前相关说法需在数据库或线上运行环境继续核实。

## 6) sitegroup 与 pages
1. sitegroup 对 pages 没有单独专有规则，机制是复制总站 route 到 `addons_site_route` 并在运行时整体接管。
2. sitegroup 新建站点会复制 `nav_info` 到 `addons_site_nav`，属于“复制现成 src”的机制。

## 7) 本轮判断
- `Pages` 适合作为长尾第一版承载层。
- `Pages` 不适合作为长尾主业务表。
- 仍支持：

**Longtail主表 + Pages承载 + PagesKeywords挂词 + Keywords词池 + Route输出 + pages模板展示**。
