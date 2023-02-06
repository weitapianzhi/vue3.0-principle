const setInstumentations = {
  "add": function(key) {
    const target = this.raw
    const hasKey = target.has(key)
    const res = target.add(key)
    if (!hasKey) {
      trigger(target, ITERATE_KEY, "ADD")
    }
    return res
  },
  "delete": function(key) {
    const target = this.raw
    target.delete(key)
    trigger(target, key, "DELETE")
  }
}
const iterateInstance = function() {
  const wrap = (v) => typeof v === 'object' ? reactive(v) : v
  const target = this.raw
  const _itr = target[Symbol.iterator]()
  track(target, ITERATE_KEY)
  return {
    next() {
      const v = _itr.next()
      return {
        value: v.value ? [ wrap(v.value[0]), wrap(v.value[1]) ] : v.value,
        done: v.done
      }
    },
    [Symbol.iterator]: function() {
      return this
    }
  }
}
const valuesIterateInstance = function() {
  const target = this.raw
  const values = target.values()
  track(target, ITERATE_KEY)
  const wrap = (v) => typeof v === 'object' ? reactive(v) : v
  return {
    next() {
      const v = values.next()
      return {
        value: v.value ? wrap(v.value) : v.value,
        done: v.done
      }
    },
    [Symbol.iterator]: function() {
      return this
    }
  }
}
const keysIterateInstance = function() {
  const target = this.raw
  const values = target.keys()
  track(target, MAP_ITERATE_KEY)
  const wrap = (v) => typeof v === 'object' ? reactive(v) : v
  return {
    next() {
      const v = values.next()
      return {
        value: v.value ? wrap(v.value) : v.value,
        done: v.done
      }
    },
    [Symbol.iterator]: function() {
      return this
    }
  }
}
const mapInstumentations = {
  "set": function(key, value) {
    const target = this.raw
    const hasKey = target.has(key)
    const oldValue = target.get(key)
    const rawValue = value.raw || value
    target.set(key, rawValue)
    if (!hasKey) {
      trigger(target, key, "ADD")
    } else if (oldValue !== value && !Object.is(oldValue, value)) {
      trigger(target, key, "SET")
    }
  },
  "get": function(key) {
    const target = this.raw
    const hasKey = target.has(key)
    const res = target.get(key)
    if (!hasKey) {
      return hasKey
    } else {
      track(target, key)
      return typeof res === 'object' ? reactive(res) : res
    }
  },
  "forEach": function(callback) {
    const wrap = (v) => typeof v === 'object' ? reactive(v) : v
    const target = this.raw
    track(target, ITERATE_KEY)
    target.forEach((value, key) => {
      callback(wrap(value), wrap(key), this)
    })
  },
  [Symbol.iterator]: iterateInstance,
  entries: iterateInstance,
  values: valuesIterateInstance,
  keys: keysIterateInstance
}