import { proxyRefs } from '../reactivity/ref'
import { isObject } from '../shared/index'
import {PublicInstanceProxyHandlers} from './componentPublicInstance'
import {initProps} from './componentProps'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode,parent){
  const component = {
    vnode,
    parent,
    type:vnode.type,
    setupState:{},
    props:{},
    slots:{},
    component:null,
    next:null,
    isMounted:false,
    subTree:{},
    provides:parent ? parent.provides : {},
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
    // 调用 setup 函数
    // shallowReadonly 将 props 第一层处理为 readonly
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
    // 通过 proxyRefs 处理 setupResult count.value => count 直接获取
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance){
  const Component = instance.type

  if(compiler && !Component.render){
    if(Component.template){
      Component.render = compiler(Component.template)
    }
  }

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

let compiler

export function registerRuntimeCompiler(_compiler){
  compiler = _compiler
}