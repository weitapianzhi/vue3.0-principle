const Text = Symbol()
const Comment = Symbol()
const Fragment = Symbol()
class createRenderer {
  constructor(options) {
    this.options = options
  }
  render(vnode, container) {
    if (vnode) {
      this.patch(container._vnode, vnode, container)
    } else {
      this.unmount(container._vnode)
    }
    container._vnode = vnode
  }
  patch(n1, n2, container) {
    if (n1 && n1.type && n1.type !== n2.type) {
      this.unmount(n1)
      n1 = null
    }

    const { type } = n2
    if (typeof type === "string") {
      if (!n1) {
        this.mountElement(n2, container)
      } else {
        this.patchElement(n1, n2)
      }
    } else if (type === Text) {
      if (!n1) {
        const el = n2.el = document.createTextNode(n2.children)
        container.appendChild(container, el)
      } else {
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          el.nodeValue = n2.children
        }
      }
    } else if (type === Comment) {
      if (!n1) {
        const el = n2.el = document.createComment(n2.children)
        container.appendChild(container, el)
      } else {
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          el.nodeValue = n2.children
        }
      }
    } else if (type === Fragment) {
      if (!n1) {
        n2.children.forEach(child => this.patch(null, child, container))
      } else {
        this.patchChildren(n1.children, n2.children, container)
      }
    }
  }
  // 挂载节点
  mountElement(vnode, container) {
    const el = document.createElement(vnode.type)
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        this.patch(null, child, el)
      })
    }
    let key = null;
    for (key in vnode.props) {
      this.patchProps(el, key, null, vnode.props[key])
    }
    vnode.el = el
    container.appendChild(el)
  }
  // 更新元素
  patchElement(n1, n2) {
    const el = n2.el = n1.el
    const newProps = n2.props
    const oldProps = n1.props

    // 1.更新props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        this.patchProps(el, key, oldProps[key], newProps[key])
      }
    }

    for (const key in oldProps) {
      if (!(key in newProps)) {
        this.patchProps(el, key, oldProps[key], null)
      }
    }

    // 2.更新children
    this.patchChildren(n1, n2, el)
  }
  patchChildren(n1, n2, container) {
    /**
     * 节点类型分为1.无子节点 2.单一子节点 3.一组子节点
     */
    if (typeof n2.children === "string") {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(child => this.unmount(child))
      } else {
        this.setElementText(container, "")
      }
      container.textContent = n2.children
    } else if (Array.isArray(n2.children)) {
      // to do
      if (Array.isArray(n1.children)) {
        this.patchKeysChildren(n1, n2, n2.el)  
      } else {
        this.setElementText(container, "")
        n2.children.forEach((child) => this.patch(null, child, n2.el))
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(child => this.unmount(child))
      } else if (typeof n1.children === "string") {
        this.setElementText(container, "")
      }
    }
  }
  /** 快速diff算法
  */
  patchKeysChildren(n1, n2, container) {
    //1. 比较头尾是否有相同的元素
    let j = 0
    let oldNode = n1.children[j]
    let newNode = n2.children[j]
    while (oldNode && newNode && oldNode.key === newNode.key) {
      this.patch(oldNode, newNode, container)
      j++
      oldNode = n1.children[j]
      newNode = n2.children[j]
    }

    let oldEndIdx = n1.children.length - 1
    let newEndIdx = n2.children.length - 1
    newNode = n2.children[newEndIdx]
    oldNode = n1.children[oldEndIdx]
    while (oldNode && newNode && oldNode.key === newNode.key) {
      this.patch(oldNode, newNode, container)
      oldNode = n1.children[--oldEndIdx]
      newNode = n2.children[--newEndIdx]
    }
    if (j > oldEndIdx && j <= newEndIdx) {
      // 需要新增的元素
      for (let i = j; i <= newEndIdx; i++) {
        // 当前处理的元素
        const newNode = n2.children[i]
        // 需要插入的元素
        this.patch(null, newNode, container)
        // 锚点元素
        const anchor = n2.children[i + 1]
        container.insertBefore(newNode.el, anchor ? anchor.el : null)
      }
    } else if (j > newEndIdx && j <= oldEndIdx) {
      // 需要删除的元素
      for (let i = j; i <= oldEndIdx; i++) {
        // 当前处理的元素
        this.unmount(n1.children[i])
      }
    } else {
      // 存储新节点所有的key
      const keyIndex = {}
      for (let i = j; i <= newEndIdx; i++) {
        keyIndex[n2.children[i].key] = i
      }
      // 新生成数组的长度
      const count = newEndIdx - j + 1
      // 当前打过补丁的次数
      let patchCount = 0
      // 是否需要移动元素
      let isMouve = false
      let pos = 0
      // 用于存储新节点每一个key老节点中的索引值
      const source = []
      source.length = count
      source.fill(-1)
      // 需要移动的元素
      console.log(keyIndex)
      for (let i = j; i <= oldEndIdx; i++) {
        oldNode = n1.children[i]
        if (patchCount <= count) {
          const k = keyIndex[oldNode.key]
          // 设置source
          if (k || k === 0) {
            source[k - j] = i
            patchCount++
            this.patch(oldNode, n2.children[k], n2.el)
            if (k < pos) {
              isMouve = true
            } else {
              pos = k
            }
            // 判断是否需要移动
          } else {
            this.unmount(oldNode)
          }
        } else {
          this.unmount(oldNode)
        }
      }
      const seq = this.getSequence(source)
      let i = count - 1
      let s = seq.length - 1
      if (isMouve) {
        for (i; i >= 0; i--) {
          if (source[i] === -1) {
            // 新增元素
            const newNode = n2.children[i + j]
            this.patch(null, newNode, n2.el)
            const anchor = n2.children[i + j + 1] || null
            container.insertBefore(newNode.el, anchor ? anchor.el : anchor) 
          } else if (i !== seq[s]) {
            // 如果当前的节点不是持续连续递增则需要移动
            const newNode = n2.children[i + j]
            const anchor = n2.children[i + j + 1] || null
            container.insertBefore(newNode.el, anchor ? anchor.el : anchor) 
          } else {
            s--
          }
        }
      }
    }
  }
  unmount(vnode) {
    const parent = vnode.el.parentNode
    if (parent) {
      parent.removeChild(vnode.el)
    }
  }
  patchProps(el, key, preVal, nextVal) {
    if (/^on/.test(key)) {
      const invokes = el.__vie || (el.__vie = {})
      const name = key.slice(2).toLowerCase()
      let invoke = invokes[key]
      if (nextVal) {
        if (!invoke) {
          invoke = el.__vie[key] = (e) => {
            if (e.timeStamp < invoke.registerDate) return
            if (Array.isArray(nextVal)) {
              invoke.value.forEach(fn => fn(e))
            } else {
              invoke.value(e)
            }
          }
          invoke.value = nextVal
          invoke.registerDate = performance.now()
          el.addEventListener(name, invoke)
        } else {
          invoke.value = nextVal
        }
      } else {
        invokes[key] = null
        el.addEventListener(name, invoke)
      }
    } else if (key === "class") {
      el.className = this.normalizeClass(nextVal)
    } else if (this.shouldSetProp(key, el)) {
      const type = typeof nextVal
      if (type === "boolean" && nextVal === "") {
        el[key] = true
      } else {
        el[key] = nextVal
      }
    } else {
      el.setAttribute(key, nextVal)
    }
  }
  shouldSetProp(key, el) {
    if (key === "form" && el.tagName === "INPUT") return false
    return key in el
  }
  normalizeClass(classValue) {
    let res = []
    if (!classValue) return ""
    if (Array.isArray(classValue)) {
      classValue.forEach((v) => {
        if (typeof v === "string") {
          res.push(v)
        } else {
          res.push(this.normalizeClass(v))
        }
      })
    } else if (typeof classValue === "object") {
      for (const key in classValue) {
        const v = classValue[key]
        v && res.push(key)
      }
    } else {
      classValue && res.push(classValue)
    }
    return res.join(" ")
  }
  setElementText(container, text) {
    const el = document.createTextNode(text)
    container.appendChild(el)
  }
  setElementComment(container, text) {
    const el = document.createComment(text)
    container.appendChild(el)
  }
  getSequence(arr) {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = ((u + v) / 2) | 0
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
  }
}