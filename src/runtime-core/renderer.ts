import { ShapeFlags } from '../shared/shapeFlags'
import {createComponentInstance,setupComponent} from './component'
import { Fragment, Text } from './vnode'
import {createAppAPI} from './createApp'
import { effect } from '../reactivity/effect'
const EMPTY_OBJ = {}

export function createRenderer(options){
  const {createElement:hostCreateElement,patchProp:hostPatchProp,insert:hostInsert} = options

  function render(vnode,container,parentComponent){
    patch(null,vnode,container,parentComponent)
  }

  // n1 => oldVNode n2 newVNode
  function patch(n1,n2,container,parentComponent){
    const {type,shapeFlag} = n2
    switch(type){
      case Text:
        processText(n1,n2,container)
        break
      case Fragment:
        processFragment(n1,n2,container,parentComponent)
        break
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          // 处理 element
          processElement(n1,n2,container,parentComponent)
        }
        else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
          // 处理 Component
          processComponent(n1,n2,container,parentComponent)
        }
    }

  }

  function processFragment(n1,n2,container,parentComponent) {
    mountChildren(n2,container,parentComponent)
  }

  function processText(n1,n2,container){
    const {children} = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(n1,n2,container,parentComponent){
    if(!n1){
      mountElement(n2,container,parentComponent)
    }else{
      patchElement(n1,n2,container)
    }
  }

  function patchElement(n1,n2,container){
    console.log('patchElement',n1,n2);

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el
    patchProps(el,oldProps,newProps)
  }

  function patchProps(el,oldProps,newProps){
    if(oldProps!==newProps){
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if(prev!==next && key !== 'value'){
          hostPatchProp(el,key,prev,next)
        }
      }

      if(oldProps!==EMPTY_OBJ){
        for(const key in oldProps){
          if(!(key in newProps)){
            hostPatchProp(el,key,oldProps[key],null)
          }
        }
      }
    }
  }

  function mountElement(n2,container,parentComponent){
    const el = (n2.el = hostCreateElement(n2.type))

    // handle children
    const {children,shapeFlag} = n2
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      processText(null,n2,el)
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(n2,el,parentComponent)
    }

    // handle props
    const {props} = n2
    if (props) {
      for (const key in props) {
        hostPatchProp(
          el,
          key,
          null,
          props[key]
        )
      }
    }
    hostInsert(el,container)
  }

  function mountChildren(vnode,container,parentComponent){
    vnode.children.forEach(child => {
      patch(null,child,container,parentComponent)
    })
  }

  function processComponent(n1,n2,container,parentComponent){
    mountComponent(n2,container,parentComponent)
  }

  function mountComponent(initialVNode,container,parentComponent){
    const instance = createComponentInstance(initialVNode,parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance,container)
  }

  function setupRenderEffect(instance,container){
    effect(() => {
      if(!instance.isMounted){
        console.log('------init------');
        const {proxy} = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        console.log('subTree',subTree);
        patch(null,subTree,container,instance)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      }else{
        console.log('------update------');
        const {proxy} = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree,subTree,container,instance)

      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}