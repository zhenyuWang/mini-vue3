import {isReadonly,shallowReadonly} from '../reactive'

describe('shallowReadonly',() => {
  test('should not make non-reactive properties reactive',() => {
    const props = shallowReadonly({foo:{ bar:1}})

    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.foo)).toBe(false)
  })
})