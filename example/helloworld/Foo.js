import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup(props) {
    // 1. props.count
    console.log('props', props)

    // 2. readonly
    props.count++
  },
  // 3. 可以绑定到 this 上使用
  render() {
    return h('div', {}, `foo: ${this.count}`)
  }
}
