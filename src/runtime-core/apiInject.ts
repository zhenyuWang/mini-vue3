import { hasOwn, isFunction } from '../shared/index'
import { getCurrentInstance } from './component'

export function provide(key,value){
  const currentInstance:any = getCurrentInstance()

  if(currentInstance){
    let provides = currentInstance.provides
    const parentProvides = currentInstance.parent?.provides

    // init
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key as string] = value
  }
}

export function inject(key,defaultValue){
  const instance:any = getCurrentInstance()
  if(instance){
    const provides =
      instance.parent == null
        ? instance.provides
        : instance.parent.provides
    if(key in provides){
      return provides[key]
    }else if(defaultValue){
      return isFunction(defaultValue)?defaultValue():defaultValue
    }
  }
}