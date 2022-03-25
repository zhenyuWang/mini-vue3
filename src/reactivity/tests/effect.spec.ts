import {reactive} from '../reactive'
import {effect,stop} from '../effect'

describe('effect',() => {

  it('happy path',() => {
    const user = reactive({
      age:10
    })
    let nextAge
    effect(() => {
      nextAge = user.age+1
    })
    expect(nextAge).toBe(11)
    user.age++
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

  it('scheduler',() => {
    // 1. 通过 effect 的第二个参数传递一个对象，对象中包含 scheduler
    // 2. effect 初始化调用 第一个参数 fn
    // 3. 响应式对象更新时，不会调用 fn，而是调用 scheduler
    // 4. 如果执行 runner，会再次执行 fn
    let dummy
    let run
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({foo:1})
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {scheduler}
    )
    expect(scheduler).not.toHaveBeenCalled()
    // effect 初始化调用 第一个参数 fn
    expect(dummy).toBe(1)
    obj.foo++
    // 响应式对象更新时，不会调用 fn，而是调用 scheduler
    expect(scheduler).toHaveBeenCalledTimes(1)
    // fn 不应该被执行
    expect(dummy).toBe(1)
    run()
    expect(dummy).toBe(2)
  })

  it('stop',() => {
    // 可以通过 stop 解除依赖
    let dummy
    const obj = reactive({prop:1})
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)

    runner()
    expect(dummy).toBe(3)
  })

  it('onStop',() => {
    // onStop => stop 的 回调函数
    const obj = reactive({foo:1})
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },{
        onStop
      }
    )
    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})