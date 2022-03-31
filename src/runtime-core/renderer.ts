import { ShapeFlags } from '../shared/shapeFlags'
import {createComponentInstance,setupComponent} from './component'
import { Fragment, Text } from './vnode'
import {createAppAPI} from './createApp'


export function createRenderer(options){
  const {createElement:hostCreateElement,patchProp:hostPatchProp,insert:hostInsert} = options

  function render(vnode,container,parentComponent){
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
    const el = (vnode.el = hostCreateElement(vnode.type))

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
        hostPatchProp(
          el,
          key,
          props[key]
        )
      }
    }
    hostInsert(el,container)
  }

  function mountChildren(vnode,container,parentComponent){
    vnode.children.forEach(child => {
      patch(child,container,parentComponent)
    })
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

  return {
    createApp: createAppAPI(render)
  }
}