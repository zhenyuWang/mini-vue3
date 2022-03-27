export const extend = Object.assign

export const isObject = (value: any) => {
  return value !== null && typeof value === 'object'
}

export const hasChanged = (newValue: any, oldValue: any): boolean =>
  !Object.is(newValue, oldValue)