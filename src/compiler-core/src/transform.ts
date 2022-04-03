export function transform(root,options={}){
  // 获取上下文对象
  const context = createTransformContext(root,options)

  // 递归处理 ast
  traverseNode(root,context)

  createRootCodegen(root)
}

function createTransformContext(root,options){
  const context = {
    root,
    nodeTransforms:options.nodeTransforms||[]
  }

  return context
}

function traverseNode(node,context){
  // 获取外部传入 transforms，并遍历执行
  const nodeTransforms = context.nodeTransforms
  for(let i = 0;i<nodeTransforms.length;i++){
    const transform = nodeTransforms[i]
    transform(node)
  }

  traverseChildren(node,context)
}

function traverseChildren(node,context){
  const children = node.children
  if(children){
    for(let i = 0;i<children.length;i++){
      const node = children[i]
      traverseNode(node,context)
    }
  }
}

function createRootCodegen(root){
  root.codegenNode = root.children[0]
}