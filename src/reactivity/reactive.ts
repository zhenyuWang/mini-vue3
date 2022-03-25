import {track,trigger} from './effect'

export function reactive(raw){
  return new Proxy(raw,{
    get(target,key){
      const res = Reflect.get(target,key)
      // 依赖收集
      track(target,key)
      return res
    },
    set(target,key,value){
      const res = Reflect.set(target,key,value)
      // 触发依赖
      trigger(target,key)
      return res
    }
  })
}