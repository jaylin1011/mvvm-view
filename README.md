# mvvm-view

to implement view as a simple MVVM framework

仿 Vue 版 MVVM 响应式原理的简单实现
数据劫持 + 发布-订阅模式
![](/assets/mvvm.jpg)

## 数据代理和数据劫持

基于 Object.defineProperty() 的 Data Bindings 和 Dom Listeners

![](/assets/vue2.jpg)

## 一般指令编译

- v-model
- v-text
- v-html

## 事件指令编译

- v-on | @

## 编译{{}}插值表达式
