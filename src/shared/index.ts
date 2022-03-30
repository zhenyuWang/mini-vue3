export const extend = Object.assign

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}

export const isArray = Array.isArray

export const hasChanged = (newValue: any, oldValue: any): boolean =>
  !Object.is(newValue, oldValue)

export const isString = (val: any) => typeof val === 'string'

const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)

export const hasOwn = (target,key) => Object.prototype.hasOwnProperty.call(target,key)