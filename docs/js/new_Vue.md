new Vue



vue的定义和开发环境相关，我们讨论的是runtime with compiler版本

位置在

```
platforms/web/enrty-runtime-with-compiler
```

可以看到，这时候的Vue 来自

```js
import Vue from './runtime/index'
```

点击查看，发现 Vue 再次来自

```js
import Vue from 'core/index'
```

再次跳转过去，可以看到

```js
import Vue from './instance/index'
```

这才算是来到了vue的初始化函数这里。

并且vue先执行自身的 _init 函数，进行初始化。

## _init

_init 很简单，内部就是初始化各项配置，有 initLifecycle, initEvents,

initRender, initInjections, initState, initProvide,  初始化这些。

定义在:

```js
instance/init.js
```

优点在于可以将各个模块分开到不同地方写，最后在init时进来初始化。

init函数最后，

```js
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
```

会检查是否有 el 参数传进来（一般我们传递 '#app' 这个节点）,有，则进行vm.$mount挂载到该节点上去。



### 挂载部分 $mount

全局搜索Vue.prototype.$mount

$mount 不同 环境方式构建出来的也不一样，先按照

```t
src/platform/web/entry-runtime-with-compiler.js
```

分析。

查看该文件，首先缓存了原型上的 $mount ,再重写一个mount，这个估计和不同版本环境的vue有关。

因为需要挂载，就会先检查el元素合法性，其次保存new Vue（）里的各项配置，这些配置里就是要检查有无 render函数。

没有render，那么就再查看是否有 template

比如局部组件的创建和使用等，按照template的类型，得到生成之后的template，对render修改。

最终用 最初缓存的 mount方法挂载。

```vue
new Vue({
  el: '#app',
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB
  }
})
```

这个mount方法 需要查看import进来的vue函数，文件如下：

```
src/platform/web/runtime/index.js
```

这里就是简单判断是否再浏览器环境，是的化利用query转为 DOM 对象，并 使用 mountCommponent方法返回。

该方法定义在：'core/instance/lifecycle'，该函数也还是先检查有无render方法，没有就创造一个空节点，然后 会定义 updateComponent方法, 该方法也有两种定义，其一如下，

```js
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
```

实际就是调用 vm._update 以及 vm._render

定义是为了给后续 的 Water里作为回调函数使用。

water类里做了两次判断，一开始，如果已经挂载过，那就执行一个钩子函数，后续里会判断，有无根Vue实例，没有，那就执行mounted钩子函数。

updateComponent是给Watcher 在初始化以及vm实例对象变化时去执行。



### updateComponent 

这里开始介绍这个 updateComponent 函数里，其实它的核心是另外的两个函数

```js
vm._update()
vm._render()
```

先是vm._render，可以看出来该方法返回一个virtual node 虚拟node

```
//declare interface Componet中声明
  // rendering
  _render: () => VNode;
```

instance调用的实际上是原型上的方法，

search  Vue.prototype._render

它的定义在 `src/core/instance/render.js` 文件中：

看到 renderMixin方法，可以看出来目的就是想要生成一个vnode，

```js
vnode = render.call(vm._renderProxy, vm.$createElement)
```

调用vm.$createElement方法

```js
//declare interface Componet中声明
$createElement: (tag?: string | Component, data?: Object, children?: VNodeChildren) => VNode;
```

再去看 $createElement， 也在该文件中，

实际上就是调用createElement方法，挺短的，看得出来利用柯里化，对_createElement进行封装。

```js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

重载 很有意思的一步

```js
 if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
```

在_createElement 中，

重要有两步 

1. 根据 normalizationType 的值，对children进行扁平化

2. 上一步 children将会返回成一个 VNode的数组，下面就是对children进行创建VNode 实例。

   

   比如会查看tag 是 string 还是 component，string情况，还会去看是否时html的标签，component也会去查看是否已经注册。最终，就是创建了一个VNode。
   
   算是形成了vnode tree
   
   以上是vm._render

### vm._update

```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }
```

先缓存旧节点，根据有无旧节点，利用vm._patch方法，创建vm.$el

这里先分析 update的 首次渲染功能；

```js
  __patch__: (
    a: Element | VNode | void,
    b: VNode,
    hydrating?: boolean,
    removeOnly?: boolean,
    parentElm?: any,
    refElm?: any
  ) => any;
```

patch 不同的平台 调用方法不一样

```js
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

patch是与平台相关的，web weex环境都是会去渲染vdom，但是服务端就不必了。

```
src/platforms/web/runtime/patch.js
```

以上是web中的patch定义地址

```js
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

根据配置返回不同的createPatchFunction

createPatchFunction内部定义了一大堆分支 方法，最终也还是 返回一个 patch方法。

在其内部，首次渲染的路径，isRealElement 为 true，最终调用createElm方法，这里会简单检查是否要渲染挂载到dom上，毕竟服务端无需挂载，

大概逻辑就是 将 虚拟dom创建成 真实dom，并插入到父节点中去，接着 createChildren 方法对针对他的子虚拟节点，进行递归的调用createElm 创建 真实dom，

```js
createChildren(vnode, children, insertedVnodeQueue)

function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(children)
    }
    for (let i = 0; i < children.length; ++i) {
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
  }
}
```

接着执行 invokeCreateHooks，循环的执行create 钩子里的方法，

最后，把vnode push 到 insertedVnodeQueue

```js
createChildren(vnode, children, insertedVnodeQueue)

function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(children)
    }
    for (let i = 0; i < children.length; ++i) {
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
  }
}
```

接着执行 insert

```js
insert(parentElm, vnode.elm, refElm)
```

其实就是检查有无父节点，有则先插入子节点，无则直接添加。

再回到 `patch` 方法，首次渲染我们调用了 `createElm` 方法，这里传入的 `parentElm` 是 `oldVnode.elm` 的父元素，在我们的例子是 id 为 `#app` div 的父元素，也就是 Body；实际上整个过程就是递归创建了一个完整的 DOM 树并插入到 Body 上。



