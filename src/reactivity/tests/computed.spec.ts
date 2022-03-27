import { reactive } from '../reactive'
import { computed } from '../computed'

describe('computed',() => {

  it('happy path',() => {
    const user = reactive({
      age:18
    })

    const age = computed(() => user.age)

    expect(age.value).toBe(18)

    // TODO return ref
    // expect(isRef(age)).toBe(true)

    // TODO Immutable ref
    // console.warn = jest.fn()
    // age.value++
    // expect(console.warn).toBeCalled()
  })

  it('should compute lazily',() => {
    const value = reactive({
      foo:1
    })

    const getter = jest.fn(() => value.foo)

    const cValue = computed(getter)

    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute until needed
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // now it should computed
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})