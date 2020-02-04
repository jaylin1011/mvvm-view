import { CompileUtils } from './compile.js'
class Dep {
  constructor() {
    // 存放所有watcher
    this.subs = []
  }
  // 订阅，添加watcher
  addSub(watcher) {
    this.subs.push(watcher)
  }
  // 发布
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm
    this.exp = exp
    this.cb = cb
    // 存放老值
    this.oldValue = this.getOldValue()
  }
  getOldValue() {
    Dep.target = this
    const value = CompileUtils.getValue(this.vm, this.exp)
    Dep.target = null
    return value
  }

  update() {
    const newValue = CompileUtils.getValue(this.vm, this.exp)
    if (newValue !== this.oldValue) {
      this.cb(newValue)
    }
  }
}
export {
  Watcher,
  Dep
}
