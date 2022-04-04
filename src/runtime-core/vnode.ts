import { isString,isArray, isObject } from '../shared/index'
import {ShapeFlags} from '../shared/shapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export {createVNode as createElementVNode}

export function createVNode(type,props?,children?){
  const vnode = {
    type,
    props,
    children,
    key:props?.key,
    shapeFlag:getShapeFlag(type),
    el:null
  }

  if(isString(children)){
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }else if(isArray(children)){
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    if(isObject(children)){
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  }

  return vnode
}

function getShapeFlag(type){
  return isString(type)?ShapeFlags.ELEMENT:ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode(text:string){
  return createVNode(Text,{},text)
}

export function isSameVNodeType(n1,n2){
  return n1.type === n2.type && n1.key === n2.key
}