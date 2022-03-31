import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide('bar', 'provider-bar-val')
    provide('foo', 'provider-foo-val')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(Middle)])
  }
}

const Middle = {
  name: 'Middle',
  setup() {
    provide('foo', 'middle-foo-val')
    const foo = inject('foo11')
    return { foo }
  },
  render() {
    return h('div', {}, [h('p', {}, `Middle: provider-foo-${this.foo}`), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'baz-default')
    const count = inject('count', () => 99)
    return {
      foo,
      bar,
      baz,
      count
    }
  },
  render() {
    return h('div', {}, `Consumer-${this.foo}-${this.bar || ''}-${this.baz}-${this.count}`)
  }
}

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [h('p', {}, 'provide & inject'), h(Provider)])
  }
}
