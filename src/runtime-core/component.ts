import { proxyRefs } from '../reactivity/ref'
import { isObject } from '../shared/index'
import {PublicInstanceProxyHandlers} from './componentPublicInstance'
import {initProps} from './componentProps'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode){
  const component = {
    vnode,
    type:vnode.type,
    setupState:{},
    props:{},
    slots:{},
    emit
  }

  component.emit = emit.bind(null,component)

  return component
}

export function setupComponent(instance){
  initProps(instance,instance.vnode.props)
  initSlots(instance,instance.vnode.children)

  setupStatefulComponent(instance)

}

function setupStatefulComponent(instance){
  const Component = instance.type

  // ctx
  instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)

  const {setup} = Component

  if(setup){
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props),{
      emit:instance.emit
    })
    setCurrentInstance(null)

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

let currentInstance = null

export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(instance){
  currentInstance = instance
}