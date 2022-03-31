import {createVNode} from './vnode'
import { isString } from '../shared/index'

export function createAppAPI(render){
  return function createApp(rootComponent){
    return {
      mount(containerOrSelector){
        // 根容器
        const container = normalizeContainer(containerOrSelector)
        const vnode = createVNode(rootComponent)
        render(vnode, container,null)
      }
    }
  }
}

function normalizeContainer(container){
  if (isString(container)) {
    return document.querySelector(container)
  }
  return container
}