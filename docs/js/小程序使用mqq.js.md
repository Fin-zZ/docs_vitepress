小程序使用mqq.js

先是直接照搬在h5的方案，开启自己电脑这边切割软件，进行连接。结果报错，报U.createEvent  is not a function，感觉就是找不到某个对象了，很奇怪的报错。

因为使用的是mqtt.min.js文件，也看不出来报错行在哪里

next 开始查看我们的代码，报错也是一层一层的打印下来的，看函数调用栈，结果在我们自己代码的new 对象那行就报错了，得，那就看我们自己封装的mqtt 构造函数，100来行。

由上到下看，先看引用，就用了俩模块，一个是mqtt.min.js，另一个是他继承的父类构成函数，然后查看他自己的code，其实中规中矩，不过接受参数，检查，建立连接，监听mqtt连接，发送消息，断开，重连等事件，心跳连接，消息解码等，没啥特别的，于是就去看父类。

父类：还是由上到下看引用，这里有proto文件的引用，这里我就想起来，在vue里使用proto文件的麻烦了。。。会不会小程序这里也有特殊性？就找到了github上一个转换给小程序使用的protobuf库，能够转换proto文件，也具备了，页替换了之前的lookup方法。这下以为总该可以了。

接着是引用的mqtt.min.js的问题
报错，错误行指向new Mqtt()的地方，然而该对象是我们直接引入的呀，于是先去查找是否版本问题，
途中查询到，我们的websocket连接需要改为 wxs
```js
//mqtt.connect('wx://xxxxxxxxxx', options)；
//wx://   xx.xx.xxxxxxx
//协议版本  链接地址
//微信小程序这个版本 作者自己封装了一层 wx表示普通的ws协议连接 wxs表示加密之后的wss协议连接。
````

```js
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

```

eval函数问题，无法使用，我就改成JSON.parse解析,出来的json对象还是报错，是他们传递的数据问题，比如数字，25.0，他们通常穿的是25. 类似的还是科学技术2.0e6，结果他们是2.e6。 这类小数点的都给他们补成了 .0。

```js
let res = data.replace(/\.,/g, '.0',).replace(/\.e/, '.0e').replace(/\.}/, '.0]').replace(/\.}/, '.0}')
```

