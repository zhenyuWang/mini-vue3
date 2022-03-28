import { isObject, isString } from '../shared/index'
import {createComponentInstance,setupComponent} from './component'

export function render(vnode,container){
  patch(vnode,container)
}

function patch(vnode,container){
  // 处理 text
  if(isString(vnode)){
    processText(vnode,container)
  }
  else if(isString(vnode.type)){
    // 处理 element
    processElement(vnode,container)
  }
  else if(isObject(vnode.type)){
    // 处理 Component
    processComponent(vnode,container)
  }
}

function processText(vnode,container){
  container.textContent = vnode
}

function processElement(vnode,container){
  mountElement(vnode,container)
}

function mountElement(vnode,container){
  const el = (vnode.el = document.createElement(vnode.type))

  // handle children
  const {children} = vnode
  if(isString(children)){
    el.textContent = children
  }else if(Array.isArray(children)){
    mountChildren(vnode,el)
  }

  // handle props
  const {props} = vnode
  if (props) {
    for (const key in props) {
      patchProp(
        el,
        key,
        props[key]
      )
    }
  }

  container.append(el)
}

function mountChildren(vnode,container){
  vnode.children.forEach(child => {
    patch(child,container)
  })
}

function patchProp(el,key,value){
  if (key === 'innerHTML' || key === 'textContent') {
    el[key] = value == null ? '' : value
  }

  if (value === '' || value == null) {
    el[key] = ''
    el.removeAttribute(key)
  }
  el.setAttribute(key,value)
}

function processComponent(vnode,container){
  mountComponent(vnode,container)
}

function mountComponent(initialVNode,container){
  const instance = createComponentInstance(initialVNode)
  setupComponent(instance)
  setupRenderEffect(instance,container)
}

function setupRenderEffect(instance,container){
  const {proxy} = instance
  const subTree = instance.render.call(proxy)

  patch(subTree,container)

  instance.vnode.el = subTree.el
}
