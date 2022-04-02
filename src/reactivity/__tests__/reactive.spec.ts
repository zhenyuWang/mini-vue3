import { reactive,isReactive,isProxy } from '../reactive'

describe('reactive',() => {

  test('happy path',() => {
    const original = {age:18}
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.age).toBe(18)
  })

  test('isReactive',() => {
    const original = {age:18}
    const observed = reactive(original)
    expect(isReactive(original)).toBe(false)
    expect(isReactive(observed)).toBe(true)
  })

  test('nested reactive',() => {
    const original = {
      nested:{
        foo:1
      },
      array:[{bar:2}]
    }
    const observed = reactive(original)

    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })

  test('isProxy',() => {
    const original = {age:18}
    const observed = reactive(original)
    expect(isProxy(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
  })
})