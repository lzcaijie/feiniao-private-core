# 飞鸟系统扫描文档草案（v13）

## 本轮范围
- 仅复核：Pages / 长尾承载链。
- 未改业务代码、模板逻辑、控制器逻辑、数据库逻辑。

## 本轮主要源码定位
1. 前台路由与 pages 入口：`app/home/route/app.php`
2. 前台 pages 控制器：`app/home/controller/Pages.php`
3. 专用单页控制器：`app/home/controller/User.php`
4. 后台 pages 管理与模板候选来源：`app/admin/controller/Pages.php`
5. 后台 pages 参数校验：`app/admin/validate/PagesValidate.php`
6. API pages：`app/api/controller/v1/Common.php` + `app/api/route/app.php`
7. sitegroup 路由/导航复制：`addons/sitegroup/controller/Site.php`、`addons/sitegroup/Plugin.php`
8. 三套主题模板补查：
   - `template/default_mobile/pages/`
   - `template/default_pc/pages/`
   - `template/tadu_pc/pages/`
   - 以及各主题 `login/*`、`user/about.html` 中的 `model('pages')` 直查逻辑。

## 旧文档与本轮复核差异（关键）
1. 旧口径中“`page-:name` 为已确认默认规则”改为“待数据库确认”。
2. 旧口径中“仓库存在 `/home/page-*` 写死 URL”改为“本仓源码未检索到，需到数据库/运行态再核”。
3. “双轨并存（通用 pages + 专用 about/agreement/privacy + 模板直查 pages）”结论保留。
4. 新增确认：`User` 控制器当前仅有 `about()`，`agreement/privacy` 方法未见实现。

## 仍存疑点
1. `agreement/privacy` 专用路由在实际线上是否启用、是否被其他机制兜底。
2. `Pages.name` 前后台约束口径不一致的实际影响范围。
