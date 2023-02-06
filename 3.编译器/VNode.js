// 当前动态节点集合
let currentDynamicChildren = null
// openBlock 用来创建一个新的动态节点集合，并将该集合压入栈中
function openBlock() {
  currentDynamicChildren = []
}

function createVNode(tag, props, children, flags, parentFlags) {
  console.log(props)
  const key = props && props.key
  props && delete props.key
  const vnode = {
    tag,
    props,
    children,
    key,
    patchFlags: flags,
    parentFlags
  }
  if (typeof flags !== 'undefined' && currentDynamicChildren) {
    // 动态节点，将其添加到当前动态节点集合中
    currentDynamicChildren.push(vnode)
  }
  return vnode
}

function createBlock(tag, props, children, parentFlags) {
  // block 本质上也是一个 vnode
  const block = createVNode(tag, props, children)
  // 将当前动态节点集合作为 block.dynamicChildren
  if (parentFlags) {
    const _currentDynamicChildren = [...currentDynamicChildren]
    currentDynamicChildren = []
    block.dynamicChildren = []
    for (let i = 0; i < _currentDynamicChildren.length; i++) {
      const node = _currentDynamicChildren[i]
      if (node.parentFlags && node.parentFlags === parentFlags) {
        block.dynamicChildren.push(node)
      } else {
        currentDynamicChildren.push(node)
      }
    }
    currentDynamicChildren.push(block)
  } else {
    block.dynamicChildren = currentDynamicChildren
  }
  // 返回
  return block
}

let res
(openBlock(), res = createBlock('div', null, [
  createBlock("div", null, [
    createVNode('span', { class: 'bar1' }, null, 1, "10"),
    createVNode('span', { class: 'bar2' }, null, 1, "10"),
    createVNode('span', { class: 'bar3' }, [
      createVNode('span', { class: 'bar2' }, null)
    ]),
  ], "10"),
  createVNode('p', { class: 'bar' }, [
    createVNode('span1', { class: 'bar4' }, null, 1),
    createBlock("div1", null, [
      createVNode('span2', { class: 'bar5' }, null, 1, "11"),
      createVNode('span3', { class: 'bar6' }, null, 1, "11"),
      createVNode('span4', { class: 'bar7' }, [
        createBlock("div2", null, [
          createVNode('span5', { class: 'bar8' }, null, 1, "12"),
        ], "12")
      ])
    ], "11")
  ])
]))
console.log(res, "res")