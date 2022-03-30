import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [
      h('div', {}, 'App'),
      h(Foo, {}, { default: () => h('p', {}, 'foo slot') }),
      h(Foo, {}, { default: () => [h('p', {}, 'foo slot1'), h('p', {}, 'foo slot2')] }),
      h(
        Foo,
        {},
        {
          header: ({ age }) => h('p', {}, `foo slot header ${age}`),
          footer: () =>
            h('p', {}, [createTextVNode('foo slot footer '), createTextVNode('test text node')])
        }
      )
    ])
  }
}
