/**
  模式     能否解析标签 是否支持 HTML 实体
  DATA    能         是
  RCDATA  否         是
  RAWTEXT 否         否
  CDATA   否         否
*/
const TextModes = {
  DATA: 'DATA',
  RCDATA: 'RCDATA',
  RAWTEXT: 'RAWTEXT',
  CDATA: 'CDATA'
}

const parse = function(str) {
  const context = {
    source: str,
    mode: TextModes.DATA,
    parent: null,
    // advanceBy 函数用来消费指定数量的字符，它接收一个数字作为参数
    advanceBy(num) {
    // 根据给定字符数 num，截取位置 num 后的模板内容，并替换当前模板内
      context.source = context.source.slice(num)
    },
    // 无论是开始标签还是结束标签，都可能存在无用的空白字符，例如 <div
    advanceSpaces() {
      // 匹配空白字符
      const match = /^[\t\r\n\f ]+/.exec(context.source)
      if (match) {
        // 调用 advanceBy 函数消费空白字符
        context.advanceBy(match[0].length)
      }
    }
  }
  const nodes = parseChildren(context, [])
  return {
    type: "Root",
    children: nodes
  }
}

const isEnd = function(context, ancestors) {
  // 当模板内容解析完毕后，停止
  if (!context.source) return true
  // 与父级节点栈内所有节点做比较
  for (let i = ancestors.length - 1; i >= 0; --i) {
    // 只要栈中存在与当前结束标签同名的节点，就停止状态机
    if (context.source.startsWith(`</${ancestors[i].tag}`)) {
    return true
    }
  }
}

const parseChildren = function(context, ancestors) {
  // 定义 nodes 数组存储子节点，它将作为最终的返回值
  let nodes = []
  // 从上下文对象中取得当前状态，包括模式 mode 和模板内容 source
  const { mode } = context
  while(!isEnd(context, ancestors)) {
    let node
    let source = context.source
    /**
     * 标签节点，例如 <div>。
      文本插值节点，例如 {{ val }}。
      普通文本节点，例如：text。
      注释节点，例如 <!---->。
      CDATA 节点，例如 <![CDATA[ xxx ]]>。
     */
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && source[0] === "<") {
        if (source[1] === "!") {
          // 注释节点
          if (source.startsWith("<!--")) {
            node = parseComment(context)
          } else if (source.startsWith("<![CDATA")) {
            node = parseCDATA(context)
          }
        } else if (source[1] === "\/") {
          // 标签结束
          console.error('无效的结束标签')
          continue
        } else if (/[a-z]/i.test(source[1])) {
          node = parseElement(context, ancestors)
        }
      } else if (source.startsWith("{{")) {
        node = parseInterpolation(context)
      }
    }
    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}


// console.log(parse(`<div><p></p><p>{{ abc.name }}</p></div>`))