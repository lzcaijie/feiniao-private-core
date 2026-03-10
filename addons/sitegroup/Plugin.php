<?php

namespace addons\sitegroup;

use think\Addons;
use think\facade\Db;
use think\facade\Request;

class Plugin extends Addons
{
    // 缓存站点配置（避免重复查询）
    protected static $sites = null;

    public function install()
    {
        return true;
    }

    public function uninstall()
    {
        return true;
    }

    /**
     * 获取所有站点配置（带缓存）
     */
    protected static function getAllSites()
    {
        $cacheKey = "site_group_all";
        $sites = get_cache($cacheKey);
        if (empty($sites)) {
            $sites = Db::name('addons_site_group')
                ->field('site_id,template_pc,template_mobile,logo,avatar,cover,favicon,app_qrcode as appqr,site_name as title,site_name as admin_title,icp,police_icp as beian,statistics as code,copyright,domain')
                ->where('status', 1)
                ->orderRaw('LENGTH(domain) DESC')
                ->select()
                ->toArray();
            set_cache($cacheKey, $sites);
        }
        return $sites;
    }

    /**
     * 获取当前匹配的站点
     */
    protected static function getCurrentSite()
    {
        $currentHost = Request::host();
        $cacheKey = "site_{$currentHost}";
        $currentSite = get_cache($cacheKey);
        if ($currentSite) {
            return $currentSite;
        }
        $sites = self::getAllSites();
        // 首先尝试完全匹配
        foreach ($sites as $site) {
            if ($site['domain'] === $currentHost) {
                set_cache($cacheKey, $site);
                return $site;
            }
        }
        // 然后尝试通配符匹配
        foreach ($sites as $site) {
            if (strpos($site['domain'], '*') !== false) {
                $pattern = self::wildcardToRegex($site['domain']);
                if (preg_match($pattern, $currentHost)) {
                    set_cache($cacheKey, $site);
                    return $site;
                }
            }
        }
        // 最后尝试子域名匹配（新增的逻辑）
        // 将当前域名拆分为各部分
        $hostParts = explode('.', $currentHost);
        $hostPartsCount = count($hostParts);
        // 从最具体的子域名开始尝试匹配（例如 www.domain.com
        for ($i = 0; $i < $hostPartsCount - 1; $i++) {
            $testDomain = implode('.', array_slice($hostParts, $i));            
            foreach ($sites as $site) {
                // 跳过通配符域名，因为它们已经在上面处理过了
                if (strpos($site['domain'], '*') !== false) {
                    continue;
                }                
                if ($site['domain'] === $testDomain) {
                    set_cache($cacheKey, $site);
                    return $site;
                }
            }
        }        
        return null;
    }

    /**
     * 通配符转正则表达式
     */
    protected static function wildcardToRegex($pattern)
    {
        $pattern = preg_quote($pattern, '/');
        $pattern = str_replace('\*', '.*', $pattern);
        return '/^' . $pattern . '$/i';
    }

    /**
     * 获取当前站点SEO配置
     */
    protected static function getSeoConfig($site_id)
    {
        if (empty($site_id)) {
            return false;
        }
        $cacheKey = "site_seo_{$site_id}";
        $seoConfig = get_cache($cacheKey);
        if ($seoConfig) {
            return $seoConfig;
        }
        $config = Db::name('addons_site_config')->field('key,value')->where('site_id', $site_id)->select()->toArray();
        if (empty($config)) {
            return false;
        }
        $seoConfig = array_column($config, 'value', 'key');
        set_cache($cacheKey, $seoConfig);
        return $seoConfig;
    }

    /**
     * 获取当前站点路由
     */
    protected static function getRoute($site_id)
    {
        if (empty($site_id)) {
            return false;
        }
        $cacheKey = "site_route_{$site_id}";
        $routeConfig = get_cache($cacheKey);
        if ($routeConfig) {
            return $routeConfig;
        }
        $routeConfig = Db::name('addons_site_route')->field('id,rule,group,name')->where('status', 1)->where('site_id', $site_id)->select()->toArray();
        if (empty($routeConfig)) {
            return false;
        }
        set_cache($cacheKey, $routeConfig);
        return $routeConfig;
    }

    /**
     * 获取当前站点友链
     */
    protected static function getLinks($site_id)
    {
        if (empty($site_id)) {
            return false;
        }
        $cacheKey = "site_links_{$site_id}";
        $links = get_cache($cacheKey);
        if ($links) {
            return $links;
        }
        $links = Db::name('addons_site_links')->field('name,logo,src,target')->where('status', 1)->where('site_id', $site_id)->order('sort desc')->select()->toArray();
        if (empty($links)) {
            return false;
        }
        set_cache($cacheKey, $links);
        return $links;
    }

    public function siteGroupHook()
    {
        $info = $this->getInfo();
        if ($info['install'] == 0 || $info['status'] == 0) return false;
        $site = self::getCurrentSite();
        if ($site == null || empty($site)) return false;
        $site['seo'] = self::getSeoConfig($site['site_id']);
        return json_encode($site);
    }

    public function siteGroupLinksHook()
    {
        $info = $this->getInfo();
        if ($info['install'] == 0 || $info['status'] == 0) return false;
        $site = self::getCurrentSite();
        if ($site == null || empty($site)) return false;
        $links = self::getLinks($site['site_id']);
        return json_encode($links);
    }

    public function siteGroupRouteHook()
    {
        $info = $this->getInfo();
        if ($info['install'] == 0 || $info['status'] == 0) return false;
        $site = self::getCurrentSite();
        if ($site == null || empty($site)) return false;
        $route = self::getRoute($site['site_id']);
        return json_encode($route);
    }

    public function siteGroupNavHook($name = '')
    {
        $info = $this->getInfo();
        if ($info['install'] == 0 || $info['status'] == 0) return false;
        $site = self::getCurrentSite();
        if ($site == null || empty($site)) return false;
        $result = self::getNavData($site['site_id'], $name);
        return json_encode($result);
    }

    protected static function getNavData($site_id, $name = '')
    {
        if (empty($site_id)) return [];
        $cacheNavListKey = "site_navs_list_{$name}_{$site_id}";
        $navData = $navList = [];
        $cacheKey = "site_navs_{$name}";
        $navList = get_cache($cacheNavListKey);
        $navData = get_cache($cacheKey);
        if (empty($navData)) {
            $navQuery = Db::name('nav')
                ->where('status', 1);
            if ($name) {
                $navQuery->where('name', $name);
            }
            $navData = $navQuery->select()->toArray();
            set_cache($cacheKey, $navData);
        }
        if (empty($navData)) {
            return [];
        }
        if (empty($navList)) {
            $navIds = array_column($navData, 'id');
            $navList = Db::name('addons_site_nav')
                ->where('status', 1)
                ->where('site_id', $site_id)
                ->whereIn('nav_id', $navIds)
                ->order('sort', 'desc')
                ->order('create_time', 'desc')
                ->select()
                ->toArray();
            set_cache($cacheNavListKey, $navList);
        }
        if (empty($navList)) return [];
        $navItemsMap = [];
        foreach ($navList as $item) {
            $navId = $item['nav_id'];
            if (!isset($navItemsMap[$navId])) {
                $navItemsMap[$navId] = [];
            }
            $navItemsMap[$navId][] = $item;
        }
        $result = [];
        foreach ($navData as $nav) {
            $navId = $nav['id'];
            $nav['items'] = $navItemsMap[$navId] ?? [];
            $result[$nav['name']] = $nav;
        }
        return $name ? ($result[$name] ?? []) : $result;
    }
}
