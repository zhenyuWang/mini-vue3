import {mutableHandlers,readonlyHandlers,shallowReactiveHandlers,shallowReadonlyHandlers} from './baseHandler'
import { isObject } from './../shared/index'

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

export function reactive(raw:any){
  return createActiveObject(raw,mutableHandlers)
}

export function readonly(raw:any){
  return createActiveObject(raw,readonlyHandlers)
}

function createActiveObject(raw:any,baseHandlers){
  if(!isObject(raw)){
    console.warn('target must is object')
    return raw
  }

  return new Proxy(raw,baseHandlers)
}

export function isReactive(value){
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY]
}

export function shallowReactive(raw){
  return createActiveObject(raw,shallowReactiveHandlers)
}

export function shallowReadonly(raw){
  return createActiveObject(raw,shallowReadonlyHandlers)
}

export function isProxy(value){
  return isReactive(value) || isReadonly(value)
}

export const toReactive = (value) =>
  isObject(value) ? reactive(value) : value