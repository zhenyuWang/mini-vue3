import { effect } from '../effect'
import { reactive } from '../reactive'
import {ref,isRef,unref,proxyRefs} from '../ref'

describe('ref',() => {

  it('happy path',() => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it('should be reactive',() => {
    const a = ref(1)
    let dummy
    let calls = 0

    effect(() => {
      calls++
      dummy = a.value
    })

    expect(calls).toBe(1)
    expect(dummy).toBe(1)

    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)

    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('should make nested properties reactive',() => {
    const a = ref({
      count:1
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)

    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it('isRef',() => {
    const a = ref(1)
    const user = reactive({age:18})

    expect(isRef(1)).toBe(false)
    expect(isRef(a)).toBe(true)
    expect(isRef(user)).toBe(false)
  })

  it('unRef',() => {
    const a = ref(1)
    const user = reactive({age:18})

    expect(unref(1)).toBe(1)
    expect(unref(a)).toBe(1)
    expect(unref(user)).toBe(user)
  })

  it('proxyRefs',() => {
    const user = {
      name:'John',
      age:ref(18)
    }

    const proxyUser = proxyRefs(user)
    expect(proxyUser.name).toBe('John')
    expect(user.age.value).toBe(18)
    expect(proxyUser.age).toBe(18)

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})