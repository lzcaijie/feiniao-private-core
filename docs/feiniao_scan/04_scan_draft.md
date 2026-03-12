# 飞鸟系统扫描文档草案（v13）

本轮重点补扫：
- `Pages / 长尾承载链`
- `route / addons_site_route`
- `nav / addons_site_nav`
- 专用单页 route 与通用单页 route 的并存关系

本轮最关键结论：
- 单页体系双轨并存
- `furl('pages', ...)` 当前未形成全站统一输出口径
- sitegroup 复制的是导航结果，不是 Pages 地址生成逻辑
