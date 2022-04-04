import { createVNode, Fragment } from '../vnode'

export function renderSlots(slots,name='default',props) {
  const slot = slots[name]

  return createVNode(Fragment,{},slot?slot(props):[])
}