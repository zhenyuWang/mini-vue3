import { h, ref } from '../../lib/guide-mini-vue.esm.js'
import Child from './Child.js'

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [
      h(Child, { msg: this.msg }),
      h('button', { onClick: this.updateMsg }, 'updateMsg'),
      h('p', {}, `count is  ${this.count}`),
      h('button', { onClick: this.addCount }, 'click')
    ])
  },
  setup() {
    const msg = ref('old msg')
    window.msg = msg
    function updateMsg() {
      msg.value = 'new msg'
    }

    const count = ref(0)
    function addCount() {
      count.value++
    }
    return {
      msg,
      updateMsg,
      count,
      addCount
    }
  }
}
