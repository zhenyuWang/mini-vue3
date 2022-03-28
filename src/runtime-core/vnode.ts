import { isString,isArray } from '../shared/index'
import {ShapeFlags} from '../shared/shapeFlags'

export function createVNode(type,props?,children?){
  const vnode = {
    type,
    props,
    children,
    shapeFlag:getShapeFlag(type),
    el:null
  }

  if(isString(children)){
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }else if(isArray(children)){
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

function getShapeFlag(type){
  return isString(type)?ShapeFlags.ELEMENT:ShapeFlags.STATEFUL_COMPONENT
}