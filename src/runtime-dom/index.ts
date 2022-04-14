import {createRenderer} from '../runtime-core/index'
import { isOn } from '../shared/index'

function createElement(type){
  console.log('------createElement------')
  return document.createElement(type)
}

function patchProp(el,key,oldValue,newValue){
  console.log('------patchProp------')
  if (key === 'innerHTML' || key === 'textContent') {
    el[key] = newValue == null ? '' : newValue
  }

  if(isOn(key)){
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event,newValue)
  }else{
    if (newValue === undefined || newValue == null) {
      el.removeAttribute(key)
    }else{
      el.setAttribute(key,newValue)
    }
  }
}

function insert(child,parent,anchor){
  console.log('------insert------')
  parent.insertBefore(child,anchor ?? null)
}

function createText(text){
  return document.createTextNode(text)
}

function setText(node, text){
  node.nodeValue = text
}

function setElementText(el,text){
  el.textContent = text
}

function remove(child){
  const parent = child.parentNode
  if(parent){
    parent.removeChild(child)
  }
}

let renderer:any = null

function ensureRenderer() {
  return (
    renderer ||
    (renderer = createRenderer({
      createElement,
      patchProp,
      insert,
      createText,
      setText,
      setElementText,
      remove,
    }))
  )
}

export function createApp(...args){
  return ensureRenderer().createApp(...args)
}

export * from '../runtime-core/index'