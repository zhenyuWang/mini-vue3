import { ref, h } from '../../lib/guide-mini-vue.esm.js'

const prevChildren = 'prevTextChildren'
const nextChildren = [h('div', {}, 'C'), h('div', {}, 'D')]

export default {
  name: 'TextToArray',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange
    }
  },
  render() {
    return this.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
  }
}
