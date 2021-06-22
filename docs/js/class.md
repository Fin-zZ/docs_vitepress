# class

基本

```js
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}
// 子类必须再constructor中调用super方法，因为子类在新建实例的时候，
// 没有自己的this 用的还是父类的，只是继承了父类的this对象。
class ColorPoint extends Point{
  constructor(x, y, z) {
    super(x, y)
    this.z = z
  }
}
```

子类 父类关系

```js
Object.setPrototypeOf(ColorPoint.prototype, Point.prototype)
Object.setPrototypeOf(ColorPoint, Point)
// 还有isPrototypeOf getPrototype可以判断原型关系
```

子类的super代表调用父类的构造函数

但是返回的是子类的实例,就是super内部的this现在就成了子类的了

子类里使用super()，等同于 Father.prototype.consturctor.call(this)



 另外super可以作为对象

 super作为对象时，指向父类的原型对象

```js
class A {
  constructor(value) {
    this.x = value
  }
  p() {
    return 2
  }
}

class B extends A {
  z() {
    // 这是super.p()相当于A.prototype.p()
    // 但只能拿到原型对象上的方法
    // 实例上的属性是拿不到的
    return super.p()
  }

  getX() {
    return super.x
  }
}

/* 
let b = new B()
let res1 = console.log(b.z()) // 2
let res2 = console.log(b.getX()) // undefined
 */
```

## static

// 类相当于原型，在类中定义方法，都会被实例继承

// 但 static 方法不会被实例继承

// 却会被 子类 继承下去（子类实例不会）

// static所描述的就是在class上的方法

// 静态方法可用于创建使用程序函数

```js
class Foo {
  constructor() {
    Foo.getOwn()
    this.constructor.getOwn()
    Foo.prop += 25
  }

  static getOwn() {
    console.log('getOwn')
  }

  static prop = 0
}

class Bar extends Foo{
  constructor() {
    super();
  }
}

let foo = new Foo()
Foo.getOwn()
Bar.getOwn()
console.log(Foo.prop) // '25'
console.log(Bar.prop) // '25'
let sonFoo = new Foo()
let anotherSon = new Bar()
console.log(Foo.prop) // '75'
console.log(Bar.prop) // '75'
anotherSon.getOwn() // 报错
sonFoo.getOwn() // 报错
```

```typescript
// 抽象类
// abstract class Animal{
//   static makeSound(): void;
//   move(): void{
//     console.log('already move two miles')
//   }
// }

// public
// class 实例都可以访问的

// private
// 成员是private时，就不可以在类外去访问
// 可以在内部用this.field访问
// 通常时防止意外修改，或者希望用固定方式读取修改。

class Animal {
  private name: string;
  constructor(theName: string) {
    this.name = theName
  }

  public getName() {
    return this.name
  }

  public setName(newName) {
    this.name = newName
  }
}

class Rabbit extends Animal {
  constructor(name) {
    super(name)
  }
  getName() {
    return this.name // wrong
  }
}
// protected
// protected成员在派生类中依旧可以访问

class Person {
  protected name: string;
  constructor(name) {
    this.name = name
  }
}

class Employee extends Person {

  constructor(name) {
    super(name)
  }

  public getName() {
    return this.name
  }
}

```

