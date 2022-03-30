import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  render() {
    const age = 18
    const foo = h('p', {}, 'foo')
    return h('p', {}, [
      renderSlots(this.$slots, 'header', { age }),
      foo,
      renderSlots(this.$slots, 'default'),
      renderSlots(this.$slots, 'footer')
    ])
  }
}
