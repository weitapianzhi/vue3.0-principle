const a = new createRenderer()
const vnode = {
  type: "ul",
  children: [
    { type: "li", children: "1", key: "1" },
    { type: "li", children: "2", key: "2" },
    { type: "li", children: "3", key: "3" },
    { type: "li", children: "4", key: "4" },
    { type: "li", children: "5", key: "5" },
    { type: "li", children: "6", key: "6" },
  ],
}
const vnode2 = {
  type: "ul",
  children: [
    { type: "li", children: "5", key: "5" },
    { type: "li", children: "2", key: "2" },
    { type: "li", children: "3", key: "3" },
    { type: "li", children: "4", key: "4" },
    { type: "li", children: "7", key: "7" }
  ],
}

a.render(vnode, document.querySelector("#app"))
a.render(vnode2, document.querySelector("#app"))