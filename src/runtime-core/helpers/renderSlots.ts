import { isFunction } from '../../shared/index';
import { createVNode } from '../vnode';

export function renderSlots(slots,name='default',props) {
  const slot = slots[name]
  if(isFunction(slot)){
    const vnode = createVNode('div',{},slot(props))
    return vnode
  }
  return {}
}