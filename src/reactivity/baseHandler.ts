import {track,trigger} from './effect'
import {reactive,readonly,ReactiveFlags} from './reactive'
import {extend, isObject} from '../shared'

const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)

const shallowReactiveGet = createGetter(false,true)

const shallowReadonlyGet = createGetter(true,true)


function createGetter(isReadonly=false,shallow=false){
  return function get(target,key){

    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }else if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }

    const res = Reflect.get(target,key)

    if(!isReadonly){
      // 依赖收集
      track(target,key)
    }

    if(shallow) return res

    // 处理 nested
    if(isObject(res)){
      return isReadonly?readonly(res):reactive(res)
    }


    return res
  }
}

function createSetter(){
  return function set(target,key,value){
    const res = Reflect.set(target,key,value)
    // 触发依赖
    trigger(target,key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get:readonlyGet,
  set(target, key) {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    )
    return true
  }
}

export const shallowReactiveHandlers = extend({},mutableHandlers,{
  get:shallowReactiveGet
})

export const shallowReadonlyHandlers = extend({},readonlyHandlers,{
  get:shallowReadonlyGet
})