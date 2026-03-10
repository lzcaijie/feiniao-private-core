<?php

namespace addons\sitegroup\controller;

use think\facade\Db;
use think\facade\Request;
use think\facade\Validate;
use think\facade\Session;
use think\facade\View;

class Links
{
    // 配置信息
    private $addons_name = 'sitegroup';

    // 初始化
    public function __construct() {}

    private static function auth()
    {
        $session_admin = get_config('app.session_admin');
        if (!Session::has($session_admin)) {
            die;
        }
    }

    // 友链列表（支持分页和搜索）
    public function list()
    {
        self::auth();
        $site_id = Request::param('site_id/d', 0);
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $page = Request::param('page', 1);
        $limit = Request::param('limit', 10);
        $keyword = Request::param('keyword', '');
        $query = Db::name('addons_site_links')->where('site_id', $site_id);
        if (!empty($keyword)) {
            $query->whereLike('name|src', "%{$keyword}%");
        }
        $total = $query->count();
        $list = $query->page($page, $limit)
            ->order('sort desc')
            ->select();
        return json([
            'code' => 0,
            'count' => $total,
            'data' => $list
        ])->header(['Content-Type' => 'application/json']);
    }

    public function index()
    {
        self::auth();
        $site_id = Request::param('site_id/d', 0);
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $site = Db::name('addons_site_group')->where('site_id', $site_id)->find();
        View::assign('site', $site);
        View::assign('site_id', $site_id);
        return view(app()->getRootPath() . 'addons' . DIRECTORY_SEPARATOR . $this->addons_name . DIRECTORY_SEPARATOR . 'view' . DIRECTORY_SEPARATOR . 'links.html');
    }

    // 添加友链
    public function add()
    {
        self::auth();
        $data = Request::only([
            'name',
            'logo',
            'src',
            'target',
            'sort',
            'status',
            'site_id'
        ]);
        // 验证数据
        $validate = Validate::rule([
            'name' => 'require|max:200',
            'src' => 'require|max:200',
            'site_id' => 'require|number',
            'status' => 'in:0,1',
            'target' => 'in:0,1'
        ]);
        if (!$validate->check($data)) {
            return to_assign(1, $validate->getError());
        }
        // 添加创建时间
        $data['create_time'] = time();
        Db::startTrans();
        try {
            Db::name('addons_site_links')->strict(false)->field(true)->insertGetId($data);
            Db::commit();
            return json(['code' => 0, 'msg' => lang('success')])->header(['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            Db::rollback();
            return json([
                'code' => 1,
                'msg' => $e->getMessage()
            ])->header(['Content-Type' => 'application/json']);
        }
    }

    // 编辑友链
    public function edit()
    {
        self::auth();
        $data = Request::only([
            'id',
            'name',
            'logo',
            'src',
            'target',
            'sort',
            'status',
        ]);
        // 验证数据
        $validate = Validate::rule([
            'id' => 'require|number',
            'name' => 'require|max:200',
            'src' => 'require|max:200',
            'status' => 'in:0,1',
            'target' => 'in:0,1'
        ]);
        if (!$validate->check($data)) {
            return to_assign(1, $validate->getError());
        }
        $site = Db::name('addons_site_links')->where('id', $data['id'])->find();
        if (empty($site)) {
            return to_assign(1, lang('empty'));
        }
        // 更新数据
        $result = Db::name('addons_site_links')
            ->where('id', $data['id'])
            ->update([
                'name' => $data['name'],
                'src' => $data['src'],
                'sort' => $data['sort'],
                'target' => $data['target'],
                'status' => $data['status'],
                'update_time' => time(),
            ]);
        if ($result !== false) {
            $cacheKey = "site_links_" . $site['site_id'];
            clear_cache($cacheKey);
            return to_assign();
        } else {
            return to_assign(1, lang('fail'));
        }
    }

    // 删除友链
    public function delete()
    {
        self::auth();
        $id = Request::param('id');
        if (empty($id)) {
            return to_assign(1, lang('empty'));
        }
        $site = Db::name('addons_site_links')->where('id', $id)->find();
        if (empty($site)) {
            return to_assign(1, lang('empty'));
        }
        Db::startTrans();
        try {
            Db::name('addons_site_links')
                ->where('id', $id)
                ->delete();
            Db::commit();
            return json(['code' => 0, 'msg' => lang('success')])->header(['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            Db::rollback();
            return json([
                'code' => 1,
                'msg' => $e->getMessage()
            ])->header(['Content-Type' => 'application/json']);
        }
    }
}
