# 最佳实践

## 前端调用后端api接口时，涉及到跨域问题CROS

跨域资源共享([CORS](https://developer.mozilla.org/zh-CN/docs/Glossary/CORS)) 是一种机制，允许运行在一个 origin (domain) 上的浏览器，被准许访问不同源的服务器上的资源。

当一个资源从与该资源本身所在的服务器**不同的域、协议或端口**请求一个资源时，资源会发起一个**跨域 HTTP 请求**。

| URI                                                        |                  | changeOrigin |
| ---------------------------------------------------------- | ---------------- | ------------ |
| http://www.cnblogs.com/a.js<br/>http://www.a.com/b.js      | 不同域名         | 是           |
| http://www.a.com/lab/a.js<br/>http://www.a.com/script/b.js | 同域名下不同文件 | 否           |
| http://www.a.com:8000/a.js<br/>http://www.a.com/b.js       | 不同端口（port） | 是           |
| http://www.a.com/a.js<br/>https://www.a.com/b.js           | 同域名 不同协议  | 是           |

一般的跨域问题直接修改`vue.config.js` 的 `devServer` 的`proxy` 选项即可，无需设置下方的`onProxyReq`选项。该选项是为了跳过登录验证，使得修改端口后访问接口时能携带`cookie`。

```javascript
//vue.config.js

devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://kb.bcjgy.com/api', // 设置调用的接口域名和端口
        changeOrigin: true, // 是否跨域
        ws: true,
        onProxyReq(proxyReq, req, res) {
          const cookie = 'TGC=TGT-b0f20ebf-767b-47a4-8875-ce1826257212;';
          proxyReq.setHeader('Cookie', cookie);
        },
        // 2020-06-01 15:53
        pathRewrite: {
          '/api': ''
        }
      }
    }
  }
```

## 获取 `TGC` 的方法：

打开金色平台

![image-20200603165414967](C:\Users\fscut\AppData\Roaming\Typora\typora-user-images\image-20200603165414967.png)

f12 打开DevTools(以chrome为例)

打开查看Cookies中的 TGC 字段，复制出来就行。

![img](C:\Users\fscut\AppData\Local\Temp\企业微信截图_15911745917086.png)

其次，因为用了 `lsui`组件库，相应的也要设置 `baseURL`的值

```javascript
//main.js
Lsui.Request.setDefaults({
  //这里设置baseurl为 '/api' 就行，也就是proxy下的pathRewrite中的 '/api'
  baseURL: '/api', method: 'post',	 
  timeOut: 6000 });

```

如果是未封装axios

```javascript
//路径从 /api 开始写就行
axios.get('/api/getDataPoint').then(res => {
  console.log(res)
})
```

然后在结合具体的请求设置不同路径

```javascript
/* global Vue */
export default function getPicture() {
    return Vue.prototype.$request('/knowledge/listTreeType', { }, 'get');
  }
```

这是请求知识库出来的页面，请求的接口如下：

`https://kb.bcjgy.com/api/knowledge/listTreeType`

直接请求的话，一是会发生跨域问题，二是没有登录，需要登录权限。

![img](C:\Users\fscut\AppData\Local\Temp\企业微信截图_1591144709325.png)

再看请求的接口，虽然控制台仍旧显示原来的本地路径，但实际请求已经代理到`https://kb.bcjgy.com/api/knowledge/listTreeType`

![img](C:\Users\fscut\AppData\Local\Temp\企业微信截图_15911446824242.png)

请求到的数据：

![img](C:\Users\fscut\AppData\Local\Temp\企业微信截图_15911446985228.png)

## `vue-cli`生成的配置文件上的`proxy`

事实上在运行的时候，会配置启动一个`node`服务，这个服务的作用

1. 是静态文件服务，可以访问到`html/js`等文件包括监听文件变动等，

2. 是启动一个http代理，js发送的请求会请求到这个服务器A，由服务器A代理到服务器B，而服务器A和静态文件服务器是同源的，并不影响同源策略。

而服务器和服务器之间没有跨域这一说法，所以就能返回数据，不需要再本地搭建后端。