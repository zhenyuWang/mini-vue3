import {reactive} from '../reactive'
import {effect} from '../effect'

describe('effect',() => {
  it('happy path',() => {
    const user = reactive({
      age:10
    })
    let nextAge;
    effect(() => {
      nextAge = user.age+1
    })
    expect(nextAge).toBe(11)
    user.age++;
    expect(nextAge).toBe(12)
  })
  it('should return runner when call effect',() => {
    // effect(fn) 会返回 runner
    // 执行 runner 会执行 fn，并且会返回 fn 的返回值
    let num = 10
    const runner = effect(() => {
      num++
      return 'test runner'
    })
    expect(num).toBe(11)
    const res = runner()
    expect(num).toBe(12)
    expect(res).toBe('test runner')
  })
})