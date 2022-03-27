import { proxyRefs } from '../reactivity/ref'
import { isObject } from '../shared/index'

export function createComponentInstance(vnode){
  const type = vnode.type
  const component = {
    vnode,
    type
  }

  return component
}

export function setupComponent(instance){
  // TODO
  // initProps()
  // initSlots()

  const setupResult = setupStatefulComponent(instance)
}

function setupStatefulComponent(instance){
  const Component = instance.type

  const {setup} = Component

  if(setup){
    const setupResult = setup()

    handleSetupResult(instance,setupResult)
  }else{
    finishComponentSetup(instance)
  }
}

function handleSetupResult(instance,setupResult){
  if(isObject(setupResult)){
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance){
  const Component = instance.type
  if(!instance.render){
    instance.render = Component.render
  }
}