<?php

namespace addons\sitegroup\controller;

use think\facade\Db;
use think\facade\Request;
use think\facade\Validate;
use think\facade\Session;

class Site
{
    // 初始化
    public function __construct() {}

    private static function auth()
    {
        $session_admin = get_config('app.session_admin');
        if (!Session::has($session_admin)) {
            die;
        }
    }

    // 站点列表（支持分页和搜索）
    public function index()
    {
        self::auth();
        $page = Request::param('page', 1);
        $limit = Request::param('limit', 10);
        $keyword = Request::param('keyword', '');
        $query = Db::name('addons_site_group');
        if (!empty($keyword)) {
            $query->whereLike('domain|site_name', "%{$keyword}%");
        }
        $total = $query->count();
        $list = $query->page($page, $limit)
            ->order('site_id', 'desc')
            ->select();
        return json([
            'code' => 0,
            'count' => $total,
            'data' => $list
        ])->header(['Content-Type' => 'application/json']);
    }

    // 添加站点
    public function add()
    {
        self::auth();
        $data = Request::only([
            'domain',
            'site_name',
            'template_pc',
            'template_mobile',
            'logo',
            'cover',
            'avatar',
            'favicon',
            'app_qrcode',
            'icp',
            'police_icp',
            'copyright',
            'statistics',
            'status'
        ]);
        // 验证数据
        $validate = Validate::rule([
            'domain' => 'require|unique:addons_site_group',
            'site_name' => 'require|max:100',
            'template_pc' => 'require|max:50',
            'template_mobile' => 'require|max:50',
            'status' => 'in:0,1'
        ]);
        if (!$validate->check($data)) {
            return to_assign(1, $validate->getError());
        }
        // 添加创建时间
        $data['create_time'] = time();
        Db::startTrans();
        try {
            $site_id = Db::name('addons_site_group')->strict(false)->field(true)->insertGetId($data);
            $route = Db::name('route')->field('rule,title,group,value,status,name')->where('status', 1)->select()->toArray();
            if ($route) {
                $fixedData = ['site_id' => $site_id];
                $data = array_map(function ($item) use ($fixedData) {
                    return array_merge($item, $fixedData);
                }, $route);
                Db::name('addons_site_route')->insertAll($data);
            }
            $seoConf = get_system_config('seo');
            if (!empty($seoConf)) {
                unset($seoConf['id']);
                foreach ($seoConf as $key => $value) {
                    $data = [
                        'site_id' => $site_id,
                        'key' => $key,
                        'value' => $value,
                    ];
                    Db::name('addons_site_config')->strict(false)->field(true)->insert($data);
                }
            }
            $nav = Db::name('nav_info')->field('nav_id,title,src,param,target,status,sort,create_time,update_time')->where('status', 1)->select()->toArray();
            if ($nav) {
                $fixedData = ['site_id' => $site_id];
                $data = array_map(function ($item) use ($fixedData) {
                    return array_merge($item, $fixedData);
                }, $nav);
                Db::name('addons_site_nav')->insertAll($data);
            }
            $links = Db::name('links')->field('name,logo,src,target,status,sort,create_time,update_time')->where('status', 1)->select()->toArray();
            if ($links) {
                $fixedData = ['site_id' => $site_id];
                $data = array_map(function ($item) use ($fixedData) {
                    return array_merge($item, $fixedData);
                }, $links);
                Db::name('addons_site_links')->insertAll($data);
            }
            Db::commit();
            clear_cache('site_group_all');
            return json(['code' => 0, 'msg' => lang('success')])->header(['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            Db::rollback();
            return json([
                'code' => 1,
                'msg' => $e->getMessage()
            ])->header(['Content-Type' => 'application/json']);
        }
    }

    // 编辑站点
    public function edit()
    {
        self::auth();
        $data = Request::only([
            'site_id',
            'domain',
            'site_name',
            'template_pc',
            'template_mobile',
            'logo',
            'cover',
            'avatar',
            'favicon',
            'app_qrcode',
            'icp',
            'police_icp',
            'copyright',
            'statistics',
            'status'
        ]);
        // 验证数据
        $validate = Validate::rule([
            'site_id' => 'require|number',
            'domain' => 'require|unique:addons_site_group,domain,' . $data['site_id'] . ',site_id',
            'site_name' => 'require|max:100',
            'template_pc' => 'require|max:50',
            'template_mobile' => 'require|max:50',
            'status' => 'in:0,1'
        ]);
        if (!$validate->check($data)) {
            return to_assign(1, $validate->getError());
        }
        $site = Db::name('addons_site_group')->where('site_id', $data['site_id'])->find();
        if (empty($site)) {
            return to_assign(1, lang('empty'));
        }
        // 更新数据
        $result = Db::name('addons_site_group')
            ->where('site_id', $data['site_id'])
            ->update([
                'domain' => $data['domain'],
                'site_name' => $data['site_name'],
                'template_pc' => $data['template_pc'],
                'template_mobile' => $data['template_mobile'],
                'status' => $data['status'],
                'logo' => $data['logo'],
                'cover' => $data['cover'],
                'avatar' => $data['avatar'],
                'favicon' => $data['favicon'],
                'app_qrcode' => $data['app_qrcode'],
                'icp' => $data['icp'],
                'police_icp' => $data['police_icp'],
                'copyright' => $data['copyright'],
                'statistics' => $data['statistics']
            ]);

        if ($result !== false) {
            $cacheKey = "site_" . $site['domain'];
            clear_cache('site_group_all');
            clear_cache($cacheKey);
            return to_assign();
        } else {
            return to_assign(1, lang('fail'));
        }
    }

    // 删除站点
    public function delete()
    {
        self::auth();
        $id = Request::param('id');
        if (empty($id)) {
            return to_assign(1, lang('empty'));
        }
        $site = Db::name('addons_site_group')->where('site_id', $id)->find();
        if (empty($site)) {
            return to_assign(1, lang('empty'));
        }
        Db::startTrans();
        try {
            Db::name('addons_site_group')
                ->where('site_id', $id)
                ->delete();
            Db::name('addons_site_route')
                ->where('site_id', $id)
                ->delete();
            Db::name('addons_site_config')
                ->where('site_id', $id)
                ->delete();
            Db::commit();
            clear_cache('site_group_all');
            $cacheKey = "site_" . $site['domain'];
            clear_cache($cacheKey);
            return json(['code' => 0, 'msg' => lang('success')])->header(['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            // 回滚事务
            Db::rollback();
            return json([
                'code' => 1,
                'msg' => $e->getMessage()
            ])->header(['Content-Type' => 'application/json']);
        }
    }
}
