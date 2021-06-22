

## CopyWebpackPlugin

[官网](https://webpack.js.org/plugins/copy-webpack-plugin/)               [官网](https://www.webpackjs.com/plugins/copy-webpack-plugin/)

使用形式：

```js
new CopyWebpackPlugin([patterns], options)
```

```js
// pattern示例如下: 
	{ 
      from: 'source', 
      to: 'dest' 
    }
```

#### 之前是对`public`下的 .ico图标进行复制

```js
{
   from: path.resolve(__dirname, './public/*.ico'),
   to: path.resolve(__dirname, './dist/[name].[ext]'),
   toType: 'template'
},
```

from指需要被复制的资源位置。这里其实是copy了public下所有.ico文件

to 指的是打包后资源被放置的位置。 并且保留那些文件名和后缀

#### 现在需要对整个静态文件夹的内容进行复制

```js
{
   context: './src/static',
   from: path.resolve(__dirname, './src/static/**'),
   to: path.resolve(__dirname, './dist/static'),
   toType: 'dir'
},
```

这里使用了 `/**`会对该目录下所有文件和文件夹进行复制，

然后会把from目录下所有文件拷贝到to目录下，

但我们需要保持原有的目录结构，需要使用 context和toType

toType很好理解

```js
'file'：如果to有扩展名，或者from是文件

'dir' :如果from是目录 或 to没有扩展名，或者以'/'结尾，

'template' :包含模板模式(就是[name][ext]这样)
```

仅进行上述流程的化，会把from的路径一起复制过来

context

```js
// context代表from的源文件根路径，这是不会被添加到目标路径中的
```

这样就可以了。



第二个是devServer

借助工具switchHosts_windows_portble更改本地host，然后在vue.config.js里修改