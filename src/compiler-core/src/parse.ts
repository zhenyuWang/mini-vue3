import {NodeTypes} from './ast'

const enum TagType {
  Start,
  End
}

export function baseParse(content:string){
  const context = createParserContext(content)

  return createRoot(parseChildren(context,[]))
}

function parseChildren(context,ancestors:string[]){
  const nodes:any[] = []

  while(!isEnd(context,ancestors)){
    let node
    const s = context.source

    if(s.startsWith('{{')){
      node = parseInterpolation(context)
    }
    else if(s[0]==='<'){
      if(/[a-z]/i.test(s[1])){
        node = parseElement(context,ancestors)
      }
    }

    if(!node){
      node = parseText(context)
    }

    nodes.push(node)
  }

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
  const rawContent = parseTextData(context,closeIndex)
  const content = rawContent.trim()
  // 更新 context.source
  advanceBy(context,closeDelimiter.length)

  return {
    type:NodeTypes.INTERPOLATION,
    content:{
      type:NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}

function parseElement(context: any,ancestors:string[]) {
  const element:any = parseTag(context,TagType.Start)

  ancestors.push(element.tag)
  element.children = parseChildren(context,ancestors)
  ancestors.pop()

  if(startsWithEndTagOpen(context.source,element.tag)){
    parseTag(context,TagType.End)
  }else{
    throw new Error(`${element.tag} lack end tag`)
  }

  return element
}

function isEnd(context,ancestors){
  const s = context.source
  if(s.startsWith('</')){
    for(let i = ancestors.length-1;i>=0;i--){
      const tag = ancestors[i]
      if(startsWithEndTagOpen(s,tag)){
        return true
      }
    }
  }
  return !context.source
}

function parseText(context:any){
  let endIndex = context.source.length
  let endToken = ['<','{{']

  for(let i = 0;i<endToken.length;i++){
    const index = context.source.indexOf(endToken[i])
    if(index!==-1 && index<endIndex){
      endIndex = index
    }
  }

  const content = parseTextData(context,endIndex)

  return {
    type:NodeTypes.TEXT,
    content
  }
}

function startsWithEndTagOpen(source:string,tag:string){
  return source && source.slice(2,2+tag.length)===tag
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

function parseTextData(context:any,length:number){
  const content = context.source.slice(0,length)

  advanceBy(context,length)

  return content
}

function advanceBy(context:any,length:number){
  context.source = context.source.slice(length)
}

function createRoot(children){
  return {
    children,
    type:NodeTypes.ROOT
  }
}

function createParserContext(content:string){
  return {
    source:content
  }
}
