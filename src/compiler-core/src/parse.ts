import {NodeTypes} from './ast'

const enum TagType {
  Start,
  End
}

export function baseParse(content:string){
  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

function parseChildren(context){

  const nodes:any[] = []

  let node
  const s = context.source
  if(s.startsWith('{{')){
    node = parseInterpolation(context)
  }else if(s[0]==='<'){
    if(/[a-z]/i.test(s[1])){
      node = parseElement(context)
    }
  }

  nodes.push(node)

  return nodes
}

function parseInterpolation(context: any){
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

function parseElement(context: any) {
  const element = parseTag(context,TagType.Start)

  parseTag(context,TagType.End)

  return element
}

function parseTag(context:any,type:TagType){
  const match:any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  advanceBy(context,match[0].length+1)

  if(type === TagType.End) return

  return {
    type:NodeTypes.ELEMENT,
    tag
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
