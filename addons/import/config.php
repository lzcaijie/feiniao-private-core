<?php

return array (
  'allowtypes' => 
  array (
    'title' => '允许导入格式',
    'type' => 'checkbox',
    'options' => 
    array (
      'txt' => 'txt',
      'docx' => 'docx',
      'epub' => 'epub',
      'azw3' => 'azw3',
      'mobi' => 'mobi',
      'umd' => 'umd',
      'pdf' => 'pdf',
    ),
    'value' => 'txt',
    'tips' => '目前暂时只支持TXT格式，后期会逐步兼容更多格式',
  ),
);
