import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelpers'

export function transform(root,options={}){
  // 获取上下文对象
  const context = createTransformContext(root,options)

  // 递归处理 ast
  traverseNode(root,context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createTransformContext(root,options){
  const context = {
    root,
    nodeTransforms:options.nodeTransforms ?? [],
    helpers: new Map(),
    helper(key){
      context.helpers.set(key,1)
    }
  }

  return context
}

function traverseNode(node,context){
  // 获取外部传入 transforms，并遍历执行
  const nodeTransforms = context.nodeTransforms
  const exitFns:any[] = []

  for(let i = 0;i<nodeTransforms.length;i++){
    const transform = nodeTransforms[i]
    const onExit = transform(node,context)
    if(onExit){
      exitFns.push(onExit)
    }
  }

  switch(node.type){
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
    break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node,context)
    break
  }

  for(let i = exitFns.length-1;i>=0;i--){
    exitFns[i]()
  }

}

function traverseChildren(node,context){
  const children = node.children
  for(let i = 0;i<children.length;i++){
    const node = children[i]
    traverseNode(node,context)
  }
}

function createRootCodegen(root){
  const { children } = root
  const child = children[0]

  if(child.type === NodeTypes.ELEMENT){
    root.codegenNode = child.codegenNode
  }else{
    root.codegenNode = child
  }
}