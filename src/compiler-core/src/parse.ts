import {NodeTypes} from './ast'

export function baseParse(content:string){
  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

function parseChildren(context){

  const nodes:any[] = []

  let node
  if(context.source.startsWith('{{')){
    node = parseInterpolation(context)
  }

  nodes.push(node)

  return nodes
}

function parseInterpolation(context){
  // {{message}}

  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  // 干掉前面的 {{
  advanceBy(context,openDelimiter.length)
  // 获取结束位置下标
  const closeIndex = context.source.indexOf(closeDelimiter,openDelimiter.length)
  // 截取插值
  const rawContent = context.source.slice(0,closeIndex)
  const content = rawContent.trim()
  // 更新 context.source
  advanceBy(context,closeIndex+closeDelimiter.length)

  return {
    type:NodeTypes.INTERPOLATION,
    content:{
      type:NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}

function advanceBy(context:any,length:number){
  context.source = context.source.slice(length)
}

function createRoot(children){
  return {
    children
  }
}

function createParserContext(content:string){
  return {
    source:content
  }
}