import {
  Dep
} from './dep-watcher.js'

class Observer {
  constructor(data) {
    this.observer(data)
  }
  isObject(value) {
    return !!value && typeof value === 'object'
  }
  observer(data) {
    if (this.isObject(data)) {
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          const methods = ['pop', 'push', 'shift', 'unshift', 'sort', 'reverse', 'splice']
          let prototype = Object.create(Array.prototype)
          const self = this;
          methods.forEach(method => {
            prototype[method] = function () {
              [...arguments].forEach(value => { self.observer(value) })
              return Array.prototype[method].call(this, ...arguments)
            }
          })
          data[key].forEach(v => { this.observer(v) })
          Object.setPrototypeOf(data[key], prototype)
        }
        this.defineReactive(data, key, data[key])
      })

    }
  }
  defineReactive(target, key, value) {
    // 递归劫持嵌套对象
    this.observer(value)
    const dep = new Dep()
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: false,
      get() {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (newValue) => {
        if (newValue !== value) {
          value = newValue
          // 赋值为新对象，继续递归劫持
          this.observer(value)
          dep.notify()
        }
      }
    })
  }
}
export default Observer
