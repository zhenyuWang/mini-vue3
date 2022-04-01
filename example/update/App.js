import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  render() {
    return h('div', { id: 'root' }, [
      h('p', {}, `count is  ${this.count}`),
      h('button', { onClick: this.onClick }, 'click')
    ])
  },
  setup() {
    const count = ref(0)
    function onClick() {
      count.value++
    }
    return {
      count,
      onClick
    }
  }
}
