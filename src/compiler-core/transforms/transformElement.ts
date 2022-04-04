import { createVNodeCall, NodeTypes } from '../src/ast';
import { CREATE_ELEMENT_VNODE } from './../src/runtimeHelpers';

export function transformElement(node,context){
  if(node.type === NodeTypes.ELEMENT){
    return () => {
      const vnodeTag = `"${node.tag}"`

      let vnodeProps

      const children = node.children
      let vnodeChildren = children[0]

      node.codegenNode = createVNodeCall(context,vnodeTag,vnodeProps,vnodeChildren)
    }
  }
}