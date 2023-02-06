const ref = function(val) {
  const wrapper = {
    value: val
  }
  Object.defineProperty(wrapper, "__v__isRef", {
    value: true
  })
  return reactive(wrapper)
}
const toRef = function(obj, key) {
  Object.defineProperty(obj, "__v__isRef", {
    value: true
  })
  return {
    get value() {
      obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  }
}

const toRefs = function(obj) {
  const wrapper = {}
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      wrapper[key] = toRef(obj, key)
    }
  }
  return wrapper
}

const proxyRefs = function(obj) {
  return new Proxy(obj, {
    set(target, key, value, receiver) {
      const _target = target[key]
      if (_target.hasOwnProperty("__v__isRef")) {
        _target.value = value
        return true
      }
      return Reflect.set(target, key, value, receiver)
    },
    get(target, key, receiver) {
      const _target = Reflect.get(target, key, receiver)
      const res = _target.hasOwnProperty("__v__isRef") ? value.value : value
      return res
    }
  })
}