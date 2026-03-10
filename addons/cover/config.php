<?php

return array (
  'cover_open' => 
  array (
    'title' => '启用封面获取',
    'type' => 'radio',
    'options' => 
    array (
      1 => '开启',
      0 => '关闭',
    ),
    'value' => '1',
    'tips' => '开启后会默认下载匹配的作品封面',
  ),
  'save_cover' => 
  array (
    'title' => '保存封面',
    'type' => 'radio',
    'options' => 
    array (
      1 => '开启',
      0 => '关闭',
    ),
    'value' => '1',
    'tips' => '开启后将会下载封面图到本址',
  ),
  'source' => 
  array (
    'title' => '获取源',
    'type' => 'checkbox',
    'options' => 
    array (      
      'readnovel' => '小说阅读网',
      'zongheng' => '纵横中文网',
      'faloo' => '飞卢小说网',
      'mxfm' => '墨星封面',
      'qidiantu' => '起点图',
    ),
    'value' => 'readnovel,zongheng,faloo,mxfm,qidiantu',
    'tips' => '后期会逐步兼容更多源',
  ),
  'proxy' => 
  array (
    'title' => '代理设置',
    'type' => 'text',
    'value' => '',
    'tips' => '每行一个代理地址，如果为空则不使用代理',
  ),
);
