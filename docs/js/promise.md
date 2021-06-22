# 封装异步回调请求

## 这里是借助 `promise` 去处理回调地狱的问题

先是promise的介绍，promise可以理解成一个容器，存着一个未来处理后的结果（fulfilled or rejected），还没有结果就说明处于（pending状态）

- “`has`-`resolution`” - `fulfilled`     调用`onFulfilled`
- "`has`-`rejection`" - `rejected`   调用`OnReject`
- "`unresolve`" - `Pending`

```javascript
var p1 = new Promise(function(resolve,reject){
    if () {
        // 成功时调用resolve
      	resolve()
    }else{
        // 失败调用reject
    	reject()       
    }
})
// new Promise(executer)
```

`Promise`构造函数接收一个参数，作为执行器**executor**，会自动执行，会更据内部成功与否，将该promise的状态由`pending`变为 `Resolved`还是`Rejected` 。这样之后，该promise的状态不会再变化，结果也自然不会变。

要想知道是成功还是失败，可以通过链接到下一个`promise`去判断。

```javascript
// p1.then(onFulfilled, onRejected)
p1.then(function(resolve){},function(reject){})
```

then()接收两个参数，分别对应前一个promise的fulfilled和rejected状态去执行，但只有一个参数会执行。要么resolve要么reject的。

```javascript
其次还有promise.catch()
p1.then(function(resolve){})
	.catch(function(err){})
```

`catch`只是then中的reject的语法糖，当前面的promise rejected时会进入执行。


- 这里有一点，如果有多个promise链接在一起顺序调用，其中一个rejected的话，会直接进入到后续最近的catch或者reject的函数中，捕捉到这个rejected的promise后，catch后续的then会继续执行。这是因为相当于catch到err的这个promise是成功的状态，所以不影响后续的then。这也就是promise可能会吃掉错误的说法。

```
Promise.all()
Promise.race()
没什么好说的，看文档
```

promise链式调用需要每次then中调用的都是promise，所以异步操作需要被promise封装。

在http请求中通常会有接连的请求，也就用到了promise chain。

### then chain

```javascript
[1, 3, 5, 7, 9].reduce((seq, n) => {
    return seq.then(() => {
        console.log(n);
        return new Promise(res => setTimeout(res, 1000));
    });
}, Promise.resolve())
    .then(
    () => console.log('done'),
    (e) => console.log(e)
);
// will log 1, 3, 5, 7, 9, 'done'     in 1s intervals, and total to 5s.
```

这里用一个Promise.resolve()作为该chain的启动

- 每一项都会连接上.then()
- 最后会执行在整体之外的那个then里的resolve或者rejected。

### 一个catch chain

```javascript
var working_resource = 5; // one of the values from the source array
[1, 3, 5, 7, 9].reduce((seq, n) => {
    return seq.catch(() => {
        console.log(n);
        if(n === working_resource) { // 5 is working
            return new Promise((resolve, reject) => setTimeout(() => resolve(n), 1000));
        } else { // all other values are not working
            return new Promise((resolve, reject) => setTimeout(reject, 1000));
        }
    });
}, Promise.reject()).then(
    (n) => console.log('success at: ' + n),
    () => console.log('total failure')
);
// will log 1, 3, 5, 'success at 5' at 1s intervals
```

可以理解为不断的catch，一直到找到正确的服务器。

## 这里正题

#### 这里先封装一个延时的promise，利用prromise.race

```javascript
// 超时promise函数 默认一秒超时
function timeoutPromise (pro, index, timeout = 1000) {
  //clearTimeout(timeoutP)
  var timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      let err = {
        status: '0',
        msg: `第${index}个请求超时`
      }
      //console.log(err)
      reject(err)
    }, timeout)
  })
  return Promise.race([pro, timeoutPromise])
}
```

因为我决定用reduce遍历promise数组，所以就额外传进来一个index，用于指出哪一个请求超时。

### 封装异步请求链


```javascript
function mutiAysncFunctions (timeout = 1000, ...functions) {
  let promiseTasks = [...functions]
  promiseTasks.reduce((prePromise, curPromise, index) => {
    return prePromise.then(function(resolve) {
      // 这里将前一步处理的回调结果传给后一步，反正也可以忽略，
      // 看需求
      return timeoutPromise(curPromise(resolve), index + 1, timeout)
    })
  }, Promise.resolve())
    // 最后这里再整个链的尾部添加一个then和catch用于打印该promise chain成功与否
  .then(res => {
    console.log('success')
    console.log(res)
  })
  .catch(err =>{
    console.log('出错了')
    console.log(err)
  })
}
```

#### 例子

```javascript
// 利用上面的延时promise以及promise链进行测试
var a = function() {
  return new Promise(function(resolve, reject) {
      setTimeout(function() {
          console.log('a')
          resolve('a')
      }, 1000)
  })
}

var b = function(data) {  
  return new Promise(function(resolve, reject) {
      console.log('b')
      resolve(data +'b')
  })
}

var c = function(data) {
  return new Promise(function(resolve, reject) {
      setTimeout(function() {
          console.log('c')
          resolve(data +'c')
      }, 3000)
  })  
}
// abc顺序以及timeout的值随便换
mutiAysncFunctions(1000, a, b, c)
```

输出

```shell
[Running] node "d:\code\fscut\cloudh5_dev\cloudh5\promise.js"

a
b
出错了
{ status: '0', msg: '第3个请求超时' }
c

[Done] exited with code=0 in 4.11 seconds
```

