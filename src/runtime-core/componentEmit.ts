import { camlize, toHandlerKey } from '../shared/index';

export const emit = (instance,eventName,...args) => {
  const {props} = instance

  const handlerName = toHandlerKey(camlize(eventName))
  const handler = props[handlerName]
  handler?.(...args);
}