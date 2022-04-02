import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  render() {
    return h('div', { id: 'root', foo: this.props.foo, bar: this.props.bar, baz: this.props.baz }, [
      h('p', {}, `count is  ${this.count}`),
      h('button', { onClick: this.addCount }, 'click'),
      h('button', { onClick: this.changeProps }, 'changeProps'),
      h('button', { onClick: this.removeProps1 }, 'removeProps1'),
      h('button', { onClick: this.removeProps2 }, 'removeProps2'),
      h('button', { onClick: this.addProps }, 'addProps')
    ])
  },
  setup() {
    const count = ref(0)
    function addCount() {
      count.value++
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    function changeProps() {
      props.value.foo += '1'
    }
    function removeProps1() {
      props.value.bar = undefined
    }
    function removeProps2() {
      props.value = {
        foo: 'foo'
      }
    }
    function addProps() {
      props.value.baz = 'baz'
    }
    return {
      count,
      addCount,
      props,
      changeProps,
      removeProps1,
      removeProps2,
      addProps
    }
  }
}
