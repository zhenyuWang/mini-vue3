import {createVNode} from './vnode'
import {render} from './renderer'
import { isString } from '../shared/index'

export function createApp(rootComponent){
  return {
    mount(containerOrSelector){
      // 根容器
      const container = normalizeContainer(containerOrSelector)
      const vnode = createVNode(rootComponent)
      render(vnode, container)
    }
  }
}

function normalizeContainer(container){
  if (isString(container)) {
    return document.querySelector(container)
  }
  return container
}