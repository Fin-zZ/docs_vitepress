# 伪类focus的使用

首先focus只能匹配一些特定元素，如下

1. 未被设置disabled的 表单 元素，如 input select button。
2. 包含href的 a 元素。
3. area 元素
4. html 5 里的summary元素。

其他html直接设置 是无效的。

其次 一个页面最多一个标签元素 被focus。

其它元素想要用上 :focus伪类的话，也有两种方法

- 设置 contenteditable，值有true / false ；代表该元素是否可以编辑

  ```vue
      <div contenteditable="true">can be edit</div>
      <div contenteditable="false">can not be edit</div>
  ```

  但这样，只有true的可以设置 focus 但元素内容就可以被编辑了。

- 设置tabindex；

  ```html
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
      :focus + div{
        color: #5cb85c;
      }
    </style>
  </head>
  <body>
    <div class="" style="text-align: center" tabindex="-1">
      <div tabindex="-1">line one</div>
      <div tabindex="0">line two</div>
      <div tabindex="3">line three</div>
      <div tabindex="4">line four</div>
    </div>
  </body>
  </html>
  ```

  这里设置了tabindex的都可以设置 :focus 伪类，但只有数字是自然数的时候，可以被键盘tab索引到。所以可以利用这一特性实现点击的交互。

  注意 

  [关于ios 微信等 focus失焦问题](https://www.zhangxinxu.com/wordpress/2020/10/ios-safari-input-button-focus/)

  ios safari里，元素一旦处于focus，处于点击其他可以聚焦的元素，否侧之前已聚焦的元素会一直保持focus状态，安卓以及其他桌面浏览器没啥问题。

  解决方案，找一个足够高的父级元素 设置 tabindex=’-1‘ 转移焦点即可