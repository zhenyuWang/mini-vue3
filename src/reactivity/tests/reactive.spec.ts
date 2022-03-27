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
})