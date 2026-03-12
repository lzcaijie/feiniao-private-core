# 飞鸟 AI 五合一总文档（v13）

> 用途：这是当前最适合后续 AI 持续查看、持续扫描、持续补文档的总文档。  
> 口径：只把**源码已核实**内容写成“已确认”；未核实内容只写成“待继续核”。

---

## 0. 当前阶段与协作规则

### 0.1 当前阶段定位
- 当前还不是正式大规模改代码阶段。
- 当前主任务仍是：
  1. 系统扫描
  2. 结构梳理
  3. 实际链路确认
  4. 文档收口
- 暂不做大范围删功能。
- 后续模板目标仍是：
  - 先摸清当前模板调用链
  - 再制定自己的飞鸟模板标准
  - 最后做自适应母模板，再派生多套风格模板

### 0.2 当前写文档规则
- 先核对，再下结论。
- 不瞎猜，不把未核实内容写成已确认事实。
- 当前以 **2026-03-12 上传的完整源码包** 为本轮扫描基线。

---

## 1. 源码包基线总览

### 1.1 顶层结构（已核）
- `addons/`：插件层
- `app/admin/`：后台运营层
- `app/api/`：接口资源层
- `app/author/`：作者生产后台
- `app/common/`：公共模型 / 公共函数
- `app/crud/`：CRUD 生成层
- `app/home/`：前台主链路
- `app/service/`：服务层
- `config/`：配置层
- `extend/content/`：正文存储层
- `public/h5/`：独立 H5 资源目录
- `template/`：前台模板层

### 1.2 当前规模统计（按源码目录已核）
- 插件目录：5 个
  - `baiduautopush`
  - `baidupush`
  - `cover`
  - `import`
  - `sitegroup`
- 后台控制器：58 个
- 前台控制器：21 个
- API v1 控制器：15 个
- 作者端控制器：8 个
- 模板目录：3 套
- 模板 HTML 文件数：
  - `default_mobile`：38
  - `default_pc`：31
  - `tadu_pc`：31

### 1.3 默认主题配置（`config/theme.php`）
- `template_pc = default_pc`
- `template_mobile = default_mobile`
- `template_separate = h5`

### 1.4 模板元信息（`copyright.xml`）
- `template/default_mobile`：`platform = mobile`，名称“官方-默认移动版”
- `template/default_pc`：`platform = pc`，名称“官方-默认电脑版”
- `template/tadu_pc`：`platform = pc`，名称“仿塔读-电脑版”
- `public/h5`：`platform = separate`，名称“官方-移动端独立部署版”

### 1.5 当前整体判断
源码层面同时存在 3 种展示端概念：
1. `template/*` 常规 PC / Mobile 模板
2. `public/h5` 独立端资源包
3. 后台“主题管理”里可识别的 `template_separate`

---

## 2. 系统分层判断（当前源码口径）

### 2.1 底座层
- `sitegroup`
- 前台 / API 路由注册文件
- `Novel / Chapter / Category / Rank / Pages`
- `CacheService`
- `get_system_config()` 配置体系
- `ChapterIdService`

### 2.2 业务层
- 小说详情 / 列表 / 搜索
- 章节阅读
- 书架 / 阅读记录 / 评论
- VIP / 订单 / 充值 / 提现 / 任务 / 邀请
- 首页广告位 / 推荐位 / 通知位

### 2.3 扩展层
- `Pages`
- `Keywords`
- `PagesKeywords`
- `SearchKeywords`
- `SearchLog`
- `CRUD`
- sitegroup 的子站配置 / 子站路由 / 子站导航 / 子站友链

### 2.4 展示层
- `template/default_mobile`
- `template/default_pc`
- `template/tadu_pc`
- `public/h5`

### 2.5 生产层
- `app/author/`
- `book`
- `chapter`
- `chapter_verify`
- `chapter_draft`
- `Content`

---

## 3. 真实前台成页链（已核到的主口径）

### 3.1 当前前台不是单层成页，而是至少 3 层叠加
前台页面最终结果，当前至少由下面 3 层共同决定：

1. **路由层**
   - `app/home/route/app.php`
   - `app/api/route/app.php`
   - `siteGroupRouteHook`
   - `route` 表 / `addons_site_route` 表

2. **模板选择层**
   - `app/home/BaseController.php::view_path()`
   - `siteGroupHook`
   - `config/theme.php`
   - `web.h5domain`

3. **模板取数层**
   - 控制器先 assign / fetch
   - 模板内再调用 `model(...)`
   - 或模板内再打 `v1/*` 接口
   - 或模板读取 `get_system_config(...)`
   - 或模板读取站群 hook

### 3.2 当前 route 文件内的定义规模（源码静态定义数）
- 前台 `app/home/route/app.php`：55 条显式前台路由注册（其中 `Route::rule` 53 条，`Route::get` 2 条）
- API `app/api/route/app.php`：71 条显式 API 路由注册

说明：
- 这里统计的是“源码路由注册文件里的定义条数”，不是数据库 route 表记录数。
- 实际运行时，如果启用了 sitegroup，还会先走 `siteGroupRouteHook`。

### 3.3 前台主控制器到模板的映射（已核）
- `Index::index()` → `index/index`
- `Index::app()` → `index/app`
- `Book::cate()` / `list()` / `quanben()` / `rank()` / `detail()` → 当前模板目录下同名视图
- `Chapter::detail()` → `chapter/detail`
- `Search::index()` → `search/index`
- `Rank::index()` / `detail()` → `rank/index`
- `Novel::index()` → `novel/index`
- `Novel::girls()` → `novel/girls`
- `Pages::detail()` → `view($detail['template'])`
- `Info::index()` / `detail()` → `info/index` / `info/detail`

### 3.4 当前明确存在“路由还在，但部分模板未配对应视图”
这是当前源码包的一个重要现状。

例子：
- `Index::app()` 路由还在，但当前只有 `tadu_pc/index/app.html`
- `Novel::* / Rank::*` 当前主要由 `tadu_pc` 覆盖
- `default_mobile`、`default_pc`、`tadu_pc` 三套模板的页面覆盖范围明显不一致

结论：
- 不能把“控制器和路由还在”直接理解成“每套模板都能完整显示”。

---

## 4. sitegroup 站群链路（源码已核）

### 4.1 sitegroup 已进入前台 / API 主路由层
已确认文件：
- `app/home/route/app.php`
- `app/api/route/app.php`

当前逻辑：
- 先判断 sitegroup 是否启用；
- 再尝试 `siteGroupRouteHook`；
- 没拿到再回退到总站 `route` 表。

### 4.2 当前站点匹配顺序（`addons/sitegroup/Plugin.php`）
已核实顺序：
1. 精确域名匹配
2. 通配符域名匹配
3. 父级 / 子域名回退匹配

关键实现特征：
- 先读取全部站点并按 `LENGTH(domain) DESC` 排序
- 当前 host 来自 `Request::host()`
- 精确匹配优先
- 再做 `*` 通配符转正则匹配
- 最后按 host 分段回退测试更上层域名

### 4.3 子站创建时会复制什么（`addons/sitegroup/controller/Site.php`）
当前已核实会复制：
- 路由：`addons_site_route`
- 配置：`addons_site_config`
- 导航：`addons_site_nav`
- 友链：`addons_site_links`

本轮没有在“新建子站”代码里看到：
- Pages
- Keywords
- 内容主表
- 模板文件本体复制

### 4.4 sitegroup 当前对模板 / SEO / 导航 / 友链的参与方式
- `siteGroupHook()`：返回当前站点模板与站点信息，并附带 SEO
- `siteGroupRouteHook()`：返回当前站点路由
- `siteGroupNavHook()`：返回当前站点导航
- `siteGroupLinksHook()`：返回当前站点友链

---

## 5. 模板选择链与 `public/h5` 真实口径

### 5.1 后台“主题管理”已识别 `template_separate`
已确认文件：
- `app/admin/controller/Themes.php`
- `config/theme.php`
- `public/h5/copyright.xml`

当前表现：
- 后台会读取 `template/*` 下常规模板
- 也会额外读取 `public/h5`
- `template_separate` 当前默认配置是 `h5`

### 5.2 但前台 `BaseController::view_path()` 仍未直接切到 `public/h5`
已核实逻辑：
- sitegroup 命中时，优先返回子站 `template_mobile` 或 `template_pc`
- 非 sitegroup 时，如果 `web.h5domain` 命中：
  - 当前返回的是 `template_mobile`
  - 不是 `public/h5`
- 普通移动端也返回 `template_mobile`
- PC 返回 `template_pc`

### 5.3 当前对 `public/h5` 的准确结论
- 它是一个真实存在、可被后台主题管理识别的独立资源包
- 它有自己的 `index.html`、编译后的静态资源、`copyright.xml`
- 但当前 `home` 前台 `view_path()` 没有直接把它当模板目录返回

结论：
- 当前源码里，“后台支持独立 H5 主题” 与 “前台 home 模块实际走独立 H5” 不是完全闭合的一条链。

---

## 6. 三套模板的真实取数口径（按源码扫描）

### 6.1 总体判断
更准确的当前口径是：

- `default_mobile`：偏接口驱动，但不是纯接口模板
- `default_pc`：偏模板内直查
- `tadu_pc`：更偏模板内直查，同时混入局部接口交互

### 6.2 按 HTML 模板扫描的整体特征
#### `default_mobile`
- `model(...)`：7 次
- `v1/*` 接口引用：68 次
- `hook(...)`：1 次
- 更像“页面壳 + 前端脚本拉接口”
- 结论：
  - 这套模板明显更依赖接口和前端脚本联动；
  - 但并不是完全不直查，仍有 `model('category')`、`model('pages')` 等调用。

#### `default_pc`
- `model(...)`：72 次
- `v1/*` 接口引用：38 次
- `hook(...)`：3 次
- 结论：
  - 明显偏模板内直查；
  - 但详情页、章节页、用户信息、评论等位置仍有接口配合。

#### `tadu_pc`
- `model(...)`：82 次
- `v1/*` 接口引用：23 次
- `hook(...)`：3 次
- 结论：
  - 三套里模板直查最重；
  - 但仍混入收藏、评论、登录、章节等接口交互。

### 6.3 关键页面差异（按页面族）
#### 首页
- `default_mobile/index/index.html`
  - 控制器只给页面壳
  - 模板内更依赖 `v1/advert`、`v1/booklist`、系统配置
- `default_pc/index/index.html`
  - 大量 `model('slide_info') / model('advsr') / model('book') / model('category')`
- `tadu_pc/index/index.html`
  - 继续大量 `model('book') / model('advsr') / model('chapter') / model('category')`
  - 局部混入前端交互接口

#### 小说详情页
- 控制器 `Book::detail()` 已做：
  - `Novel::getBookDetail()`
  - 首章 / 最新章
  - `authorurl`
  - `single_book` 采集触发
- `default_mobile`
  - 页面后续仍会调 `v1/bookdetail`、`v1/booklist`、`v1/favorites`
- `default_pc`
  - 模板继续直查作者、章节、收藏、关注、相关推荐
- `tadu_pc`
  - 模板内直查更重
  - 还挂了 `synchCoverHook`

#### 章节页
- Web 控制器已做：
  - 章节 ID 识别/解密
  - 章节详情
  - 小说详情
  - 目录缓存
  - 权限判断
  - 正文读取
  - 上下章
  - 防采集乱序
- 三套模板都还会继续调用 `v1/chapter`
- 结论：
  - 章节页当前是“Web 控制器先出一版 + 前端再调 API 补一版”的混合链

#### 搜索页
- Web 控制器已做：
  - `Novel::search()`
  - `Novel::getHotKeywordNovels(10)`
- `default_mobile`
  - 主要走 `v1/search` + `v1/keywords`
- `default_pc`
  - 结果区继续调用 `v1/booklist`
- `tadu_pc`
  - 更偏服务端渲染

#### 排行 / 筛选
当前源码里并存两套路子：

1. 老链：
- `Book::rank()` → `book/rank`
- `Book::cate()` / `list()` / `quanben()`
- 当前主要体现在 `default_pc`

2. 新链：
- `Novel::*` → `novel/index` / `novel/girls`
- `Rank::*` → `rank/index`
- 当前主要体现在 `tadu_pc`

#### Pages 页面
- 路由：`pages` → `Pages::detail()`
- 三套模板当前都只有 `pages/default.html`
- 当前 Pages 模板槽位很少，但它已经具备数据库承载层特征


### 6.3A 三套模板覆盖率（按 30 个核心页面族静态核对）
- `default_mobile`：已覆盖 20 / 30  
  明显缺：`index/app`、`book/quanben`、`book/rank`、`info/*`、`login/register`、`novel/*`、`rank/index`
- `default_pc`：已覆盖 19 / 30  
  明显缺：`vip/*`、`withdraw/*`、`coin/index`、`invite/index`、`task/index`、`novel/*`、`rank/index`
- `tadu_pc`：已覆盖 18 / 30  
  明显缺：`book/cate`、`book/list`、`book/quanben`、`book/rank`、`bookshelf/index`、`coin/index`、`invite/index`、`task/index`

说明：
- 这里是“控制器常见页面族 vs 模板文件是否存在”的静态核对；
- 不是说缺文件就一定 404，因为部分链路可能被别的模板、接口或前端跳转绕过去；
- 但它足以说明：三套模板并不是同一口径、同一覆盖范围的完整母模板。

### 6.4 当前“主题覆盖不完整”的源码现状
#### `default_mobile` 当前缺少的典型视图
- `index/app`
- `book/quanben`
- `book/rank`
- `article/detail`
- `info/index`
- `info/detail`
- `login/register`
- `novel/index`
- `novel/girls`
- `rank/index`
- `user/report` / `user/comments` / `user/follow`

#### `default_pc` 当前缺少的典型视图
- `index/app`
- `novel/index`
- `novel/girls`
- `rank/index`
- `invite/index`
- `order/index`
- `task/index`
- `coin/index`
- `vip/index` / `vip/log`
- `withdraw/index` / `withdraw/log`

#### `tadu_pc` 当前缺少的典型视图
- `book/cate`
- `book/list`
- `book/quanben`
- `book/rank`
- `article/detail`
- `bookshelf/index`
- `invite/index`
- `order/index`
- `task/index`
- `coin/index`
- `withdraw/*`

---

## 7. Pages / Keywords / Search 四条链，当前不要混

### 7.1 `Pages`
前台：
- `app/home/controller/Pages.php`
- 通过 `name` 查 `Pages`
- 当前前台 detail 未看到 `status = 1` 限制
- 再关联 `PagesKeywords`
- 最终 `view($detail['template'])`

API：
- `app/api/controller/v1/Common.php::pages()`
- 明确 `where(['status' => 1, 'name' => $name])`

后台：
- `app/admin/controller/Pages.php`
- 新增 / 编辑时，模板来源固定读取：
  - `template/<theme.template_pc>/pages/*`

### 7.2 `PagesKeywords`
- 后台入口：跟随 `Pages` 保存
- 写入链：
  - `keyword_names`
  - `PagesModel::insertKeyword()`
  - `Keywords::increase()`
  - 写入 `PagesKeywords`
- 前台读取链：
  - `home/Pages::detail()` 读取 `PagesKeywords + keywords`

### 7.3 `Keywords`
- 表：基础词池
- 后台：`app/admin/controller/Keywords.php`
- 支持：列表、增改、逻辑删除

### 7.4 `SearchKeywords`
- 后台入口：`app/admin/controller/Search.php`
- 操作对象：`SearchKeywords` 表
- 当前源码里主要看到：
  - 列表
  - 删除
- 本轮未看到：
  - 前台直接读取它
  - API 热词直接读取它

### 7.5 `SearchLog`
- 来源：
  - `app/api/controller/v1/Search.php`
  - `app/common/model/Novel::search()`
- 用途：
  - 记录真实搜索行为
  - 聚合热词
  - 给 `Novel::getHotKeywordNovels()` 提供热门搜索词

### 7.6 当前四条词链的正确拆分
- `Keywords`：基础词池
- `PagesKeywords`：页面挂词关系
- `SearchKeywords`：后台推荐搜索词 / 预置词表
- `SearchLog`：用户搜索日志 / 热词统计来源

### 7.7 搜索链的实际分层（本轮再收紧）
- Web 搜索页：`home/Search::index()` → `Novel::search()`，同时再补 `Novel::getHotKeywordNovels(10)`
- API 搜索结果：`api/v1/Search::index()`，直接查 `book`，并写 `search_log`
- API 热词：`api/v1/Search::keywords()`，直接对 `search_log` 做 group 聚合
- 后台推荐词：`admin/Search` 维护 `SearchKeywords` 表

结论：
- 当前源码里至少并存 **Web 搜索链、API 搜索链、后台推荐词链** 三条不同用途的搜索相关链路；
- 不能把它们混成同一个“搜索关键词系统”。

---

## 8. API 资源层（当前先按“会用到的”收口）

### 8.1 当前最值得继续复用的资源层
第一组：页面基础资源
- `Common::system()`：配置读取总入口
- `Common::pages()`：按 `name + status=1` 取 Pages
- `Common::recommend()`：广告位 / 推荐位聚合接口，会补书籍信息

第二组：内容主资源
- `Book::detail()`：详情、章节列表、继续阅读、收藏/关注等
- `Book::booklist()`：通用书单接口，兼容关键词、分类、作者、字数、随机等
- `Chapter::detail()`：章节详情、权限、正文、阅读记录、奖励链
- `Category::bigcate()` / `smallcate()`：分类基础接口

第三组：搜索与互动资源
- `Search::index()`：搜索结果
- `Search::keywords()`：热搜词（来源是 `search_log` 聚合）
- 评论接口：
  - `commentlist`
  - `commentcreate`
  - `commentlike`
  - `commentreply`

### 8.1A 当前最小复用建议（按后续模板方向）
如果后面要做“自适应母模板 + 手机端优先”，当前最稳的最小接口集合是：
- `Common::system`
- `Common::recommend`
- `Common::pages`
- `Book::detail`
- `Book::booklist`
- `Chapter::detail`
- `Search::index`
- `Search::keywords`

这套已经能覆盖：
- 首页推荐位
- 书库 / 分类 / 搜索
- 详情 / 阅读
- Pages 承载页

### 8.2 当前不应混淆的接口 / 数据口径
- `Search::keywords()` 的热词来源是 `search_log` 聚合，不是 `SearchKeywords`
- `Common::pages()` 有 `status=1`，前台 `Pages::detail()` 当前没有这层限制
- `Chapter::detail()` API 在 PC + `chapter_pages_content_open=1` 时，可能主动返回空正文
- `Book::booklist()` 既承担普通列表，也承担搜索补数，不是单一“书库页接口”

---

## 9. 阅读链路、缓存层、正文边界

### 9.1 当前章节 ID 链
已确认：
- `furl('chapter_detail', ...)` 用于输出章节访问地址
- `app/home/controller/Chapter.php`
  - 当前用 `if (intval($id) !== $id)` 判断是否解密
  - 若不是“纯数字同型”，则 `decrypt_chapter_id($id)`
- `app/service/ChapterIdService.php` 提供：
  - `encrypt`
  - `decrypt`
  - `isValid`
  - 批量加解密

### 9.2 Web 章节页链
`app/home/controller/Chapter.php` 当前承担：
- 参数读取
- 章节 ID 识别/解密
- 章节详情读取
- 小说详情读取
- 章节目录缓存
- 权限判断
- 正文读取
- 段落拆分 / 防采集乱序
- 上下章链接

Web 页正文口径：
- 控制器里先 `auto_run_addons('collect', single_chapter)`
- 再 `Content::get()`
- 再根据配置决定是否打乱段落

### 9.3 API 章节页链
`app/api/controller/v1/Chapter.php::detail()`
- 先查章节、小说、权限
- Mobile / 微信 / 关闭分页正文时：
  - 先 `Content::get()`
  - 取不到再触发 `collect`
- PC 且开启 `chapter_pages_content_open=1` 时：
  - 可能直接返回空正文
- 同时会写阅读记录、任务奖励、邀请奖励链

### 9.4 `Content` 正文存储层
已确认文件：
- `extend/content/Content.php`

当前口径：
- 支持 `chapter_save_type`
  - 1：数据库
  - 2：文件
- 支持压缩配置
- 读取时不是单向：
  - DB 模式下，先读数据库；数据库没有再读文件，并会尝试回填数据库
  - 文件模式下，先读文件；文件没有再读数据库，并会尝试回写文件

结论：
- 当前正文存储不是“纯数据库”或“纯文件”死板分离，而是带双向回填逻辑。

### 9.5 当前缓存分层
基础缓存函数：
- `set_cache`
- `get_cache`
- `clear_cache`
- `get_system_config`

服务层缓存：
- `app/service/CacheService.php`
  - `clearByPrefix()`
  - `remember()`
  - `setList()`
  - `getList()`

业务缓存使用面：
- `Novel::getBookDetail()`
- `Chapter::getChapterDetail()`
- `Rank` 模型
- `Chapter` 控制器章节目录缓存
- sitegroup 站点 / 路由 / 导航 / 友链缓存

---

## 10. 作者端与 CRUD 的当前边界

### 10.1 作者端
- `app/author/` 是独立模块，不走前台三套模板
- 当前已确认作者端包含：
  - 登录 / 注册 / 找回密码
  - 作品列表 / 新增 / 编辑 / 详情
  - 章节列表 / 新增 / 编辑 / 草稿 / 定时发布 / Word 导入
  - 收益
  - 签约申请 / 合同 / PDF 查看与下载
  - 作者资料 / 修改密码 / 服务页

### 10.2 作者端真实接入前台主链的地方
#### 作品侧
- 作者新增作品直接写 `book`
- 会生成 `filename`
- 会写入分类、标签、作者信息、状态等字段

#### 章节侧
主链明确涉及：
- `chapter`
- `chapter_draft`
- `chapter_verify`
- `Content`

已核到的关键切换点：
- `release()`：新章时会补 `status = 1`，再进入统一 `chapter()` 入库主体
- `timerrelease()`：会写 `status = 0` + `trial_time = 未来时间`
- 新增章节时，`chapter()` 会直接写 `chapter`，并写 `Content::add()`
- 已审核通过的旧章再修改时：
  - 先把主表 `chapter.verify` 置回 0
  - 再把新内容写入 `chapter_verify`
  - 说明“已通过章节修改”与“新章首发”不是同一条审核链
- 草稿独立放在 `chapter_draft`
- 自动保存草稿不会直接改 `chapter`，只落 `chapter_draft`
- 后台管理员审核通过后，`chapter.verify = 1`，并刷新 `book.update_time`
- 后台管理员拒绝时，`chapter.verify = 2`
- 前台可见章节当前主要按 `status = 1` 且 `verify in (0,1)` 取数

#### 一个当前要特别注意的口径
前台详情页、目录页、阅读页、API 章节列表，多处都在用：
- `status = 1`
- `verify in (0,1)`

这意味着：
- “待审新章（verify=0）” 在取数条件上并没有被完全排除；
- 真正最终是否前台可见，还需要继续结合运营实际数据口径再核一层；
- 这块是后续最值得重点复测的一个边界。

结论：
- 作者端不是孤立后台；
- 它直接写入前台主内容表与正文存储层；
- 但“发章 → 审核 → 前台可见”这条链，当前源码的字段口径并不算特别干净。

### 10.3 CRUD
- `app/crud/` 当前更像后台 CRUD 代码生成器
- 已确认包含：
  - command
  - make
  - tpl
- 当前更适合作为后续长尾/专题后台快速生成功能的底座，不是前台展示链本身。

---

## 11. 当前阶段对长尾系统第一版挂点的判断

当前更稳的第一版挂点，依然倾向：

**Longtail主表 + Keywords词池 + Pages承载 + PagesKeywords挂词 + Route输出 + 模板展示**

补充判断：
- `SearchKeywords` 不适合作为长尾主挂点
- `SearchLog` 更适合做“真实搜索行为参考源”
- `Pages` 适合做专题/落地页承载层
- `Route` 适合做最终地址输出层
- 若后续需要批量运营与分组管理，仍建议单独补一张 `Longtail` 主表

---

## 12. 当前已确认的问题点（v9 累计）

1. `Novel::getHotKeywordNovels()` 当前是覆盖结果，不是累加  
2. `Chapter.php` 章节 ID 判断边界不稳  
3. `CacheService` 默认过期时间注释与实际值不一致  
4. `Pages` 前台与 API 状态口径不一致  
5. `Pages` 后台模板来源固定盯 `theme.template_pc/pages/*`  
6. `public/h5` 独立端链路尚未和 `home` 前台 `view_path()` 完整闭合  
7. 当前源码包存在明显的“路由族仍在，但部分主题缺少对应视图文件”的情况  
8. `Index::app()` 路由仍在，但当前只有 `tadu_pc/index/app.html` 明确存在  
9. `SearchKeywords` 当前更像后台维护表，不是前台真实热词主来源  
10. Web 章节页与 API 章节页正文读取顺序并不完全一致  

---


## 12A. 本轮新增确认的高价值细节

### 12A.1 模板统计口径（本轮重算）
按 HTML 模板静态扫描：
- `default_mobile`：`model(...)` 7 次，`v1/*` 接口引用 68 次
- `default_pc`：`model(...)` 72 次，`v1/*` 接口引用 38 次
- `tadu_pc`：`model(...)` 82 次，`v1/*` 接口引用 23 次

这比“移动端接口、PC 直查”更准确：
- 三套都不是纯一种模式；
- 只是 `default_mobile` 更偏接口，`default_pc / tadu_pc` 更偏模板内直查。

### 12A.2 页面覆盖口径（本轮重算）
按 30 个核心页面族静态核对：
- `default_mobile` 覆盖 20 / 30
- `default_pc` 覆盖 19 / 30
- `tadu_pc` 覆盖 18 / 30

结论：
- 当前三套模板都更像“阶段性样板 + 局部可用模板”，还不是可直接统一派生的完整母模板。

### 12A.3 搜索链的真实热词来源
当前源码里：
- Web 搜索和 API 搜索都会写 `search_log`
- `api/v1/Search::keywords()` 直接聚合 `search_log`
- `SearchKeywords` 是后台单独维护表

结论：
- 当前真实热词主来源是 `search_log`，不是 `SearchKeywords`。

### 12A.4 作者发章链的字段边界
当前已核到：
- 新章首发：`release()` 补 `status = 1`
- 定时发布：`timerrelease()` 补 `status = 0 + trial_time`
- 已通过章节再改：会把 `chapter.verify` 打回 0，并写 `chapter_verify`
- 前台多处取章条件仍是 `status = 1 + verify in (0,1)`

这说明：
- “审核状态”和“前台是否可见”这两个概念，目前并没有完全收成一套非常干净的字段口径。




## 12B. 本轮深扫新增确认（v11）

### 12B.1 `Pages` 的前台 / API / 后台是三种不同口径
已核代码：
- `home/Pages::detail()`
- `api/v1/Common::pages()`
- `admin/Pages::*`

当前可确认：
- 前台 `home/Pages::detail()`：
  - 只按 `name` 查 `Pages`
  - 没有显式 `status = 1`
  - 查到后会 `PagesModel::where('id', $detail['id'])->inc('read')->update()`
  - 然后直接 `view($detail['template'])`
- API `Common::pages()`：
  - 明确 `where(['status' => 1, 'name' => $name])`
- 后台 `Pages` 模板来源：
  - 固定扫 `template/<theme.template_pc>/pages/*`
  - 不是按当前 sitegroup 子站模板动态扫

结论：
- `Pages` 当前不是一套前后台完全同口径的“干净页面系统”；
- 它更像已经具备了承载能力，但前台读取、API 读取、后台模板选择各自独立的一层。

### 12B.2 Web 热词、API 热词、后台推荐词，当前不只是来源不同，连“排序口径”都不同
已核代码：
- `home/Search::index()`
- `common/model/SearchLog::getHotKeywords()`
- `common/model/Novel::getHotKeywordNovels()`
- `api/v1/Search::keywords()`
- `admin/Search`

当前可确认：
- Web 搜索页热词入口：
  - `Novel::getHotKeywordNovels()`
  - 它先调 `SearchLog::getHotKeywords(1)`
  - `SearchLog::getHotKeywords()` 是“最近 7 天 + `COUNT(*) desc`”
- API 热词：
  - `api/v1/Search::keywords()`
  - 直接 `group('keyword')`
  - 当前排序写的是 `resnum desc`
  - 不是最近 7 天，也不是按 `COUNT(*)` 排序
- 后台推荐词：
  - `SearchKeywords` 表
  - 单独人工维护

结论：
- 当前源码里至少同时存在 3 套“热词 / 关键词”口径；
- 它们不只是“数据源不同”，连排序标准都不同；
- 后续文档和模板标准里必须把它们拆开写。

### 12B.3 `Novel::getHotKeywordNovels()` 当前有两个真实限制
已核代码：
- `Novel::getHotKeywordNovels($limit = 5)`

当前确认：
1. 它只取 `SearchLog::getHotKeywords(1)`  
   也就是当前只取 **1 个热词**，不是多个热词。
2. 循环里 `if (!empty($novels)) { $result = $novels; }`  
   是覆盖，不是累加。

结论：
- 这个方法现在更像“取一个热词对应的一组书”，而不是“多热词聚合推荐”。

### 12B.4 作者发章链，当前至少分成“新章首发”和“已通过章节修改”两条审核链
已核代码：
- `author/Chapter::release()`
- `author/Chapter::timerrelease()`
- `author/Chapter::chapter()`
- `admin/Chapter::verify()`
- `admin/ChapterVerify::verify()`

当前可确认：
#### A. 新章首发 / 定时发布
- 作者端统一走 `author/Chapter::chapter()`
- 新章会直接写入 `chapter`
- 新章默认会写：
  - `verify = 0`
  - `verifytime = 9999`
- 如果是立即发布：
  - `status = 1`
- 如果是定时发布：
  - `status = 0`
  - `trial_time = 未来时间`
- 同时会直接 `Content::add()`

#### B. 已通过章节再修改
- 如果旧章当前 `verify = 1`
- 作者再改时，不直接覆盖正文
- 先把主表 `chapter.verify` 打回 `0`
- 再把新内容写入 `chapter_verify`
- 后续要走 `admin/ChapterVerify::verify()` 审核

结论：
- “新章首发”与“已通过章节再修改”，当前不是同一条审核链；
- 后续做作者中心、前台可见、长尾挂正文时，必须分别对待。

### 12B.5 定时发布与审核状态，当前不是一条完全闭合的链
已核代码：
- `author/Chapter::timerrelease()`
- 安装 SQL 里的 MySQL Event `timingRelease`
- `admin/Chapter::verify()`
- 前台 / API 多处取章条件

当前可确认：
- 定时发布先写：
  - `status = 0`
  - `trial_time > now`
  - `verify = 0`
  - `verifytime = 9999`
- MySQL Event 到时间后只会把：
  - `status = 1`
  - `trial_time = 0`
  - `create_time = now`
- 这个 Event **不会同步把 `verify` 改成 1**

同时已核：
- 后台“新章节审核”列表是：
  - `verifytime = 9999`
  - `trial_time = 0`
- 前台 / API 多处取章条件是：
  - `status = 1`
  - `verify in (0,1)`

基于代码可直接推出的结果：
- 定时章节到时后，会进入：
  - 前台可见候选集合
  - 后台“新章节审核”列表
- 也就是它当前可能同时处于：
  - 已对前台开放候选
  - 仍待后台审核

这是一条**代码级推导结论**，后续上线前非常值得实测。

### 12B.6 后台对“新章节审核”和“修改章节审核”本来就是两套入口
当前可确认：
- `admin/Chapter::verify()`
  - 看的是主表 `chapter`
  - 条件偏向 `verifytime = 9999` 的新章
- `admin/ChapterVerify::*`
  - 看的是 `chapter_verify`
  - 主要承接“已通过章节被修改后的待审内容”

`ChapterVerify::verify()` 当前还确认到：
- 审核通过时：
  - 主表 `chapter` 更新为 `verify = 1`
  - `trial_time = 0`
  - `Content::update(...)`
  - 然后删除 `chapter_verify` 记录
- 审核拒绝时：
  - 主表 `chapter` 更新为 `verify = 2`
  - 当前代码里 **没有同步删除 `chapter_verify` 记录**

结论：
- 当前后台审核分流是明确存在的；
- 而且“拒绝后 `chapter_verify` 是否保留”这件事，现在代码口径和“通过即删除”并不对称。

### 12B.7 作者端前端提交了 `adopt=1`，但当前控制器没消费它
已核代码：
- `author/view/chapter/chapter.html` 多处 AJAX 提交里带 `adopt=1`
- `author/controller/Chapter.php` 当前未看到对 `adopt` 的实际读取/分支处理

结论：
- 当前“立即过审”或类似语义，前端参数有痕迹，但后台主逻辑未真正接住；
- 后续不要把 `adopt=1` 当成已生效能力。

### 12B.8 `Content::delete()` 在文件模式下的删除口径不对称
已核代码：
- `extend/content/Content.php::delete()`

当前确认：
- 数据库存储模式下：
  - 会删 `chapter`
  - 会删 `chapter_draft`
  - 会删 `chapter_verify`
  - 会删正文表
- 文件存储模式下：
  - 如果文件不存在，会顺手删这些表记录
  - 但如果文件存在，当前分支只 `unlink($path)`，然后直接返回

结论：
- 文件模式下，`Content::delete()` 当前代码分支是不对称的；
- 若后续真走文件存储，这里值得单独标成风险点。

### 12B.9 `CacheService::remember()` 的默认值注释和实际值，当前确实不一致
已核代码：
- `CacheService::remember()`

当前确认：
- 没显式传 `$expire` 时：
  - 先读 store 配置
  - 配置没有就回退到 `86400`
- 代码注释写的是：
  - `默认 1 小时`

结论：
- 当前真实默认值是 **86400 秒（24 小时）**
- 注释口径确实错了，不是简单表述差异。

---

## 13A. 本轮对“最值得继续复测边界”的再收紧

1. **定时发布到点后是否会先前台可见，再后台待审**
   - 从代码看，存在这个可能；
   - 这是当前最关键的链路边界之一。

2. **`chapter.verify = 0` 在哪些前台页会被真实展示**
   - 详情页
   - 阅读页
   - 目录页
   - API 章节页
   - 搜索/推荐是否会间接带出来

3. **`chapter_verify` 拒绝后保留记录，会不会影响作者二次修改或后台再次审核**
   - 当前代码里“通过删、拒绝不删”不对称；
   - 这块后续值得继续扫。

4. **`Pages` 是否会成为最稳的长尾承载层**
   - 目前它已经具备：
     - 页面主表
     - 模板字段
     - 关键词挂接
     - API 查询
     - 前台直接渲染
   - 但后台模板来源仍锁在默认 PC 模板目录。

---

## 14A. 下一轮最适合继续深扫的顺序（v11 版）

### 第一优先：作者发章 → 定时发布 → 审核 → 前台可见
重点盯：
- `status`
- `verify`
- `verifytime`
- `trial_time`
- `draft`
- MySQL Event `timingRelease`

### 第二优先：`Pages` 作为长尾承载层的最小闭环
重点盯：
- `Pages`
- `PagesKeywords`
- `Keywords`
- `Route`
- `pages/default.html`
- 后台模板来源 vs 前台实际模板来源

### 第三优先：模板差异矩阵继续做成表格化口径
最值得继续压的维度：
- 首页
- 详情
- 阅读
- 搜索
- 排行
- Pages
- 公共头部
- 公共底部
- 评论块
- 用户中心块

### 第四优先：正文 / 缓存 / 采集边界
重点盯：
- `Content::get / add / update / delete`
- `CacheService`
- `auto_run_addons('collect', ...)`
- Web 章节页 vs API 章节页的正文差异

## 13. 还没完全收口、但范围已经很小的点

1. `Pages` 后台模板选择与 sitegroup 子站模板的真实关系  
2. `public/h5` 是否还有单独入口不走 `app/home/BaseController`  
3. 三套模板首页 / 详情 / 章节 / 搜索 / 排行的差异矩阵还可以再细一层  
4. `Common / Book / Chapter / Search` 的接口最小复用清单还可再压缩  
5. 作者端“定时发布 / 审核通过 / 前台可见”的最终切换点还可再补一层  
6. 长尾第一版如果引入 CRUD，表结构最小方案还没正式定稿
7. `chapter.status=1 + verify in (0,1)` 的前台可见边界，值得下轮单独复测  

---

## 14. 后续“一次尽量扫完”的扫描计划（加强版）

### 第一阶段：前台成页最终收口
目标：把“页面到底怎么出来的”一次拉直
- 首页
- 小说详情页
- 章节页
- 搜索页
- 排行页
- Pages 页
- 公告 / 资讯页

### 第二阶段：模板差异矩阵
目标：把三套模板差异整理成最容易查阅的矩阵
维度：
- 首页
- 详情页
- 章节页
- 搜索页
- Pages 页
- 公共头部
- 公共底部
- 评论块
- 用户块

### 第三阶段：资源接口最小复用清单
优先看：
- `Common::recommend`
- `Common::pages`
- `Common::system`
- `Book::detail`
- `Book::booklist`
- `Chapter::detail`
- `Search::index`
- `Search::keywords`
- `Category::bigcate / smallcate`

### 第四阶段：作者生产链与前台可见边界
优先看：
- `author/Book`
- `author/Chapter`
- `admin/Chapter`
- `chapter / chapter_verify / chapter_draft`
- `Content`
- 前台 / API 取数条件里的 `status + verify + trial_time`

### 第五阶段：缓存 / 正文 / 采集边界
优先看：
- `CacheService`
- `Novel`
- `Chapter`
- `home/Chapter`
- `Content`
- `auto_run_addons('collect', ...)`

### 第六阶段：长尾系统第一版落点
优先围绕：
- `Pages`
- `Keywords`
- `PagesKeywords`
- `Route`
- 模板 `pages/*`
- CRUD 后台扩展

---

## 15. 当前最适合 AI 自己继续看的阅读顺序

1. 本文件：`00_feiniao_ai_all_in_one_v11.md`
2. `02_current_confirmed_facts_v11.md`
3. `飞鸟系统扫描文档草案_v1_v11.md`
4. `03_next_round_checklist_v11.md`
5. `01_ai_handoff_master_v11.md`

说明：
- 后续继续扫描时，优先以本文件为总口径；
- 其他文档分别承担：
  - 主交接
  - 纯事实
  - 清单
  - 展开扫描稿


## 12C. Pages / 长尾承载链专项深扫（v12）

### 12C.1 当前“承载页”其实至少有 4 种使用口径，不是只有一条 `page-:name`
这轮只盯 `Pages / 长尾承载链` 后，当前已能确认飞鸟里至少同时存在 4 种“页面承载”方式：

1. **泛单页路由**
   - 路由名：`pages`
   - 安装默认规则：`page-:name`
   - 控制器：`app/home/controller/Pages.php::detail()`
   - 典型形态：`/page-contactus.html`

2. **模板内直查 Pages 内容**
   - 不是走 `home/Pages::detail()`
   - 而是模板里直接 `model('pages')->where(['status' => 1, 'name' => 'xxx'])->value('content')`
   - 已核到典型名称：
     - `about`
     - `agreement`
     - `privacy`

3. **API 页面查询**
   - `app/api/controller/v1/Common.php::pages()`
   - 通过 `name` 参数取 `pages` 表，且明确带 `status = 1`

4. **导航 / 页面配置里写死链接**
   - 安装数据里的 `nav_info.src` 已出现：
     - `/home/page-contactus.html`
     - `/home/page-homeai.html`
     - `/home/page-homecoin.html`
   - 这说明“页面地址输出”当前并不是所有地方都统一通过 `furl('pages', ...)` 生成

结论：
- 当前飞鸟并不存在“唯一、纯净、唯一入口”的单页系统；
- `Pages` 既是前台承载表，也是模板嵌入式内容来源；
- 后面做长尾时，必须区分：
  - **走泛单页落地页**
  - **走模板内嵌内容块**
  这两类不能混为一谈。

### 12C.2 `Pages.template` 当前本质上不是任意模板路径，而是“当前主题下 `pages/*.html` 的文件名槽位”
已核代码：
- `admin/Pages::add()/edit()`
- `get_file_list()`
- `home/Pages::detail()`

当前确认：
- 后台模板下拉框只扫：
  - `template/<theme.template_pc>/pages/*.html`
- `get_file_list()` 返回的是 `pathinfo`
- 下拉框实际写入的是 `filename`
  - 例如 `default`
  - 不是完整路径 `pages/default`
- 前台 `home/Pages::detail()` 最后是：
  - `view($detail['template'])`

结合控制器名 `Pages` 可判断：
- 当前保存的 `template = default`，前台实际解析的是当前主题下的：
  - `pages/default.html`

结论：
- `Pages.template` 当前不是可自由填任意模板路径的字段；
- 它本质上是一个 **controller-relative 的 `pages/*.html` 模板槽位**；
- 后面长尾专题如果沿用 `Pages`，最稳的做法仍是围绕 `pages/*.html` 这一层设计，而不是把它当任意页面模板指针。

### 12C.3 后台模板来源与前台实际主题来源，当前仍是错位的
已核代码：
- 后台：
  - `admin/Pages::add()/edit()`
- 前台：
  - `home/BaseController::view_path()`
  - `home/Pages::detail()`

当前确认：
- 后台给 Pages 选模板时，只看：
  - `theme.template_pc`
- 前台真正渲染 Pages 时，取决于：
  - sitegroup 子站命中的 `template_pc / template_mobile`
  - 或总站 `theme.template_pc / template_mobile`
- 当前源码包三套模板都存在：
  - `template/default_mobile/pages/default.html`
  - `template/default_pc/pages/default.html`
  - `template/tadu_pc/pages/default.html`

所以当前状态是：
- 现有 `default` 槽位在三套模板里都能落下去，暂时不炸；
- 但后台模板来源和前台真实主题来源，逻辑上仍不是同一口径。

结论：
- 这也是为什么 `Pages` 适合作为长尾第一版承载层，但不适合直接被当成“完全成熟的多模板页面系统”。

### 12C.4 `Pages.name` 与路由正则当前存在一个隐藏边界
已核代码：
- 后台校验：`app/admin/validate/PagesValidate.php`
- 前台路由：`app/home/route/app.php`

当前确认：
- 后台对 `name` 的限制是：
  - `lower`
  - `min:3`
  - `unique:pages`
- 前台 `pages` 路由对 `name` 的 pattern 是：
  - `[a-z-]+`

这意味着：
- 后台没有显式限制只能是 `a-z-`
- 但前台路由只接受：
  - 小写字母
  - 连字符 `-`
- 如果后面后台录入了数字、下划线等名字，即使数据库能存，前台泛单页路由也未必能命中。

结论：
- 后续如果要把 `Pages` 扩成长尾落地页主承载，`slug/name` 规则必须收口；
- 要么后台严格限制为 `a-z-`
- 要么前台路由 pattern 放宽；
- 否则后面很容易出现“后台有页、前台路由打不开”的隐性问题。

### 12C.5 `Pages` 当前没有独立 SEO 字段，更像轻量承载表
已核表结构：
- `fn_pages`

当前字段只有：
- `title`
- `thumb`
- `banner`
- `desc`
- `content`
- `status`
- `read`
- `sort`
- `name`
- `template`
- `admin_id`
- `create_time / update_time / delete_time`

当前没看到独立字段：
- `seo_title`
- `seo_keywords`
- `seo_description`
- `canonical`
- `robots`
- `page_type`
- `route_name`

结论：
- `Pages` 现在更像轻量型“页面内容表”
- 不是完整 SEO 落地页系统
- 这也是为什么当前更稳的第一版长尾结构，仍然应该是：
  - `Longtail主表 + Pages承载 + PagesKeywords挂词 + Route输出 + pages模板`

### 12C.6 `PagesKeywords` 当前适合做挂词关系，但还不是完整长尾关系表
已核代码 / 表：
- `admin/model/Pages.php`
- `fn_pages_keywords`

当前可确认：
- 作用是：
  - `aid` 关联页面
  - `keywords_id` 关联关键词
- 当前没有这些能力：
  - 排序权重
  - 主次词位
  - 命中类型
  - 词模板
  - 词级别
  - SEO覆盖字段

结论：
- `PagesKeywords` 适合作为第一版“页面挂基础词池”的关系层
- 但不适合作为未来完整长尾主关系表
- 后续如果长尾升级，仍建议把更复杂的字段放进独立 `Longtail` 主表或专门关系表

### 12C.7 当前安装数据已说明：部分页面地址并不是通过统一 route 输出层动态生成
已核数据：
- `fn_nav_info` 安装记录

已确认存在：
- `联系我们` -> `/home/page-contactus.html`
- `homeai` -> `/home/page-homeai.html`
- `homecoin` -> `/home/page-homecoin.html`

这说明：
- 当前页面地址至少有一部分是在导航/配置数据里**直接写死 URL**
- 不是全部由：
  - `route`
  - `furl('pages', ['name' => ...])`
 统一生成

结论：
- 如果后面做长尾页地址标准化，不能只改 route 表；
- 还要同时排查：
  - nav
  - sitegroup nav
  - 模板硬编码链接
  - 配置里写死的链接

### 12C.8 当前更稳的判断：`Pages` 是长尾第一版的“承载层”，不是“长尾主业务层”
综合这轮专项深扫，当前更稳的结论是：

- `Pages` 适合做：
  - 前台专题 / 落地页承载
  - 简单静态内容页承载
  - 页面挂基础关键词
  - 页面级模板切换入口
- `Pages` 不适合直接承担：
  - 长尾主业务数据
  - 复杂 SEO 字段体系
  - 多层 URL 规则
  - 大规模批量生成调度
  - 页面状态与词状态的复杂联动

所以当前最稳的长尾第一版落点，仍然是：

**Longtail主表 + Pages承载 + PagesKeywords挂词 + Keywords词池 + Route输出 + pages模板展示**

其中：
- `Longtail主表`：业务与 SEO 主数据
- `Pages`：前台页面承载
- `PagesKeywords`：基础挂词
- `Route`：地址输出
- `pages/*.html`：模板展示层

---


## 12D. Pages / 长尾承载链再收口（v13）

### 12D.1 当前单页体系其实是“双轨并存”，不是单一 `pages` 路由
这轮继续深扫后，已确认当前至少并存两类“单页展示链”：

1. **通用单页链**
   - 路由：`pages`
   - 默认安装 rule：`page-:name`
   - 控制器：`app/home/controller/Pages.php::detail()`
   - 取数：按 `name` 从 `pages` 表取详情
   - 渲染：`view($detail['template'])`

2. **专用单页链**
   - 路由名：`about` / `agreement` / `privacy`
   - 控制器：`app/home/controller/User.php`
   - 这些方法本身基本只是 `return view()`
   - 真正的页面正文，再由对应模板里直接：
     - `model('pages')->where(['status' => 1, 'name' => 'about'])`
     - `model('pages')->where(['status' => 1, 'name' => 'agreement'])`
     - `model('pages')->where(['status' => 1, 'name' => 'privacy'])`
     去取

结论：
- 当前系统里，“单页”不是只靠 `page-:name -> Pages::detail()` 一条链。
- `about / agreement / privacy` 这类专用页，本质上是：
  **专用 route + 专用 controller/view + 模板内再手查 pages 表**。

### 12D.2 目前没有发现现成的 `furl('pages', ['name' => ...])` 大量复用
本轮继续全文检索后，当前源码里**没有搜到现成的 `furl('pages', ...)` 调用样例**。

当前更常见的几种做法反而是：
- 直接依赖路由表里的 `page-:name`
- 导航表里直接写死 `/home/page-about.html` 一类 URL
- 专用 route：`about / agreement / privacy`
- 模板内直接查 `pages` 表

这说明：
- 当前 `pages` 这条链，并没有形成“全站统一通过 `furl('pages', ...)` 生成地址”的成熟口径；
- 后面如果调整 Pages 路由规则，不能假设现有导航 / 模板 / 配置会自动跟着适配。

### 12D.3 sitegroup 当前复制的是“导航结果”，不是“Pages 地址生成逻辑”
这轮把 `sitegroup` 的导航链又核了一遍，已确认：

- 子站创建时，`addons/sitegroup/controller/Site.php` 会把总站 `nav_info` 直接复制进 `addons_site_nav`
- `addons/sitegroup/Plugin.php::getNavData()` 返回的也是 `addons_site_nav` 里的 `src`
- 当前这层没有看到“按当前 route name 重新 build Pages URL”的逻辑

结合安装数据：
- `关于我们` -> `/home/page-about.html`
- `用户协议` -> `/home/page-agreement.html`
- `隐私政策` -> `/home/page-privacy.html`
- `联系我们` -> `/home/page-contactus.html`
- `homeai` -> `/home/page-homeai.html`
- `homecoin` -> `/home/page-homecoin.html`

结论：
- sitegroup 子站层现在拿到的是“已写死的导航 src”，不是“运行时重新生成的 Pages 地址”；
- 后面如果长尾页地址规则变更，**总站 nav、子站 nav 都要一起排查**。

### 12D.4 `Pages.template` 当前可用模板槽位仍很少
这轮再核模板目录后，当前三套主题下 `pages/` 目录都只明确看到：

- `template/default_mobile/pages/default.html`
- `template/default_pc/pages/default.html`
- `template/tadu_pc/pages/default.html`

说明：
- `Pages.template` 这一层现在虽然是模板槽位，但实际可选文件仍非常少；
- 当前更像“统一承载模板 + 数据差异”的结构；
- 不像一套已经成熟展开的多页面专题模板体系。

这也进一步支持：
- 第一版长尾更适合：
  - 让 `Pages` 负责承载
  - 让 `Longtail` 主表负责业务/SEO
  - 让 `pages/default.html` 一类模板先吃统一字段
- 而不是一开始就把大量复杂逻辑压进 `Pages.template` 本身。

### 12D.5 对长尾第一版更稳的落地建议（基于当前源码）
结合 v12 + 本轮补扫，当前更稳的判断进一步收口为：

1. **不要直接复用 `about / agreement / privacy` 这类专用 route 当长尾模板**
   - 这些 route 已经带有既定页面语义
   - 模板里也写死了按特定 `name` 取页

2. **普通长尾页优先走通用承载链**
   - `Longtail主表`
   - `Pages`
   - `PagesKeywords`
   - `Keywords`
   - `Route`
   - `pages/*.html`

3. **地址输出层要单独当一层考虑**
   - 因为当前：
     - route 表
     - addons_site_route
     - nav_info
     - addons_site_nav
     - 模板硬编码
     是并存的，不是单点控制

4. **`Pages` 更适合当“最终渲染页容器”**
   - 承担正文承载
   - 承担基础关键词挂接
   - 承担模板槽位
   - 不承担复杂业务主数据

一句话收口：
**飞鸟当前最稳的第一版长尾方案，仍然不是“直接把 Pages 改造成长尾系统”，而是“Longtail 主表驱动，Pages 做承载层，Route 做地址层”。**

## 14C. 现在 Pages / 长尾承载链还剩下的尾巴（范围已很小）

1. `page-:name` 这条泛单页路由在 sitegroup 子站里是否有实际差异化 rule 样例  
2. 当前哪些模板 / 导航 / 配置里还直接写死了 Pages URL  
3. 后续长尾如果走多级 path，现有 `pages` 路由是否需要新 name，而不是复用 `pages`  
4. `Pages.read` 是否值得继续保留在长尾第一版里当基础统计字段  
5. `Pages.status` 当前前台未拦，后续是否应在落地页承载层补齐统一状态判断

---

## 14D. 下一步最合适的方向（已按用户新口径收窄）

后续不再优先扫作者发布链，优先级改成：

### 第一优先
- `Pages / 长尾承载链`
- 目标：
  - 把“后台怎么配、前台怎么出、模板怎么接、Route 怎么落地址”彻底收死

### 第二优先
- 页面地址输出层
- 重点盯：
  - `route`
  - `addons_site_route`
  - `nav / addons_site_nav`
  - 模板硬编码 URL
  - `furl('pages', ...)`

### 第三优先
- 长尾第一版最小表结构设计
- 目标：
  - 在不大改现有系统的前提下，设计最稳的 `Longtail主表 + Pages承载` 方案
