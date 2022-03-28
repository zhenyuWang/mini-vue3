export const extend = Object.assign

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}

export const isArray = Array.isArray

export const hasChanged = (newValue: any, oldValue: any): boolean =>
  !Object.is(newValue, oldValue)

export const isString = (val: any) => typeof val === 'string'