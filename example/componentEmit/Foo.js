import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit('add', 1, 2)
      emit('add-foo', 1, 2)
    }
    return {
      emitAdd
    }
  },
  render() {
    const btn = h('button', { onClick: this.emitAdd }, 'emitAdd')
    const txt = h('p', {}, 'foo')
    return h('div', {}, [txt, btn])
  }
}
