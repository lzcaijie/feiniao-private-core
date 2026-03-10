<?php

namespace addons\sitegroup\controller;

use think\facade\Request;
use think\facade\Db;
use think\facade\Session;
use think\facade\View;

class Config
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

    // 获取指定站点的配置列表
    public function index()
    {
        self::auth();
        $site_id = Request::param('site_id/d', 0);
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $site = Db::name('addons_site_group')->where('site_id', $site_id)->find();
        $config = Db::name('addons_site_config')->field('key,value')->where('site_id', $site_id)->select()->toArray();
        $config = array_column($config, 'value', 'key');
        View::assign('site', $site);
        View::assign('site_id', $site_id);
        View::assign('config', $config);
        return view(app()->getRootPath() . 'addons' . DIRECTORY_SEPARATOR . $this->addons_name . DIRECTORY_SEPARATOR . 'view' . DIRECTORY_SEPARATOR . 'config.html');
    }

    public function test()
    {
        self::auth();
        $param = get_params();
        $type = $param['type'];
        if (empty($type)) {
            return to_assign(1, lang('empty'));
        }
        $site_id = $param['site_id'];
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $site = Db::name('addons_site_group')
            ->field('site_id,template_pc,template_mobile,logo,app_qrcode as appqr,site_name as title,site_name as admin_title,icp,police_icp as beian,statistics as code,copyright,domain')
            ->where('site_id', $site_id)
            ->find();
        if (empty($site)) {
            return to_assign(1, lang('empty'));
        }
        $res = [];
        $config = Db::name('addons_site_config')->field('key,value')->where('site_id', $site_id)->select()->toArray();
        if (empty($config)) {
            return to_assign(1, lang('empty'));
        }
        $seoConfig = array_column($config, 'value', 'key');
        app()->instance('feiniaoseo', $seoConfig);
        app()->instance('feiniaowebconfig', $site);
        unset($param['site_id'], $param['type'], $param['addon'], $param['controller'], $param['action'], $param['s']);
        foreach ($param as $key => $value) {
            $res[$key] = '';
            if (empty($value)) {
                continue;
            }
            $res[$key] = get_seo_str($type, $key, $value, []);
        }
        return table_assign(0, '', ['data' => implode('<hr class="layui-border-green">', $res)]);
    }

    public function edit()
    {
        self::auth();
        $param = get_params();
        if (empty($param)) {
            return to_assign(1, lang('empty'));
        }
        $site_id = $param['site_id'];
        unset($param['site_id'], $param['s'], $param['addon'], $param['controller'], $param['action']);
        $site = Db::name('addons_site_group')->where('site_id', $site_id)->find();
        if (empty($site)) {
            return to_assign(1, lang('empty'));
        }
        try {
            foreach ($param as $key => $value) {
                Db::name('addons_site_config')
                    ->where('site_id', $site_id)
                    ->where('key', $key)
                    ->update(['value' => $value]);
            }
            Db::commit();
            $cacheKey = "site_seo_{$site_id}";
            clear_cache($cacheKey);
            return json(['code' => 0, 'msg' => lang('success')])->header(['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            Db::rollback();
            return json([
                'code' => 1,
                'msg' => $e->getMessage()
            ])->header(['Content-Type' => 'application/json']);
        }
    }

    public function synch()
    {
        self::auth();
        $site_id = Request::param('site_id/d', 0);
        if (empty($site_id)) {
            return to_assign(1, lang('empty'));
        }
        $list = Db::name('addons_site_config')->field('key,value')->where('site_id', $site_id)->select()->column(null, 'key');
        if (empty($list)) {
            return to_assign(1, lang('empty'));
        }
        $config = array_column($list, 'value', 'key');
        $seoConf = get_system_config('seo');
        if (!empty($seoConf)) {
            unset($seoConf['id']);
            Db::startTrans();
            try {
                foreach ($seoConf as $key => $value) {
                    if (!isset($config[$key])) {
                        Db::name('addons_site_config')->strict(false)->field(true)->insert(['site_id' => $site_id, 'key' => $key, 'value' => $value]);
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
}
