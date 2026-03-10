<?php

namespace addons\sitegroup\controller;

use think\facade\Request;
use think\facade\Db;
use think\facade\Session;
use think\facade\View;
use think\facade\Validate;

class Route
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

    // 获取指定站点的路由列表
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
        return view(app()->getRootPath() . 'addons' . DIRECTORY_SEPARATOR . $this->addons_name . DIRECTORY_SEPARATOR . 'view' . DIRECTORY_SEPARATOR . 'route.html');
    }

    /**
     * 获取单个站点路由
     * 
     * @return \think\response\Json
     */
    public function get()
    {
        self::auth();
        $site_id = Request::param('site_id');
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $page = Request::param('page', 1);
        $limit = Request::param('limit', 10);
        $keyword = Request::param('keyword', '');
        $query = Db::name('addons_site_route')->where('site_id', $site_id);
        if (!empty($keyword)) {
            $query->whereLike('title', "%{$keyword}%");
        }
        $total = $query->count();
        $list = $query->page($page, $limit)
            ->order('id', 'asc')
            ->select();
        return json([
            'code' => 0,
            'count' => $total,
            'data' => $list
        ])->header(['Content-Type' => 'application/json']);
    }

    public function edit()
    {
        self::auth();
        $data = Request::only([
            'id',
            'group',
            'rule',
            'site_id',
            'status'
        ]);
        $validate = Validate::rule([
            'id' => 'require|number',
            'site_id' => 'require|number',
            'rule' => 'require|max:250',
            'group' => 'max:30',
            'status' => 'require|in:0,1'
        ]);
        if (!$validate->check($data)) {
            return to_assign(1, $validate->getError());
        }
        $query = Db::name('addons_site_route')->where('site_id', $data['site_id'])->where('rule', $data['rule'])->where('id', '<>', $data['id']);
        if ($query->count() > 0) {
            return to_assign(1, '该站点下路由规则已存在');
        }
        // 更新数据
        $result = Db::name('addons_site_route')
            ->where('id', $data['id'])
            ->update([
                'group' => $data['group'],
                'rule' => $data['rule'],
                'status' => $data['status']
            ]);
        if ($result !== false) {
            $cacheKey = "site_route_" . $data['site_id'];
            clear_cache($cacheKey);
            clear_cache('routeRule');
            return to_assign();
        } else {
            return to_assign(1, lang('fail'));
        }
    }

    public function synch()
    {
        self::auth();
        $site_id = Request::param('site_id/d', 0);
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $route = Db::name('route')->field('rule,title,group,value,status,name')->select()->column(null, 'name');
        $list = Db::name('addons_site_route')->field('rule,title,group,value,status,name')->where('site_id', $site_id)->select()->column(null, 'name');
        Db::startTrans();
        try {
            foreach ($route as $key => $value) {
                if (!isset($list[$value['name']])) {
                    $data = array_merge($value, ['site_id' => $site_id]);
                    Db::name('addons_site_route')->strict(false)->field(true)->insert($data);
                }
            }
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
