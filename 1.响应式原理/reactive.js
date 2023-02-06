/**
 * 1.设置响应式数据
 * 2.存储副作用函数
 * 2.1.1 每一个target对应一个桶，用于存储每一个target中的key对应的副作用函数
 * 3.讲响应式数据与副作用函数关联
 * 3.1. 使用get方法的时候保存对应的副作用函数
 * 3.2. 使用set方法的使用触发副作用函数
 * 3.3. for.in 循环会触发target 操作
 */
const ITERATE_KEY = Symbol("ITERATE_KEY")
const MAP_ITERATE_KEY = Symbol('MAP_ITERATE_KEY')
// 设置代理
const bocket = new WeakMap()
const reactiveMap = new Map()
// 生成代理  proxy是对对象的内部方法的代理
const reactive = function(obj) {
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy
  const proxy = createReactive(obj)
  reactiveMap.set(obj, proxy)
  return proxy
}
const shallowReactive = function(obj) {
  return createReactive(obj, true)
}
const createOnlyReactive = function(obj) {
  return createReactive(obj, false, true)
}

const createReactive = function(data, isShallow = false, isReadonly = false) {
  return new Proxy(data, {
    set(target, key, value, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }
      const _isOwnKey = Array.isArray(target)
        ? Number(key) < target.length ? "SET" : "ADD"
        : Object.prototype.hasOwnProperty.call(target, key) ? "SET" : "ADD"
        const oldValue = target[key]
        const res = Reflect.set(target, key, value, receiver)
        // 判断当前target是不是原始数据   解决继承问题
      if (target === receiver.raw) {
        if (oldValue !== value && (oldValue !== oldValue || value !== value)) {
          trigger(target, key, _isOwnKey, value)
        }
      }
      return res
    },
    get(target, key, receiver) {
      if (key === "raw") return target
      if (Array.isArray(target) && arrayInstumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstumentations, key, receiver)
      }
      if (target instanceof Set) {
        if (key === "size") {
          track(target, ITERATE_KEY)
          return Reflect.get(target, key, target)
        } else if (setInstumentations.hasOwnProperty(key)) {
          return setInstumentations[key]
        } else {
          return target[key]
        }
      }
      if (target instanceof Map) {
        if (key === "size") {
          track(target, ITERATE_KEY)
          return Reflect.get(target, key, target)
        } else if (mapInstumentations.hasOwnProperty(key)) {
          return mapInstumentations[key]
        } else {
          return target[key]
        }
      }
      if (!isReadonly && key !== "symbol") {
        track(target, key)
      }
      const res = Reflect.get(target, key, receiver)
      if (isShallow) {
        return res
      }
      if (typeof res === "object" && res !== null) {
        return isReadonly ? createOnlyReactive(res) : reactive(res)
      }
      return res
    },
    // forIn方法会触发ownKeys
    ownKeys(target) {
      track(target, Array.isArray(target) ? "length" : ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    // delete方法会触发deleteProperty
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }
      trigger(target, key, "DELETE")
      return Reflect.deleteProperty(target, key)
    }
  })
}

const track = function(target, key) {
  if (!activeEffect || !shouldStrack) return
  let _bocket = bocket.get(target)
  if (!_bocket) {
    bocket.set(target, (_bocket = new Map()))
  }
  let _deps = _bocket.get(key)
  if (!_deps) {
    _bocket.set(key, (_deps = new Set()))
  }
  _deps.add(activeEffect)
  activeEffect.deps && activeEffect.deps.push(_deps)
}

const trigger = function(target, key, type, newVal) {
  const _bocket = bocket.get(target)
  if (!_bocket) return
  const _deps = _bocket.get(key) || []
  const _iterateDeps = _bocket.get(ITERATE_KEY)
  const _mapKeysIterateDeps = _bocket.get(MAP_ITERATE_KEY)
  const _newDeps = new Set(_deps)
  const effectFncRun = new Set()
  _newDeps && _newDeps.forEach((fn, idx) => {
    if (fn !== activeEffect) {
      effectFncRun.add(fn)
    }
  })
  // 由于Map的数据不仅值会变化  健的数量也会变化 所以也要触发对应的副作用函数
  if (type === "ADD" || type === "DELETE" || ( type === "SET" && Object.prototype.toString.call(target) === "[object Map]" )) {
    _iterateDeps && _iterateDeps.forEach(fn => {
      if (fn !== activeEffect) {
        effectFncRun.add(fn)
      }
    })
  }
  if ((type === "ADD" || type === "DELETE") && Object.prototype.toString.call(target) === "[object Map]") {
    _mapKeysIterateDeps && _mapKeysIterateDeps.forEach(fn => {
      if (fn !== activeEffect) {
        effectFncRun.add(fn)
      }
    })
  }
  if (key === "length" && Array.isArray(target)) {
    _bocket.forEach((effects, idx) => {
      if (idx >= newVal) {
        effects.forEach((fn) => {
          if (fn !== activeEffect) {
            effectFncRun.add(fn)
          }
        })
      }
    })
  }
  effectFncRun.forEach(fn => fn())
}

// 清空副作用函数
const clearup = function(effectFn) {
  effectFn.deps.forEach(v => {
    v.delete(effectFn)
  })
  effectFn.deps.length = 0
}

// 封装副作用函数
let activeEffect = null
let effectTrack = []
const effect = function(fn, options = {}) {
  const effectFn = function() {
    clearup(effectFn)
    activeEffect = effectFn
    effectTrack.push(effectFn)
    fn()
    effectTrack.pop()
    activeEffect = effectTrack[effectTrack.length - 1]
  }
  effectFn.options = options
  effectFn.deps = [] // 用于存储该副作用函数被引用的地方
  effectFn()
}