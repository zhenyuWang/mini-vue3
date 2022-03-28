import { isOn, isString } from '../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import {createComponentInstance,setupComponent} from './component'

export function render(vnode,container){
  patch(vnode,container)
}

function patch(vnode,container){
  const {shapeFlag} = vnode
  // 处理 text
  if(isString(vnode)){
    processText(vnode,container)
  }
  else if(shapeFlag & ShapeFlags.ELEMENT){
    // 处理 element
    processElement(vnode,container)
  }
  else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
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
  const {children,shapeFlag} = vnode
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
    el.textContent = children
  }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
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

  if(isOn(key)){
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event,value)
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
