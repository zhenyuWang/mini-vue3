import { h } from '../../lib/guide-mini-vue.esm.js'

export default {
  name: 'Child',
  render() {
    return h('div', {}, [h('div', {}, `this is child,msg is ${this.$props.msg}`)])
  },
  setup(props) {}
}
