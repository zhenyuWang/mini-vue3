import {toReactive} from './reactive'
import {isTracking,trackEffects,triggerEffects} from './effect'
import {hasChanged} from '../shared/index'

class RefImpl {
  private _rawValue
  private _value
  public dep
  public __v_isRef = true
  constructor(value){
    this._rawValue = value
    this._value = toReactive(value)
    this.dep = new Set()
  }

  get value(){
    trackRefValue(this)
    return this._value
  }

  set value(newValue){
    // 如果新的值和之前的值不同，才进行处理
    if(hasChanged(newValue,this._rawValue)){
      this._rawValue = newValue
      this._value = toReactive(newValue)
      triggerEffects(this.dep)
    }
  }
}

function trackRefValue(ref){
  if(isTracking()){
    trackEffects(ref.dep)
  }
}

export function ref(value){
  return new RefImpl(value)
}

export function isRef(r:any){
  return !!r?.__v_isRef === true
}

export function unref(ref:any){
  return isRef(ref) ? (ref.value as any) : ref
}

export function proxyRefs(objectWithRefs){
  return new Proxy(objectWithRefs,{
    get(target,key){
      return unref(Reflect.get(target,key))
    },
    set(target,key,value){
      if(isRef(target[key]) && !isRef(value)){
        return target[key].value = value
      }

      return Reflect.set(target,key,value)
    }
  })
}