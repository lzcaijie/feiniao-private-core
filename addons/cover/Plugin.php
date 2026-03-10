<?php

namespace addons\cover;

use think\Addons;
use think\facade\Db;

/**
 * 注意名字不可以修改，只能为Plugin
 */
class Plugin extends Addons    // 需继承think\Addons类
{

    /**
     * 插件安装方法
     * @return bool
     */
    public function install()
    {
        return true;
    }

    /**
     * 插件卸载方法
     * @return bool
     */
    public function uninstall()
    {
        return true;
    }

    //运行
    public function synchCoverHook($param = [])
    {
        if (!$param) return false;
        $info = $this->getInfo();
        if ($info['install'] == 0 || $info['status'] == 0) return false;
        $config = $this->getConfig();
        if (!isset($param['bookid']) || !$param['bookid']) return false;
        $novel = Db::name('book')->field('id,title,status,cover')->where(['id' => $param['bookid']])->find();
        if (empty($novel)) return false;
        if (intval($novel['status']) != 1) return false;
        if (!empty($novel['cover'])) return false;
        if (empty($config['source'])) return false;
        $sources = [];
        if ($config['source'] && strpos($config['source'], ',') !== false) {
            $sources = explode(',', $config['source']);
        }
        if ($config['source'] && strpos($config['source'], ',') === false) {
            $sources[] = $config['source'];
        }
        if (empty($sources)) return false;
        $proxy = null;
        if (!empty($config['proxy'])) {
            $proxy_list = preg_split('/[\r\n]+/', trim($config['proxy'], "\r\n"));
            $proxy = $proxy_list[array_rand($proxy_list, 1)];
        }
        $cover = '';
        foreach ($sources as $key => $source) {
            if (!empty($cover)) break;
            if ($source == 'readnovel') {
                $cover = self::readnovel($novel['title'], $proxy);
            }
            if ($source == 'mxfm') {
                $cover = self::mxfm($novel['title'], $proxy);
            }
            if ($source == 'faloo') {
                $cover = self::faloo($novel['title'], $proxy);
            }
            if ($source == 'zongheng') {
                $cover = self::zongheng($novel['title'], $proxy);
            }
            if ($source == 'qidiantu') {
                $cover = self::qidiantu($novel['title'], $proxy);
            }
        }
        if (!empty($cover)) {
            if ($config['save_cover']) {
                $extension = pathinfo($cover, PATHINFO_EXTENSION);
                if (!in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'wepb', 'jfif'])) {
                    return false;
                }
                $img_name = md5($cover);
                $path = app()->getRootPath() . 'public/storage/bookcover/' . $novel['id'] . '/';
                if (!createDirectory($path)) {
                    return false;
                }
                $filename = $img_name . "." . $extension;
                $localpath = get_config('filesystem.disks.public.url') . '/bookcover/' . $novel['id'] . '/' . $filename;
                $save_path = $path . $filename;
                $get_file = Http::doGet($cover);
                if ($get_file) {
                    if (false === file_put_contents($save_path, $get_file)) {
                        return false;
                    } else {
                        Db::name('book')->where('id', $novel['id'])->strict(false)->field(true)->update(['localcover' => 1, 'cover' => $localpath]);
                    }
                }
            } else {
                Db::name('book')->where('id', $novel['id'])->strict(false)->field(true)->update(['cover' => $cover]);
            }
        }
        return false;
    }

    static public function parseHtml($html)
    {
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true); // 忽略 HTML 解析警告
        @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
        libxml_clear_errors();
        return new \DOMXPath($dom);
    }

    static private function faloo($title, $proxy)
    {
        try {
            $searchUrl = 'https://b.faloo.com/l/0/1.html?t=1&k=' . urlencode(mb_convert_encoding($title, 'GBK', 'UTF-8'));
            $header = [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: zh-CN,zh;q=0.8',
                "X-Forwarded-Host: " . 'b.faloo.com',
                'Connection: keep-alive',
                'referer' => 'https://b.faloo.com/'
            ];
            $html = Http::doGet($searchUrl, 60, $header, $proxy);
            if (!$html || empty($html)) return false;
            $html = mb_convert_encoding($html, 'UTF-8', 'GBK');
            $xpath = self::parseHtml($html);
            if (!$xpath || empty($xpath)) return false;
            $bookcover = $xpath->query('//div[@class="TwoBox02_03"]/a/img/@src')->item(0)->nodeValue;
            $booktitle = $xpath->query('//div[@class="TwoBox02_04"]/div/div/h1/a')->item(0)->nodeValue;
            if (empty($booktitle) || empty($bookcover)) return false;
            if (trim(strip_tags($booktitle)) == $title && $bookcover) return $bookcover;
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    static private function mxfm($title, $proxy)
    {
        try {
            $searchUrl = 'https://www.mx-fm.com/s_fm_mf/?&' . urlencode(mb_convert_encoding($title, 'GBK', 'UTF-8')) . '&';
            $header = [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: zh-CN,zh;q=0.8',
                "X-Forwarded-Host: " . 'www.mx-fm.com',
                'Connection: keep-alive',
                'referer' => 'https://www.mx-fm.com/'
            ];
            $html = Http::doGet($searchUrl, 60, $header, $proxy);
            if (!$html || empty($html)) return false;
            $html = mb_convert_encoding($html, 'UTF-8', 'GBK');
            $xpath = self::parseHtml($html);
            if (!$xpath || empty($xpath)) return false;
            $bookcover = $xpath->query('//div[@class="li_img"]/div/a/div/img/@data-original')->item(0)->nodeValue;
            $booktitle = $xpath->query('//div[@class="li_txt"]/p/a')->item(0)->nodeValue;
            if (empty($booktitle) || empty($bookcover)) return false;
            if (strpos($bookcover, 'nopic') !== false) return false;
            preg_match('/《([^》]+)》/u', $booktitle, $matches);
            if (!empty($matches[1])) {
                $booktitle = trim($matches[1]);
            }
            if (trim(strip_tags($booktitle)) == $title && $bookcover) return 'https://www.mx-fm.com' . $bookcover;
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    static private function qidiantu($title, $proxy)
    {
        try {
            $searchUrl = 'https://www.qidiantu.com/book/' . urlencode($title);
            $header = [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: zh-CN,zh;q=0.8',
                "X-Forwarded-Host: " . 'www.qidiantu.com',
                'Connection: keep-alive',
                'referer' => 'https://www.qidiantu.com/search.php'
            ];
            $html = Http::doGet($searchUrl, 60, $header, $proxy);
            if (!$html || empty($html)) return false;
            $xpath = self::parseHtml($html);
            if (!$xpath || empty($xpath)) return false;
            $bookcover = $xpath->query("//div[@class='media-left media-middle']/div/a/img/@src")->item(0)->nodeValue;
            $booktitle = $xpath->query("//div[@class='media-left media-middle']/div/a/img/@alt")->item(0)->nodeValue;
            if (empty($booktitle) || empty($bookcover)) return false;
            $extension = pathinfo($bookcover, PATHINFO_EXTENSION);
            if (empty($extension)) $bookcover .= '.jfif';
            if (trim(strip_tags($booktitle)) == $title && $bookcover) return $bookcover;
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    static private function zongheng($title, $proxy)
    {
        try {
            $searchUrl = 'https://search.zongheng.com/search/book?keyword=' . urlencode($title) . '&sort=null&pageNo=1&pageNum=20&isFromHuayu=0';
            $header = [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: zh-CN,zh;q=0.8',
                "X-Forwarded-Host: " . 'search.zongheng.com',
                'Connection: keep-alive',
                'referer' => 'https://search.zongheng.com/s?keyword=' . urlencode($title)
            ];
            $json = Http::doGet($searchUrl, 60, $header, $proxy);
            if (!$json || empty($json)) return false;
            $result = json_decode($json, true);
            if (!isset($result['code']) || !isset($result['data']) || !isset($result['data']['datas']) || !isset($result['data']['datas']['list'])) return false;
            $list = $result['data']['datas']['list'];
            if (empty($list)) return false;
            if (!isset($list[0]) || !isset($list[0]['name'])) return false;
            if (empty($list[0]['name'])) return false;
            $booktitle = trim(strip_tags($list[0]['name']));
            if (empty($booktitle)) return false;
            if (!isset($list[0]['coverUrl']) || empty($list[0]['coverUrl'])) return false;
            $bookcover = trim($list[0]['coverUrl']);
            if (empty($bookcover)) return false;
            $bookcover = 'https://static.zongheng.com/upload/' . $bookcover;
            if ($booktitle == $title) return $bookcover;
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    static private function readnovel($title, $proxy)
    {
        try {
            $searchUrl = 'https://www.readnovel.com/so/' . urlencode($title);
            $header = [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: zh-CN,zh;q=0.8',
                "X-Forwarded-Host: " . 'www.readnovel.com',
                'Connection: keep-alive',
                'referer' => 'https://www.readnovel.com/'
            ];
            $html = Http::doGet($searchUrl, 60, $header, $proxy);
            if (!$html || empty($html)) return false;
            $xpath = self::parseHtml($html);
            if (!$xpath || empty($xpath)) return false;
            $bookcover = $xpath->query("//div[@class='book-img-box']/a/img/@src")->item(0)->nodeValue;
            $booktitle = $xpath->query("//div[@class='book-mid-info']/h4/a")->item(0)->nodeValue;
            if (empty($booktitle) || empty($bookcover)) return false;
            if (trim(strip_tags($booktitle)) == $title && $bookcover) return 'https:' . $bookcover;
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }
}

class Http
{
    static public $way = 0;
    //手动设置访问方式
    static public function setWay($way)
    {
        self::$way = intval($way);
    }
    static public function getSupport()
    {
        //如果指定访问方式，则按指定的方式去访问
        if (isset(self::$way) && in_array(self::$way, [1, 2, 3]))
            return self::$way;

        //自动获取最佳访问方式	
        if (function_exists('curl_init')) //curl方式
        {
            return 1;
        } else if (function_exists('fsockopen')) //socket
        {
            return 2;
        } else if (function_exists('file_get_contents')) //php系统函数file_get_contents
        {
            return 3;
        } else {
            return 0;
        }
    }
    //通过get方式获取数据
    static public function doGet($url, $timeout = 60, $header = "", $proxy = "")
    {
        if (empty($url) || empty($timeout))
            return false;
        if (!preg_match('/^(http|https)/is', $url))
            $url = "http://" . $url;
        $code = self::getSupport();
        switch ($code) {
            case 1:
                return self::curlGet($url, $timeout, $header, $proxy);
                break;
            case 2:
                return self::socketGet($url, $timeout, $header, $proxy);
                break;
            case 3:
                return self::phpGet($url, $timeout, $header, $proxy);
                break;
            default:
                return false;
        }
    }
    //通过POST方式发送数据
    static public function doPost($url, $post_data = [], $timeout = 60, $header = "")
    {
        if (empty($url) || empty($post_data) || empty($timeout))
            return false;
        if (!preg_match('/^(http|https)/is', $url))
            $url = "http://" . $url;
        $code = self::getSupport();
        switch ($code) {
            case 1:
                return self::curlPost($url, $post_data, $timeout, $header);
                break;
            case 2:
                return self::socketPost($url, $post_data, $timeout, $header);
                break;
            case 3:
                return self::phpPost($url, $post_data, $timeout, $header);
                break;
            default:
                return false;
        }
    }
    //通过POST方式发送数据
    static public function doFile($url, $file, $timeout = 120, $header = "")
    {
        if (empty($url) || empty($file) || empty($timeout))
            return false;
        if (!preg_match('/^(http|https)/is', $url))
            $url = "http://" . $url;
        $code = self::getSupport();
        switch ($code) {
            case 1:
                return self::curlPost($url, ['file' => $file], $timeout, $header, true);
                break;
            case 2:
                return self::socketPost($url, ['file' => $file], $timeout, $header, true);
                break;
            case 3:
                return self::phpPost($url, ['file' => $file], $timeout, $header, true);
                break;
            default:
                return false;
        }
    }
    //通过curl get数据
    static public function curlGet($url, $timeout = 60, $header = "", $proxy = "")
    {
        $header = empty($header) ? explode("\r\n", self::defaultHeader()) : $header;
        $referer = '';
        if (isset($header['referer'])) {
            $referer = $header['referer'];
            unset($header['referer']);
        }
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_REFERER, $referer);
        curl_setopt($ch, CURLOPT_ENCODING, 'gzip,deflate');
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header); //模拟的header头
        if (!empty($proxy)) {
            curl_setopt($ch, CURLOPT_PROXYTYPE, $proxy['type']);
            curl_setopt($ch, CURLOPT_PROXY, $proxy['url']);
        }
        if (self::hasHttps($url)) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        }
        $result = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($http_code == 200) {
            return $result;
        } else {
            return false;
        }
    }
    //通过curl post数据
    static public function curlPost($url, $post_data = [], $timeout = 60, $header = "", $post_file = false)
    {
        $header = empty($header) ? explode("\r\n", self::defaultHeader()) : $header;
        if ($post_file) {
            $post_string = ['file' => new \CURLFile(realpath(substr($post_data['file'], 1)))];
        } else {
            $post_string = http_build_query($post_data);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_string);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header); //模拟的header头
        if (self::hasHttps($url)) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        }
        $result = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($http_code == 200) {
            return $result;
        } else {
            return false;
        }
    }
    //通过socket get数据
    static public function socketGet($url, $timeout = 60, $header = "", $proxy = "")
    {
        $header = empty($header) ? self::defaultHeader() : $header . "\r\n";
        $url2 = parse_url($url);
        if (!empty($proxy)) {
            $proxy_url = explode(':', $proxy['url']);
            $host_ip = $proxy_url[0];
            $url2['port'] = $proxy_url[1];
            $request = $url;
        } else {
            $url2["path"] = isset($url2["path"]) ? $url2["path"] : "/";
            $url2["query"] = isset($url2["query"]) ? "?" . $url2["query"] : "";
            $host_ip = @gethostbyname($url2["host"]);
            if (self::hasHttps($url)) {
                $host_ip = 'ssl://' . $url2['host'];
                $url2["port"] = isset($url2["port"]) ? $url2["port"] : 443;
            } else {
                $url2["port"] = isset($url2["port"]) ? $url2["port"] : 80;
            }
            $request =  $url2["path"] . $url2["query"];
        }
        if (($fsock = fsockopen($host_ip, $url2['port'], $errno, $errstr, $timeout)) < 0) {
            return false;
        }
        $in  = "GET " . $request . " HTTP/1.0\r\n";
        if (false === strpos($header, "Host:")) {
            $in .= "Host: " . $url2["host"] . "\r\n";
        }
        $in .= $header;
        $in .= "Connection: Close\r\n\r\n";
        if (!@fwrite($fsock, $in, strlen($in))) {
            @fclose($fsock);
            return false;
        }
        return self::GetHttpContent($fsock);
    }
    //通过socket post数据
    static public function socketPost($url, $post_data = [], $timeout = 60, $header = "", $post_file = false)
    {
        $header = empty($header) ? self::defaultHeader() : $header . "\r\n";
        if ($post_file) {
            $multipart_boundary = '---------------------------' . microtime(true);
            $header .= "Content-Type: multipart/form-data; boundary=" . $multipart_boundary . "\r\n";
            $file_contents = file_get_contents(realpath(substr($post_data['file'], 1)));
            $post_string =  "--" . $multipart_boundary . "\r\n" .
                "Content-Disposition: form-data; name=\"file\"; filename=\"" . basename($post_data['file']) . "\"\r\n" .
                "Content-Type: " . mime_content_type(realpath(substr($post_data['file'], 1))) . "\r\n\r\n" . $file_contents . "\r\n";
            $post_string .= "--" . $multipart_boundary . "--\r\n";
        } else {
            $header .= "Content-type: application/x-www-form-urlencoded\r\n";
            $post_string = http_build_query($post_data);
        }
        $url2 = parse_url($url);
        $url2["path"] = isset($url2["path"]) ? $url2["path"] : "/";
        $host_ip = @gethostbyname($url2["host"]);
        if (self::hasHttps($url)) {
            $host_ip = 'ssl://' . $url2['host'];
            $url2["port"] = isset($url2["port"]) ? $url2["port"] : 443;
        } else {
            $url2["port"] = isset($url2["port"]) ? $url2["port"] : 80;
        }
        if (($fsock = fsockopen($host_ip, $url2['port'], $errno, $errstr, $timeout)) < 0) {
            return false;
        }
        $request =  $url2["path"] . (!empty($url2["query"]) ? "?" . $url2["query"] : "");
        $in  = "POST " . $request . " HTTP/1.0\r\n";
        $in .= "Host: " . $url2["host"] . "\r\n";
        $in .= $header;
        $in .= "Content-Length: " . strlen($post_string) . "\r\n";
        $in .= "Connection: Close\r\n\r\n";
        $in .= $post_string . "\r\n\r\n";
        unset($post_string);
        if (!@fwrite($fsock, $in, strlen($in))) {
            @fclose($fsock);
            return false;
        }
        return self::GetHttpContent($fsock);
    }
    //通过file_get_contents函数get数据
    static public function phpGet($url, $timeout = 60, $header = "", $proxy = "")
    {
        $header = empty($header) ? self::defaultHeader() : $header;
        $opts = [
            'http' => [
                'protocol_version' => '1.0', //http协议版本(若不指定php5.2系默认为http1.0)
                'method' => "GET", //获取方式
                'timeout' => $timeout, //超时时间
                'header' => $header
            ]
        ];
        if (!empty($proxy)) {
            $opts['http']['proxy'] = 'tcp://' . $proxy['url'];
            $opts['http']['request_fulluri'] = true;
        }
        $context = stream_context_create($opts);
        return  @file_get_contents($url, false, $context);
    }
    //通过file_get_contents 函数post数据
    static public function phpPost($url, $post_data = [], $timeout = 60, $header = "", $post_file = false)
    {
        $header = empty($header) ? self::defaultHeader() : $header . "\r\n";
        if ($post_file) {
            $multipart_boundary = '---------------------------' . microtime(true);
            $header .= "Content-Type: multipart/form-data; boundary=" . $multipart_boundary;
            $file_contents = file_get_contents(realpath(substr($post_data['file'], 1)));
            $post_string =  "--" . $multipart_boundary . "\r\n" .
                "Content-Disposition: form-data; name=\"file\"; filename=\"" . basename($post_data['file']) . "\"\r\n" .
                "Content-Type: " . mime_content_type(realpath(substr($post_data['file'], 1))) . "\r\n\r\n" . $file_contents . "\r\n";
            $post_string .= "--" . $multipart_boundary . "--\r\n";
        } else {
            $post_string = http_build_query($post_data);
            $header .= "Content-length: " . strlen($post_string);
        }
        $opts = [
            'http' => [
                'protocol_version' => '1.0', //http协议版本(若不指定php5.2系默认为http1.0)
                'method' => "POST", //获取方式
                'timeout' => $timeout, //超时时间 
                'header' => $header,
                'content' => $post_string
            ]
        ];
        $context = stream_context_create($opts);
        return  @file_get_contents($url, false, $context);
    }
    //默认模拟的header头
    static private function defaultHeader()
    {
        $userAgents = [
            // Chrome
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

            // Firefox
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',

            // Safari
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',

            // Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',

            // Opera
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.203',

            // Mobile User-Agents
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        ];
        // 随机选择一个 User-Agent
        $randomUserAgent = $userAgents[array_rand($userAgents)];
        $header = "User-Agent:" . $randomUserAgent . "\r\n";
        $header .= "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\r\n";
        $header .= "Accept-Language:zh-CN,zh;q=0.9\r\n";
        return $header;
    }
    //获取通过socket方式get和post页面的返回数据
    static private function GetHttpContent($fsock = null)
    {
        $out = null;
        while ($buff = @fgets($fsock, 2048)) {
            $out .= $buff;
        }
        fclose($fsock);
        $pos = strpos($out, "\r\n\r\n");
        $head = substr($out, 0, $pos);    //http head
        $status = substr($head, 0, strpos($head, "\r\n"));    //http status line
        $body = substr($out, $pos + 4, strlen($out) - ($pos + 4)); //page body
        if (preg_match("/^HTTP\/\d\.\d\s([\d]+)\s.*$/", $status, $matches)) {
            if (intval($matches[1]) / 100 == 2) {
                return $body;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    static private function hasHttps($url)
    {
        $matches = parse_url($url);
        if ($matches['scheme'] == 'https') {
            return true;
        } else {
            return false;
        }
    }
}
