import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  render() {
    // children => string
    // return h('div', { id: 'root', class: ['c_red'] }, `hi mini-vue3`)
    // children => array
    return h('div', { id: 'root', class: 'title c_red' }, [
      `hi mini-vue3`,
      h('p', { class: 'c_blue' }, 'this is child div'),
      h('p', { class: 'c_green' }, 'this is child p')
    ])
  },
  setup() {
    return {
      msg: 'mini-vue3'
    }
  }
}
