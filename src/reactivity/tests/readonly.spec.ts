import {readonly,reactive,isReadonly} from '../reactive'
describe('readonly',() => {
  it('happy path',() => {
    // not set
    const original = {foo:1}
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
  })
  it('warn when call set',() => {
    // console.warn(...)

    console.warn = jest.fn()

    const user = readonly({age:18})
    user.age = 16
    expect(console.warn).toBeCalled()
  })
  it('isReadonly',() => {
    const original = {foo:1}
    const reactiveWrapped = reactive(original)
    const readonlyWrapped = readonly(original)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(reactiveWrapped)).toBe(false)
    expect(isReadonly(readonlyWrapped)).toBe(true)
  })
})