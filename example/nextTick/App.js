import { h, ref, getCurrentInstance, nextTick } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  render() {
    const button = h('button', { onClick: this.onClick }, 'update')
    const p = h('p', {}, `count is ${this.count}`)
    return h('div', {}, [button, p])
  },
  setup() {
    const instance = getCurrentInstance()

    const count = ref(0)

    function onClick() {
      for (let i = 0; i < 100; i++) {
        count.value++
        nextTick(() => {
          console.log('nextTick-instance', instance.vnode.el.innerText)
        })
        console.log('sync-instance', instance.vnode.el.innerText)
      }
    }
    return {
      count,
      onClick
    }
  }
}
