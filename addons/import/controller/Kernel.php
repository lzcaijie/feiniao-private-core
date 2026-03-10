<?php

namespace addons\import\controller;

use think\facade\Db;
use think\facade\View;
use app\admin\facade\ThinkAddons;
use think\facade\App;
use think\facade\Session;
use Overtrue\Pinyin\Pinyin;
use content\Content;

set_time_limit(0);
ini_set('memory_limit', '-1');

class Kernel
{

    // 配置信息
    private static $config = [];
    private $addons_name = 'import';
    private static $file_cache_key = 'import_book_cache_key';

    // 初始化
    public function __construct()
    {
        $config    = ThinkAddons::config($this->addons_name);
        $configVal = [];
        foreach ($config as $k => $v) {
            $configVal[$k] = $v['value'] ?? '';
        }
        self::$config = $configVal;
        View::assign('config', $config);
    }

    private function auth()
    {
        $session_admin = get_config('app.session_admin');
        if (!Session::has($session_admin)) {
            die;
        }
    }

    private function temp($action = '')
    {
        return App::getRootPath() . 'addons' . DIRECTORY_SEPARATOR . $this->addons_name . DIRECTORY_SEPARATOR . 'view' . DIRECTORY_SEPARATOR . app('request')->controller() . DIRECTORY_SEPARATOR . ($action ? $action : app('request')->action()) . '.html';
    }

    public function list()
    {
        $this->auth();
        if (request()->isAjax()) {
            $param = get_params();
            $relativepath = 'runtime' . DIRECTORY_SEPARATOR . 'import';
            $path = app()->getRootPath() . $relativepath;
            if (!createDirectory($path)) {
                return to_assign(1, '创建' . $path . '目录失败');
            }
            $bookfile = [];
            $data = get_cache(self::$file_cache_key);
            if (empty($data)) {
                self::get_allfiles($path, $bookfile);
                if (!empty($bookfile) && count($bookfile) > 0) {
                    $data = $bookfile;
                    set_cache(self::$file_cache_key, $bookfile);
                }
            }
            if (!empty($data) && count($data) > 0) {
                $total = count($data);
                $limit = empty($param['limit']) ? get_config('app.page_size') : $param['limit'];
                $start = ($param['page'] - 1) * $limit;
                $list = $data > $limit ? array_slice($data, $start, $limit) : [];
                $result = [];
                foreach ($list as $key => $value) {
                    if (!is_file($value)) {
                        foreach ($data as $k => $v) {
                            if ($v == $value) {
                                unset($data[$k]);
                                set_cache(self::$file_cache_key, $data);
                                break;
                            }
                        }
                        continue;
                    }
                    $filename = basename($value);
                    $filesize = (int) filesize($value);
                    if ($filesize > 0) {
                        $filesize = number_format($filesize / 1048576, 2, '.', '') . " MB";
                    }
                    preg_match('/作者[：:]([^\.]+)\./u', $filename, $matches);
                    if (!empty($matches[1])) {
                        $author = trim($matches[1]);
                    } else {
                        $author = '';
                    }
                    preg_match('/《([^》]+)》/u', $filename, $matches);
                    if (!empty($matches[1])) {
                        $title = trim($matches[1]);
                        $title = preg_replace('/\[.*?\]/', '', $title);
                    } else {
                        $title = '';
                    }
                    $result[] = [
                        'title' => $title,
                        'path' => $value,
                        'filename' => $filename,
                        'author' => $author,
                        'filesize' => $filesize,
                    ];
                }
                return table_assign(0, '', ['total' => $total, 'code' => 0, 'data' => $result]);
            } else {
                return table_assign(0, '', ['total' => 0, 'data' => [], 'code' => 0]);
            }
        }
    }

    private static function get_allfiles($path, &$files)
    {
        if (is_dir($path)) {
            $dp = dir($path);
            while ($file = $dp->read()) {
                if ($file !== "." && $file !== "..") {
                    self::get_allfiles($path . DIRECTORY_SEPARATOR . $file, $files);
                }
            }
            $dp->close();
        }
        if (is_file($path)) {
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (in_array($extension, explode(',', self::$config['allowtypes']))) {
                $files[] =  $path;
            }
        }
    }

    public function clear()
    {
        set_cache(self::$file_cache_key, '');
        return to_assign(0, '操作成功');
    }

    public function config()
    {
        $this->auth();
        $param = get_params();
        if (request()->isAjax()) {
            unset($param['addon'], $param['controller'], $param['action']);
            $param['id'] = $this->addons_name;
            $result = ThinkAddons::configPost($param);
            return to_assign($result['code'], $result['msg']);
        } else {
            return view($this->temp());
        }
    }

    public function edit()
    {
        $this->auth();
        if (request()->isAjax()) {
            $param = get_params();
            unset($param['addon'], $param['controller'], $param['action']);
            if (!isset($param['path']) || empty($param['path'])) {
                return to_assign(1, '源地址不能为空');
            }
            if (!isset($param['name']) || empty($param['name'])) {
                return to_assign(1, '新名称不能为空');
            }
            $path = $param['path'];
            $name = trim($param['name']);
            $cache_list = get_cache(self::$file_cache_key);
            if (!is_file($path)) {
                return to_assign(1, '源文件不存在');
            }
            $fileName = basename($path);
            if ($fileName == $name) {
                return to_assign(1, '名称没有变化');
            }
            $newfile = dirname($path) . DIRECTORY_SEPARATOR . $name;
            if (is_file($newfile)) {
                return to_assign(1, '相同目录下已有相同的文件名称');
            }
            if (rename($path, $newfile)) {
                foreach ($cache_list as $key => $value) {
                    if ($value == $path) {
                        $cache_list[$key] = $newfile;
                        break;
                    }
                }
                set_cache(self::$file_cache_key, $cache_list);
                return to_assign(0, '修改成功');
            } else {
                return to_assign(1, '修改失败');
            }
        }
    }

    public function delete()
    {
        $this->auth();
        if (request()->isAjax()) {
            $param = get_params();
            if (!isset($param['path']) || empty($param['path'])) {
                return to_assign(1, '源地址不能为空');
            }
            $path = $param['path'];
            $cache_list = get_cache(self::$file_cache_key);
            if (!is_file($path)) {
                return to_assign(1, '源文件不存在');
            }
            $file = '';
            $fileindex = 0;
            foreach ($cache_list as $key => $value) {
                if ($value == $path) {
                    $fileindex = $key;
                    $file = $value;
                    break;
                }
            }
            if (empty($file)) {
                return to_assign(1, '源文件不存在');
            }
            if (unlink($file)) {
                unset($cache_list[$fileindex]);
                set_cache(self::$file_cache_key, $cache_list);
                return to_assign(0, '删除成功');
            } else {
                return to_assign(1, '删除失败');
            }
        }
    }

    public function run()
    {
        $this->auth();
        if (request()->isAjax()) {
            $param = get_params();
            if (!isset($param['path']) || empty($param['path'])) {
                return to_assign(1, '参数不能为空');
            }
            $path = $param['path'];
            $catid = isset($param['catid']) ? $param['catid'] : 0;
            $cache_list = get_cache(self::$file_cache_key);
            if (empty($cache_list)) return to_assign(1, '缓存文件不存在');
            $file = '';
            $fileindex = 0;
            foreach ($cache_list as $key => $value) {
                if ($value == $path) {
                    $fileindex = $key;
                    $file = $value;
                    break;
                }
            }
            if (empty($file)) {
                return to_assign(1, '文件不存在：' . $path);
            }
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            $author = '';
            preg_match('/作者[：:]([^\.]+)\./u', $file, $matches);
            if (!empty($matches[1])) {
                $author = trim($matches[1]);
            }
            preg_match('/《([^》]+)》/u', $file, $matches);
            $title = '';
            if (!empty($matches[1])) {
                $title = trim($matches[1]);
                $title = preg_replace('/\[.*?\]/', '', $title);
            }
            if (empty($title) && empty($author)) {
                $info = pathinfo($file);
                $title = isset($info['filename']) ? $info['filename'] : '';
            }
            if (empty($title)) return to_assign(1, '未识别到作品名称');
            $info = [
                'title' => $title,
                'author' => $author,
                'path' => $file,
            ];
            if ($extension == 'txt') {
                $result = $this->readtxt($info);
                if (!empty($result)) {
                    if (empty($result['chapter'])) return to_assign(1, '未识别到章节');
                    $title = trim($result['title']);
                    $author = trim($result['author']);
                    $genre = trim($result['genre']);
                    $big_cate_id = $subgenre = 0; //分类
                    $book = Db::name('book')->field('id')->where(['title' => $title])->find();
                    $user = Db::name('author')->field('id,nickname')->where(['nickname' => $author])->find();
                    if (empty($user)) {
                        $time = (string) time();
                        $salt = substr(MD5($time), 0, 6);
                        $password = set_salt(20);
                        $data = array(
                            'nickname' => $author,
                            'salt' => $salt,
                            'password' => sha1(MD5($password) . $salt),
                            'ip' => request()->ip(),
                            'create_time' => time(),
                            'status' => 1,
                        );
                        $authorid = Db::name('author')->strict(false)->field(true)->insertGetId($data);
                    } else {
                        $authorid = $user['id'];
                        $author = $user['nickname'];
                    }
                    if (!empty($catid) && empty($genre)) {
                        $category = Db::name('category')->field('id,pid')->where(['id' => $catid])->find();
                        if (!empty($category)) {
                            if (intval($category['pid']) > 0) {
                                $big_cate_id = $category['pid'];
                                $subgenre = $category['id'];
                            } else {
                                $big_cate_id = $category['id'];
                            }
                        }
                    }
                    if (empty($catid) && !empty($genre)) {
                        $category = Db::name('category')->field('id,pid')->where(['name' => $genre])->find();
                        if (!empty($category)) {
                            if (intval($category['pid']) > 0) {
                                $big_cate_id = $category['pid'];
                                $subgenre = $category['id'];
                            } else {
                                $big_cate_id = $category['id'];
                            }
                        }
                    }
                    if (empty($book)) {
                        $bookdata = [
                            'title' => $title,
                            'author' => $author,
                            'authorid' => $authorid,
                            'status' => 1,
                            'genre' => $big_cate_id,
                            'subgenre' => $subgenre,
                            'filename' => Pinyin::permalink($title, ''),
                            'create_time' => time(),
                        ];
                        $bookid = Db::name('book')->strict(false)->field(true)->insertGetId($bookdata);
                    } else {
                        $bookid = $book['id'];
                    }
                    if (empty($bookid)) return to_assign(1, '作品添加失败');
                    $skip = $success = $fail = 0; //跳过、成功、失败
                    $chapter = $result['chapter'];
                    foreach ($chapter as $k => $v) {
                        $istitle = Db::name('chapter')->field('id')->where(['bookid' => $bookid, 'title' => $v['title']])->find();
                        if (!empty($istitle)) {
                            $skip++;
                            continue;
                        }
                        list($wordnum, $content) = countWordsAndContent($v['content'], true);
                        $data = [
                            'bookid' => $bookid,
                            'authorid' => $authorid,
                            'title' => $v['title'],
                            'chaps' => $k + 1,
                            'status' => 1,
                            'verify' => 1,
                            'trial_time' => 0,
                            'verifyresult' => '',
                            'verifytime' => time(),
                            'wordnum' => $wordnum,
                            'create_time' => time()
                        ];
                        $sid = Db::name('chapter')->strict(false)->field(true)->insertGetId($data);
                        if ($sid !== false) {
                            Content::add($bookid, $sid, $content);
                            $success++;
                        } else {
                            $fail++;
                        }
                    }
                    if (unlink($file)) {
                        unset($cache_list[$fileindex]);
                        set_cache(self::$file_cache_key, $cache_list);
                    }
                    return to_assign(0, '导入成功' . $success . '章，跳过重复章节' . $skip . '章，失败章节 ' . $fail . ' 章。');
                } else {
                    return to_assign(1, '未识别到章节');
                }
            } else {
                return to_assign(1, '暂不支持' . $extension . '格式');
            }
        }
    }

    private function readtxt($info)
    {
        if ($info) {
            $realPath = $info['path'];
            $chapter = [];
            $str = $title = $author = $genre = '';
            $author = $info['author'];
            try {
                //逐行读取文件内容
                $handle = fopen($realPath, 'r');
                while (($line = fgets($handle)) !== false) {
                    $e = mb_detect_encoding($line, array('UTF-8', 'ASCII', 'GB2312', 'GBK', 'BIG5'));
                    if ($e && $e != 'UTF-8') {
                        $line = mb_convert_encoding($line, 'UTF-8', $e);
                        //$line = iconv($e, 'UTF-8', $line);
                    }
                    //作者：作者: 
                    if (empty($author)) {
                        if (strpos($line, ' 著') !== false) {
                            $author = explode(' 著', $line)[0];
                        }
                        if (strpos($line, '作者:') !== false) {
                            $a = explode('作者:', $line);
                            $author = isset($a[1]) ? $a[1] : '';
                        }
                        if (strpos($line, '作者：') !== false) {
                            $a = explode('作者：', $line);
                            $author = isset($a[1]) ? $a[1] : '';
                        }
                    }
                    if (empty($genre)) {
                        if (strpos($line, '大类：') !== false) {
                            $a = explode('大类：', $line);
                            $genre = isset($a[1]) ? $a[1] : '';
                        }
                        if (strpos($line, '大类:') !== false) {
                            $a = explode('大类:', $line);
                            $genre = isset($a[1]) ? $a[1] : '';
                        }
                    }
                    $line = preg_replace('/^[\p{C}\s]+|[\p{C}\s]+$/u', '', $line);
                    if (empty($line) || !$line || is_null($line)) continue;
                    if (preg_match_all("/^([序|尾]+[章|声])([^\r\n]+)?/u", $line, $arr)) {
                        unset($arr);
                        if (mb_strlen($line) > 50) {
                            $str .= $line . "\n";
                        } else {
                            if ($title) {
                                $chapter[] = [
                                    'title' => $title,
                                    'content' => $str
                                ];
                                $str = '';
                            }
                            $title = $line;
                        }
                    } else {
                        if (preg_match_all("/^([第][\d一二两三四五六七八九零十百千万、-]+[章|章节|卷|集|回])([^\r\n]+)?/u", $line, $arr)) {
                            unset($arr);
                            if (mb_strlen($line) > 50) {
                                $str .= $line . "\n";
                            } else {
                                if ($title) {
                                    $chapter[] = [
                                        'title' => $title,
                                        'content' => $str
                                    ];
                                    $str = '';
                                }
                                $title = $line;
                            }
                        } else {
                            $str .= $line . "\n";
                        }
                    }
                    unset($line);
                }
                fclose($handle);
            } catch (\Exception $e) {
                return to_assign(1, '导入失败:' . $e->getMessage());
            }
            $chapter[] = [
                'title' => $title,
                'content' => $str
            ];
            if (empty($author)) {
                return to_assign(1, '作者获取失败');
            }
            $info['author'] = $author;
            $info['genre'] = $genre;
            $info['chapter'] = $chapter;
            return $info;
        } else {
            return to_assign(1, '导入失败，请重试');
        }
    }
}
