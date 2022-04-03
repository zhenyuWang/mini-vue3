import { NodeTypes } from '../src/ast';

export function transformExpression(node){
  if(node.type === NodeTypes.INTERPOLATION){
    processExpression(node.content)
  }
}

function processExpression(node){
  node.content = `ctx.${node.content}`
}