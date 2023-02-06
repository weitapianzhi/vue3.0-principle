// 基础数据
// const data = {
//   text: "a",
//   text2: "v",
//   edit: false
// }
// const obj = {}
// const data = [1, obj]
// const _reactive = reactive(data)
// ********************************************************************** //
// 修改页面代码
// effect(() => {
  // const _d = document.querySelector("#app")
  // _d.innerHTML = _reactive.join(".")
// })

// ********************************************************************** //
/** 
 * 处理潜逃的effect
 */
// let temp, temp2
// effect(() => {
//   console.log("effect1")
//   effect(() => {
//     console.log("effect2")
//     _proxy.text2 = _proxy.text2 + "qt 2"
//   })
//   _proxy.text = _proxy.text + "qt 1"
// })

// ********************************************************************** //
/**
 * forIn
 */
// setTimeout(() => {
//   console.log(_reactive.includes(obj))
// }, 1000)


// ********************************************************************** //
/**
 * 数组操作
 */
// console.log(_reactive.includes());

// ********************************************************************** //
/**
 * Set操作
 */
// effect(() => {
//   console.log(_reactive.size);
// })
// _reactive.add("1123123")
// _reactive.add("1123123")
// _reactive.add("112312333")

// ********************************************************************** //
/**
 * Map操作
 */
// const _reactive = reactive(new Map([["a", "9"]]))
// effect(() => {
//   const _d = document.querySelector("#app")
//   _d.innerHTML = _reactive.get("a")
//   _reactive.set("a", "1")
// })
//  setTimeout(() => {
//   _reactive.set("a", "3")
//  }, 1000)



// 原始 Map 对象 m
// const m = new Map()
// // p1 是 m 的代理对象
// const p1 = reactive(m)
// // p2 是另外一个代理对象
// const p2 = reactive(new Map())
// // 为 p1 设置一个键值对，值是代理对象 p2
// p1.set('p2', p2)

// effect(() => {
//   // 注意，这里我们通过原始数据 m 访问 p2
//   console.log(m.get('p2').size)
// })
// // 注意，这里我们通过原始数据 m 为 p2 设置一个键值对 foo --> 1
// m.get('p2').set('foo', 1)

// ********************************************************************** //
/**
 * map-foreach
*/
// const obj = { obj: 10 }
// const a = new Map([[obj, new Set([1,2,3])]])
// const _reactive = reactive(a)
// effect(() => {
//   _reactive.forEach((value, key) => {
//     console.log(value.size, key);
//   })
// })
// console.log(_reactive.get(obj))
// _reactive.get(obj).delete(1)


// ********************************************************************** //
/**
 * map-iterate
*/
// let obj = {obj: 100}
// const a = new Map([[obj, 2]])
// const _reactive = reactive(a)
// effect(() => {
//   for (const key of _reactive.keys()) {
//     console.log(key, "keys")
//   }
// })
// effect(() => {
//   for (const key of _reactive.values()) {
//     console.log(key, "values")
//   }
// })

// setTimeout(() => {
//   _reactive.set(obj, 100)
// })

