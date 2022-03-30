import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    // children => string
    // return h('div', { id: 'root', class: ['c_red'] }, `h1 ${this.msg}`)

    // children => array
    // return h(
    //   'div',
    //   {
    //     id: 'root',
    //     class: 'title c_red',
    //     onClick() {
    //       console.log('click')
    //     }
    //   },
    //   [
    //     `hi ${this.msg}`,
    //     h('p', { class: 'c_blue' }, 'this is child div'),
    //     h('p', { class: 'c_green' }, 'this is child p')
    //   ]
    // )

    // children component
    return h('div', { id: 'root', class: ['c_red'] }, [
      h('p', {}, `this is  ${this.msg}`),
      h(Foo, { count: 1 })
    ])
  },
  setup() {
    return {
      msg: 'mini-vue3！'
    }
  }
}
