curry

分批的给函数传参数，更具不同的配置实现不同fun。

原理还是闭包

```js
const addFn = function(...initArgs) {
  let preArr = [...initArgs]
  return function add(...args) {
    let curArr = [...args]
    if (curArr.length === 0) {
      return preArr.reduce((pre, cur) => {
        return pre + cur
      }, 0)
    } else {
      preArr = preArr.concat(...args)
      return add
    }
  }
}

//这样就是最后一个为空时，得到结果
let sum = addFn(1)(2)(3)
console.log( sum(2)() )

```



```js
// 通用curry
function curry(fun, ...args) {
  if(typeof fun !== 'function') {
    throw new Error('need a fun')
  }
  let that = this
  let len = fun.length
  let curArgsArr = [...args]

  return function (...leftArgs) {
    curArgsArr = curArgsArr.concat([...leftArgs])
    if(curArgsArr.length < len) {
      return curry.call(that, fun, ...curArgsArr)
    }
    return fun.apply(that, curArgsArr)
  }
}
```

