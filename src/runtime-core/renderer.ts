import { isOn } from '../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import {createComponentInstance,setupComponent} from './component'
import { Fragment, Text } from './vnode'

export function render(vnode,container,parentComponent){
  patch(vnode,container,parentComponent)
}

function patch(vnode,container,parentComponent){
  const {type,shapeFlag} = vnode
  switch(type){
    case Text:
      processText(vnode,container)
      break
    case Fragment:
      processFragment(vnode,container,parentComponent)
      break
    default:
      if(shapeFlag & ShapeFlags.ELEMENT){
        // 处理 element
        processElement(vnode,container,parentComponent)
      }
      else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        // 处理 Component
        processComponent(vnode,container,parentComponent)
      }
  }

}

function processFragment(vnode,container,parentComponent) {
  mountChildren(vnode,container,parentComponent)
}

function processText(vnode,container){
  const {children} = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

function processElement(vnode,container,parentComponent){
  mountElement(vnode,container,parentComponent)
}

function mountElement(vnode,container,parentComponent){
  const el = (vnode.el = document.createElement(vnode.type))

  // handle children
  const {children,shapeFlag} = vnode
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
    processText(vnode,el)
  }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
    mountChildren(vnode,el,parentComponent)
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

function mountChildren(vnode,container,parentComponent){
  vnode.children.forEach(child => {
    patch(child,container,parentComponent)
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

function processComponent(vnode,container,parentComponent){
  mountComponent(vnode,container,parentComponent)
}

function mountComponent(initialVNode,container,parentComponent){
  const instance = createComponentInstance(initialVNode,parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance,container)
}

function setupRenderEffect(instance,container){
  const {proxy} = instance
  const subTree = instance.render.call(proxy)
  patch(subTree,container,instance)
  instance.vnode.el = subTree.el
}
