## addeventListener 的passive 

## 简介：

addEventListener有三个参数

target.addEventListener(event, handler, useCapture),第三个参数useCapture默认是false.

DOM事件(event flow)存在三个阶段：事件捕获阶段、处于目标阶段、事件冒泡阶段。

useCapture默认false即冒泡阶段。

但也可以是一个对象，

```javascript
{
	capture: Boolean,
	once: Boolean,
	passive: Boolean,
}
```

`once`表示`listener`在添加之后最多只调用一次。如果是`true`，`listener`会在其被调用之后自动移除，这跟我们在jQuery时代的`once`方法比较像。

`passive`表示`listener`永远不会调用`preventDefault()`。如果`listener`仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告。

## 作用：

当我们在滚动页面的时候（通常是我们监听touch事件的时候），页面其实会有一个短暂的停顿（大概200ms），浏览器不知道我们是否要`preventDefault`，所以它需要一个延迟来检测。这就导致了我们的滑动显得比较卡顿。

从Chrome 51开始，`passive event listener`被引进了Chrome，我们可以通过对`addEventListener`的第三个参数设置`{ passive: true }`来避免浏览器检测这个我们是否有在touch事件的handler里调用`preventDefault`。在这个时候，如果我们依然调用了`preventDefault`，就会在控制台打印一个警告。告诉我们这个`preventDefault`会被忽略。

当我们给`addEventListener`的第三个参数设置了`{ passive: true }`，这个事件监听器就被称为**passive event listener**。

从Chrome 56开始，如果我们给`document`绑定`touchmove`或者`touchstart`事件的监听器，这个`passive`是会被默认设置为`true`以提高性能，是一个可以在移动端这种更加重视性能优化的场景下。

## 兼容性：

```javascript
var passiveSupported = false;

try {
  var options = Object.defineProperty({}, "passive", {
    get: function() {
      passiveSupported = true;
    }
  });

  window.addEventListener("test", null, options);
} catch(err) {}

```

```javascript
someElement.addEventListener("mouseup", handleMouseUp, passiveSupported ? { passive: true } : false);
```

https://juejin.im/post/5ad804c1f265da504547fe68