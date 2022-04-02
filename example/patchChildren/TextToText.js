import { ref, h } from '../../lib/guide-mini-vue.esm.js'

const prevChildren = 'prevTextChildren'
const nextChildren = 'nextTextChildren'

export default {
  name: 'TextToText',
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
