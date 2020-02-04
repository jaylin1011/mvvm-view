import {
  Watcher
} from './dep-watcher.js'
class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    const fragment = this.nodeToFragment(this.el)
    this.compile(fragment)
    this.el.appendChild(fragment)
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  isEventDirective(attrName) {
    return attrName.startsWith('@')
  }
  isMustache(content) {
    // return content.includes('{{')
    const reg = /\{\{(.+?)\}\}/
    return reg.test(content)
  }
  nodeToFragment(node) {
    const fragment = document.createDocumentFragment()
    let firstChild
    // eslint-disable-next-line no-cond-assign
    while (firstChild = node.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment
  }
  compile(fragment) {
    // 当前模板的第一层子节点
    const childNodes = fragment.childNodes;
    [...childNodes].forEach(child => {
      if (this.isElementNode(child)) {
        this.compileElement(child)
        if (child.childNodes && child.childNodes.length) {
          this.compile(child)
        }
      } else {
        this.compileText(child)
      }
    })
  }
  compileElement(node) {
    const attributes = node.attributes;
    [...attributes].forEach(attr => {
      // 根据属性获取属性名和属性值
      // v-model = 'daisy.name' => {name: 'v-model', value: 'daisy.name'
      const { name, value: exp } = attr
      if (this.isDirective(name)) {
        // 根据属性名字截取指令名字
        // v-model => ['v', 'model']
        const [, directive] = name.split('-')
        // 根据指令名字截取事件名字
        // on:click => ['on', 'click']
        const [directiveName, eventName] = directive.split(':')
        CompileUtils[directiveName](node, exp, this.vm, eventName)
        // 指令编译完成后删除标签的指令属性
        node.removeAttribute(`v-${directive}`)
      } else if (this.isEventDirective(name)) {
        const [, eventName] = name.split('@')
        CompileUtils['on'](node, exp, this.vm, eventName)
      }
    })
  }
  compileText(node) {
    const content = node.textContent
    if (this.isMustache(content)) {
      CompileUtils['mustache'](node, content, this.vm)
    }
  }
}
const CompileUtils = {
  // 根据表达式获取对应的数据
  getValue(vm, exp) {
    return exp.split('.').reduce((data, current) => data[current], vm.$data)
  },
  setValue(vm, exp, value) {
    return exp.split('.').reduce((data, current, index, arr) => index === arr.length - 1 ? data[current] = value : data[current], vm.$data)
  },
  getMustacheValue(vm, exp) {
    const reg = /\{\{(.+?)\}\}/g
    return exp.replace(reg, (...args) => this.getValue(vm, args[1]))
  },
  model(node, exp, vm) {
    const fn = this.updater['modelUpdater']
    new Watcher(vm, exp, (newValue) => { fn(node, newValue) })
    // 双向数据绑定
    node.addEventListener('input', e => {
      const value = e.target.value
      this.setValue(vm, exp, value)
    })
    const value = this.getValue(vm, exp)
    fn(node, value)
  },
  html(node, exp, vm) {
    const fn = this.updater['htmlUpdater']
    new Watcher(vm, exp, (newValue) => { fn(node, newValue) })
    const value = this.getValue(vm, exp)
    fn(node, value)
  },
  text(node, exp, vm) {
    const fn = this.updater['textUpdater']

    const reg = /\{\{(.+?)\}\}/g
    let value
    if (exp.includes('{{')) {
      value = exp.replace(reg, (...args) => {
        new Watcher(vm, args[1], () => {
          fn(node, this.getMustacheValue(vm, exp))
        })
        return this.getValue(vm, args[1])
      })
    } else {
      new Watcher(vm, exp, (newValue) => { fn(node, newValue) })
      value = this.getValue(vm, exp)
    }
    fn(node, value)
  },
  mustache(node, content, vm) {
    const fn = this.updater['mustacheUpdater']
    const reg = /\{\{(.+?)\}\}/g
    const value = content.replace(reg, (...args) => {
      new Watcher(vm, args[1], () => {
        fn(node, this.getMustacheValue(vm, content))
      })
      return this.getValue(vm, args[1])
    })
    fn(node, value)
  },
  on(node, exp, vm, eventName) {
    node.addEventListener(eventName, (e) => {
      vm[exp].call(vm, e)
    })
  },
  updater: {
    modelUpdater(node, value) {
      node.value = value
    },
    htmlUpdater(node, value) {
      node.innerHTML = value
    },
    textUpdater(node, value) {
      node.textContent = value
    },
    mustacheUpdater(node, value) {
      node.textContent = value
    }
  }
}
export {
  Compile,
  CompileUtils
}
