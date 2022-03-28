import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  render() {
    // children => string
    // return h('div', { id: 'root', class: ['c_red'] }, `h1 ${this.msg}`)

    // children => array
    return h(
      'div',
      {
        id: 'root',
        class: 'title c_red',
        onClick() {
          console.log('click')
        }
      },
      [
        `hi ${this.msg}`,
        h('p', { class: 'c_blue' }, 'this is child div'),
        h('p', { class: 'c_green' }, 'this is child p')
      ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue3！'
    }
  }
}
