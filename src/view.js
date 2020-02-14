import { Compile } from './compile.js'
import Observer from './observer.js'
class View {
  constructor(options) {
    const { el, data, computed, methods } = options
    this.$el = el
    this.$data = data
    if (this.$el) {
      new Observer(this.$data)
      this.compileComputed(this.$data, computed)
      this.compileMethods(methods)
      // 数据代理vm.$data.xxx => vm.xxx
      this._proxy(this.$data)

      new Compile(this.$el, this)
    }
  }
  compileComputed(data, computed) {
    Object.keys(computed).forEach(key => {
      Object.defineProperty(data, key, {
        get: () => computed[key].call(this)
      })
    })
  }
  compileMethods(methods) {
    Object.keys(methods).forEach(key => {
      Object.defineProperty(this, key, {
        get: () => methods[key]
      })
    })
  }
  _proxy(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newValue) {
          data[key] = newValue
        }
      })
    })
  }
}

export default View
