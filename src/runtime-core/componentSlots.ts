import { ShapeFlags } from '../shared/shapeFlags';
import { isArray } from './../shared/index';

export function initSlots(instance,children){
  const {vnode} = instance
  if(vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN){
    normalizeObjectSlots(instance.slots,children)
  }
}
function normalizeObjectSlots(slots,children){
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value){
  return isArray(value)?value:[value]
}
