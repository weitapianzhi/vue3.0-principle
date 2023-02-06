let arrayInstumentations = {};
// Array 相关方法
["includes", "indexOf", "lastIndexOf"].forEach((methodName) => {
  const originMethod = Array.prototype[methodName];
  arrayInstumentations[methodName] = function(...args) {
    let res = originMethod.call(this, ...args)
    if (res === false || res === -1) {
      res = originMethod.call(this.raw, ...args)
    }
    return res
  }
})


let shouldStrack = true;
["push", "pull", "unshift", "shift", "splice"].forEach((methodName) => {
  const originMethod = Array.prototype[methodName];
  arrayInstumentations[methodName] = function(...args) {
    shouldStrack = false
    const res = originMethod.apply(this, args)
    shouldStrack = true
    return res
  }
})