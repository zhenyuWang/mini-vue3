import {ReactiveEffect} from './effect'

class ComputedRefImp {
  private _getter
  private _dirty = true
  private _value
  private _effect
  constructor(getter){
    this._getter = getter

    this._effect = new ReactiveEffect(getter,() => {
      if(this._dirty === false){
        this._dirty = true
      }
    })
  }
  get value(){
    if(this._dirty){
      this._dirty = false
      this._value = this._effect.run()
      return this._value
    }

    return this._value
  }
}

export function computed(getter){
  return new ComputedRefImp(getter)
}