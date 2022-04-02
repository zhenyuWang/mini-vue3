import {isReactive,shallowReactive} from '../reactive'

describe('shallowReadonly',() => {
  test('should not make non-reactive properties reactive',() => {
    const props = shallowReactive({foo:{ bar:1}})

    expect(isReactive(props)).toBe(true)
    expect(isReactive(props.foo)).toBe(false)
  })
})