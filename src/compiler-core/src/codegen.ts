import { NodeTypes } from './ast'
import { helperMapName,TO_DISPLAY_STRING } from './runtimeHelpers'

export function generate(ast){
  const context = createCodegenContext()
  const {push} = context

  if(ast.helpers.length){
    genFunctionPreamble(ast,context)
  }

  const functionName = 'render'
  const args = ['_ctx','_cache']
  const signature = args.join(', ')

  push('return ')
  push(`function ${functionName}(${signature}){\n`)
  push('return ')
  genNode(ast.codegenNode,context)
  push('\n}')

  return {
    code:context.code
  }
}

function createCodegenContext(){
  const context = {
    code:"",
    push(source){
      context.code += source
    },
    helper(key){
      return `_${helperMapName[key]}`
    }
  }
  return context
}

function genFunctionPreamble(ast,context){
  const {push} = context
  const VueBinging = 'Vue'
  const aliasHelper = (s) => {
    return `${helperMapName[s]}: _${helperMapName[s]}`
  }
  push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}\n`)
}

function genNode(node,context){

  switch(node.type){
    case NodeTypes.TEXT:
      genText(node,context)
    break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node,context)
    break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node,context)
    break
  }
}

function genText(node,context){
  const {push} = context
  push(`"${node.content}"`)
}

function genInterpolation(node,context){
  const {push,helper} = context

  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content,context)
  push(')')
}

function genExpression(node,context){
  const {push} = context

  push(node.content)
}