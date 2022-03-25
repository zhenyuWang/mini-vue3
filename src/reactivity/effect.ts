const targetsMap = new Map();

// 接收当前 effect 实例
let activeEffect;

class ReactiveEffect {
  private _fn;
  constructor(fn){
    this._fn = fn
  }
  run(){
    activeEffect = this;
    return this._fn();
  }
}

export function track(target,key){
  let depsMap = targetsMap.get(target)
  if(depsMap === undefined){
    depsMap = new Map();
    targetsMap.set(target,depsMap)
  }
  let dep = depsMap.get(key)
  if(dep===undefined){
    dep = new Set();
    depsMap.set(key,dep)
  }
  dep.add(activeEffect)
}

export function trigger(target,key){
  const depsMap = targetsMap.get(target)
  let dep = depsMap.get(key)
  for (const effect of dep) {
    effect.run();
  }
}

export function effect(fn){
  const _effect = new ReactiveEffect(fn);
  _effect.run();

  return _effect.run.bind(_effect);
}