import {createRenderer} from '../runtime-core/index'
import { isOn } from '../shared/index'

function createElement(type){
  console.log('------createElement------')

  return document.createElement(type)
}

function patchProp(el,key,value){
  console.log('------patchProp------')
  if (key === 'innerHTML' || key === 'textContent') {
    el[key] = value == null ? '' : value
  }

  if(isOn(key)){
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event,value)
  }

  if (value === '' || value == null) {
    el[key] = ''
    el.removeAttribute(key)
  }
  el.setAttribute(key,value)
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