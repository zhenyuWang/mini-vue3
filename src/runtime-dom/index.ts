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
      console.log(el,key,newValue)
      el.setAttribute(key,newValue)
    }
  }
}

function insert(el,container){
  console.log('------insert------')
  container.append(el)
}

let renderer:any = null

function ensureRenderer() {
  return (
    renderer ||
    (renderer = createRenderer({
      createElement,
      patchProp,
      insert
    }))
  )
}

export function createApp(...args){
  return ensureRenderer().createApp(...args)
}

export * from '../runtime-core/index'