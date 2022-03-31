import { createRenderer } from '../../lib/guide-mini-vue.esm.js'
import { App } from './App.js'

console.log(PIXI)

const game = new PIXI.Application({
  width: 500,
  height: 500,
  backgroundColor: 0x00ffff
})
document.body.append(game.view)

const renderer = createRenderer({
  createElement(type) {
    if (type === 'rect') {
      const rect = new PIXI.Graphics()
      rect.beginFill(0xff0000)
      rect.drawRect(0, 0, 100, 100)
      rect.endFill()
      return rect
    }
  },
  patchProp(el, key, val) {
    el[key] = val
  },
  insert(el, container) {
    container.addChild(el)
  }
})

renderer.createApp(App).mount(game.stage)
