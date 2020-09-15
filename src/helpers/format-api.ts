import { isPrimitive, Primitive } from 'utility-types'
import isPlainObject              from './is-plain-object'

export type IFlickrResponseContent = {
  [key: string]: Primitive|IFlickrResponseContent
}|{ _content?: Primitive }

function isContent(val: unknown): val is { _content: Primitive } {
  if (val == null) {
    return false
  }
  const content = (val as { _content: Primitive })._content
  return content != null && isPrimitive(content)
}

function formatFlickrApi(obj: unknown): unknown {
  if (obj == null) {
    return null
  }

  if (isContent(obj)) {
    return obj._content
  }

  if (Array.isArray(obj)) {
    return obj.map(formatFlickrApi)
  }

  if (isPlainObject(obj)) {
    return Object.keys(obj).reduce((prev, curr) => ({
      ...prev,
      [curr]: formatFlickrApi(obj[curr]),
    }), {})
  }

  return obj
}


export default formatFlickrApi
