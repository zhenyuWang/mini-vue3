import { ShapeFlags } from '../shared/shapeFlags'
import {createComponentInstance,setupComponent} from './component'
import { Fragment, isSameVNodeType, Text } from './vnode'
import {createAppAPI} from './createApp'
import { effect } from '../reactivity/effect'
import { shouldUpdateComponent } from './componentRenderUtils'
import { queueJob } from './scheduler'
const EMPTY_OBJ = {}

export function createRenderer(options){
  const {
    createElement:hostCreateElement,
    patchProp:hostPatchProp,
    insert:hostInsert,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText:hostSetElementText,
    remove:hostRemove,
  } = options

  function render(vnode,container,parentComponent){
    patch(null,vnode,container,null,parentComponent)
  }

  // n1 => oldVNode n2 newVNode
  function patch(n1,n2,container,anchor=null,parentComponent){
    if(n1===n2){
      return
    }
    const {type,shapeFlag} = n2
    switch(type){
      case Text:
        processText(n1,n2,container,anchor)
        break
      case Fragment:
        processFragment(n2,container,anchor,parentComponent)
        break
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          // 处理 element
          processElement(n1,n2,container,anchor,parentComponent)
        }
        else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
          // 处理 Component
          processComponent(n1,n2,container,anchor,parentComponent)
        }
    }

  }

  function processFragment(n2,container,anchor,parentComponent) {
    mountChildren(n2.children,container,anchor,parentComponent)
  }

  function processText(n1,n2,container,anchor){
    if(n1===null){
      hostInsert(
        (n2.el = hostCreateText(n2.children as string)),
        container,
        anchor
      )
    }else{
      const el = n2.el = n1.el!
      if(n2.children!==n1.children){
        hostSetText(el, n2.children as string)
      }
    }
  }

  function processElement(n1,n2,container,anchor,parentComponent){
    if(!n1){
      mountElement(n2,container,anchor,parentComponent)
    }else{
      patchElement(n1,n2,parentComponent)
    }
  }

  function patchElement(n1,n2,parentComponent){

    const el = n2.el = n1.el
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    patchChildren(n1,n2,el,null,parentComponent)
    patchProps(el,oldProps,newProps)
  }

  function patchChildren(n1,n2,container,anchor,parentComponent){
    const prevShapeFlag = n1.shapeFlag
    const nextShapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children

    // 如果新的子节点是文本类型
    if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN){
      console.log('new children is text')
      // 如果老的子节点是数组类型
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
        // 清空 oldChildren => array
        unmountChildren(n1.children)
      }
      // 如果老的是 array，c1 肯定不等于 c2
      // 否则肯定是文本类型
      // 如果老的是文本节点，c1 = c2,无需操作，否则需要替换文本节点
      if(c1!==c2){
        // 设置文本子节点
        hostSetElementText(container,c2)
      }
    }else{
      // 否则新的子节点肯定是数组类型
      console.log('new children is array')
      // 如果老的子节点是文本类型
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
        // 清空之前的文本内容
        hostSetElementText(container,'')

        mountChildren(c2,container,anchor,parentComponent)
      }else{
        // 否则老的子节点是数组类型
        patchKeyedChildren(c1,c2,container,anchor,parentComponent)
      }
    }
  }

  function unmountChildren(children){
    for(let i = 0;i<children.length;i++){
      const el = children[i].el
      // remove
      hostRemove(el)
    }
  }

  function patchKeyedChildren(c1,c2,container,parentAnchor,parentComponent){
    let i = 0
    let l2 = c2.length
    let e1 = c1.length-1
    let e2 = l2-1

    // 1. 左侧对比
    // { a b } c
    // { a b } d e
    while(i<=e1 && i<=e2){
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVNodeType(n1,n2)){
        patch(n1,n2,container,null,parentComponent)
      }else{
        break
      }
      i++
    }

    // 2. 右侧对比
    // a { b c }
    // d e { b c }
    while(i<=e1 && i<=e2){
      const n1 = c1[e1]
      const n2 = c2[e2]
      if(isSameVNodeType(n1,n2)){
        patch(n1,n2,container,null,parentComponent)
      }else{
        break
      }
      e1--
      e2--
    }

    // 3. 新的比老的多
    // a b
    // a b { c }
    // or
    // a b
    // { c d } a b
    // 如果老的已经处理完
    if (i > e1) {
      // 新的还没有处理完
      if (i <= e2) {
        // 挂载新的
        // 确定要挂载的位置
        const nextPos = e2+1
        const anchor = nextPos<l2?c2[nextPos].el:parentAnchor
        while(i<=e2){
          patch(null,c2[i],container,anchor,parentComponent)
          i++
        }
      }
    }

    // 4. 老的比新的多
    // a b { c d }
    // a b
    // or
    // { c d } a b
    // a b
    // 如果新的已经处理完
    if(i>e2){
      // 老的还没处理完
      if(i<=e1){
        // 卸载老的
        while(i<=e1){
          hostRemove(c1[i].el)
          i++
        }
      }
    }

    // 5. 对比中间部分
    // 5.1 老的里面存在，新的里面不存在，进行删除
    // a b { c d } f g
    // a b { e c } f g
    let s1 = i
    let s2 = i
    // 5.2 优化点：老的里面存在，新的里面不存在，并且处于已经对比完之后的位置，统一删除 => e h
    // a b { c d { e h } } f g
    // a b { d c } f g
    // 需要 patch 的数量
    const toBePatched = e2-s2+1
    // 已经 patch 的数量
    let patched = 0
    // 是否需要移动
    let moved = false
    // 记录老的 VNode 在新的里面的最大下标，方便知道相对位置是否发生变化
    let maxNewIndexSoFar = 0
    const newIndexToOldIndexMap = new Array(toBePatched)
    for(let i = 0;i<toBePatched;i++){
      newIndexToOldIndexMap[i] = 0
    }

    // 获取 newVNode => index 的映射，方便后续通过 key 获取 newVNode
    const keyToNewIndexMap = new Map()
    for(let i = s2;i<=e2;i++){
      const nextChild = c2[i]
      keyToNewIndexMap.set(nextChild.key,i)
    }
    // 遍历老的
    for(let i = s1;i<=e1;i++){
      const prevChild = c1[i]

      // 如果已经 patch 的数量大于等于要 patch 的数量，后续不需要对比了，直接删除
      if(patched>=toBePatched){
        hostRemove(prevChild.el)
        continue
      }

      // 尝试获取 oldVNode 对应 newVNode 的 index
      let newIndex
      if(prevChild.key !== null){
        newIndex = keyToNewIndexMap.get(prevChild.key)
      }else{
        for(let j = s2;j<=e2;j++){
          if(isSameVNodeType(prevChild,c2[j])){
            newIndex = j
            break
          }
        }
      }
      // 如果好不到对应映射，进行删除
      if(newIndex===undefined){
        hostRemove(prevChild.el)
      }else{
        // 如果找到对应映射，进行更新
        patch(prevChild,c2[newIndex],container,null,parentComponent)
        patched++

        // 因为 i 可能为 0，但是这里的 0 是我们初始化的一个值，有特殊含义，所以后边用 i+1
        newIndexToOldIndexMap[newIndex-s2] = i+1

        // 通过判断 newIndex 是否大于已处理 newIndex 最大值标识是否发生相对位置变化
        if(newIndex>=maxNewIndexSoFar){
          maxNewIndexSoFar = newIndex
        }else{
          moved = true
        }
      }
    }

    // 5.3 move & mount
    // 移动需要移动的，挂载老的里面没有的
    // a b { c d e } f g
    // a b { e c h d } f g
    const increasingNewIndexSequence = moved?getSequence(newIndexToOldIndexMap):[]
    let j = increasingNewIndexSequence.length-1

    for(let i = toBePatched-1;i>=0;i--){
      // 获取 newVNode index
      const nextIndex = s2 + i
      // 获取 newVNode
      const nextChild = c2[nextIndex]
      // 获取挂载锚点
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor

      if(newIndexToOldIndexMap[i]===0){
        // 如果 newVNode 没有对应的 oldVNode
        patch(null,nextChild,container,anchor,parentComponent)
      }else if(moved){
        // 如果有 VNode 需要移动

        // j<0 说明最长递增子序列为空
        // i !== increasingNewIndexSequence[j]，说明当前 VNode 不在最长递增子序列中
        // 满足以上两种情况之一才需要移动
        if(j<0 || i!==increasingNewIndexSequence[j]){
          hostInsert(nextChild.el,container,anchor)
        }else{
          j--
        }
      }
    }
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

  function mountElement(vnode,container,anchor,parentComponent){
    const el = (vnode.el = hostCreateElement(vnode.type))

    // handle children
    const {children,shapeFlag} = vnode
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      hostSetElementText(el, vnode.children as string)
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(children,el,anchor,parentComponent)
    }

    // handle props
    const {props} = vnode
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

    hostInsert(el,container,anchor)
  }

  function mountChildren(children,container,anchor,parentComponent){
    children.forEach(child => {
      patch(null,child,container,anchor,parentComponent)
    })
  }

  function processComponent(n1,n2,container,anchor,parentComponent){
    if(n1===null){
      mountComponent(n2,container,anchor,parentComponent)
    }else{
      updateComponent(n1,n2)
    }
  }

  function mountComponent(initialVNode,container,anchor,parentComponent){
    const instance = initialVNode.component = createComponentInstance(initialVNode,parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance,initialVNode,anchor,container)
  }

  function updateComponent(n1,n2){
    const instance = n2.component = n1.component
    if(shouldUpdateComponent(n1,n2)){
      instance.next = n2
      instance.update()
    }else{
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function setupRenderEffect(instance,initialVNode,anchor,container){
    instance.update = effect(() => {
      if(!instance.isMounted){
        console.log('------init------');
        const {proxy} = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null,subTree,container,anchor,instance)
        initialVNode.el = subTree.el
        instance.isMounted = true
      }else{
        console.log('------update------')
        const {next,vnode} = instance
        if(next){
          next.el = vnode.el
          updateComponentPreRender(instance,next)
        }

        const {proxy} = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree,subTree,container,anchor,instance)

      }
    },{
      scheduler(){
        queueJob(instance.update)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPreRender(instance,nextVNode){
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}