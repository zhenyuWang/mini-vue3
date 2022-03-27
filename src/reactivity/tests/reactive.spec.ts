import { reactive,isReactive } from '../reactive'

describe('reactive',() => {

  it('happy path',() => {
    const original = {age:18}
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.age).toBe(18)
  })

  it('isReactive',() => {
    const original = {age:18}
    const observed = reactive(original)
    expect(isReactive(original)).toBe(false)
    expect(isReactive(observed)).toBe(true)
  })

  it('nested reactive',() => {
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
})