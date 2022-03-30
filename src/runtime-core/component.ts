import { proxyRefs } from '../reactivity/ref'
import { isObject } from '../shared/index'
import {PublicInstanceProxyHandlers} from './componentPublicInstance'
import {initProps} from './componentProps'
import { shallowReadonly } from '../reactivity/reactive'

export function createComponentInstance(vnode){
  const component = {
    vnode,
    type:vnode.type,
    setupState:{},
    props:{}
  }

  return component
}

export function setupComponent(instance){
  // TODO
  initProps(instance,instance.vnode.props)
  // initSlots()

  setupStatefulComponent(instance)

}

function setupStatefulComponent(instance){
  const Component = instance.type

  // ctx
  instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)

  const {setup} = Component

  if(setup){
    const setupResult = setup(shallowReadonly(instance.props))

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