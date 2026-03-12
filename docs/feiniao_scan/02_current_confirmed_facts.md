# 飞鸟当前已确认事实（v13）

> 只记录这轮源码里已经直接核到的事实，不写猜测。

## 1. Pages / 长尾承载链新增确认

1. 当前单页体系不是单链，而是**双轨并存**：
   - 通用单页链：`pages` 路由 -> `Pages::detail()`
   - 专用单页链：`about / agreement / privacy` -> `User::*` 视图 -> 模板内直接查 `pages` 表

2. 当前源码里**没有搜到现成的 `furl('pages', ...)` 调用样例**。
   - Pages 地址当前并没有形成“统一由 `furl('pages')` 输出”的成熟口径。

3. sitegroup 子站创建时，会把总站 `nav_info` 直接复制到 `addons_site_nav`。
   - 导航层当前主要保留的是 `src` 结果，不是“运行时重建 Pages URL”。

4. 安装数据里当前已存在写死的 Pages URL：
   - `/home/page-about.html`
   - `/home/page-agreement.html`
   - `/home/page-privacy.html`
   - `/home/page-contactus.html`
   - `/home/page-homeai.html`
   - `/home/page-homecoin.html`

5. 当前三套主题下 `pages/` 目录都只明确看到 `default.html`。
   - `Pages.template` 现在是模板槽位，但实际可用页面模板仍很少。

## 2. 当前更稳的判断

- `Pages` 适合做长尾第一版**承载层**
- 不适合直接做长尾**主业务表**
- 更稳的结构仍是：

**Longtail主表 + Pages承载 + PagesKeywords挂词 + Keywords词池 + Route输出 + pages模板展示**
