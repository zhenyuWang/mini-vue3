import {extend} from '../../src/shared'

// map 收集所有响应式数据 根据响应式数据的 key 收集所有的依赖
const targetsMap = new Map()

// 接收当前 effect 实例
let activeEffect

// 是否应该进行依赖收集
let shouldTrack = false

class ReactiveEffect {
  private _fn
  public scheduler:Function | undefined
  deps = new Set()
  active = true
  onStop?:Function
  constructor(fn,scheduler?:Function){
    this._fn = fn
    this.scheduler = scheduler
  }
  run(){
    // 不需要收集依赖
    if (!this.active) {
      return this._fn()
    }
    // 需要收集依赖
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    // 重置
    shouldTrack = false;

    return result
  }
  stop(){
    if(this.active){
      cleanupEffect(this)
      if(this.onStop){
        this.onStop()
      }
      this.active = false
    }
  }
}
// 清除依赖
function cleanupEffect(effect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

export function track(target,key){
  if(!isTracking()) return
  let depsMap = targetsMap.get(target)
  if(depsMap === undefined){
    depsMap = new Map()
    targetsMap.set(target,depsMap)
  }
  let dep = depsMap.get(key)
  if(dep===undefined){
    dep = new Set()
    depsMap.set(key,dep)
  }
  trackEffects(dep)
}

function isTracking(){
  return shouldTrack && activeEffect !== undefined
}

function trackEffects(dep){
  if(dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.add(dep)
}

export function trigger(target,key){
  const depsMap = targetsMap.get(target)
  let dep = depsMap.get(key)
  for (const effect of dep) {
    if(effect.scheduler){
      effect.scheduler()
    }
    else{
      effect.run()
    }
  }
}

export function effect(fn,option?){
  const _effect = new ReactiveEffect(fn,option?.scheduler)
  // 将 option 上的东西都给到 _effect
  extend(_effect,option)

  _effect.run()
  const runner:any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner){
  runner.effect.stop()
}