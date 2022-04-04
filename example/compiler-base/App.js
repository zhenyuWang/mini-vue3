import { ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  template: `<div>hi,{{message}}</div>`,
  setup() {
    const message = ref('mini-vue3')
    window.message = message
    return {
      message
    }
  }
}
