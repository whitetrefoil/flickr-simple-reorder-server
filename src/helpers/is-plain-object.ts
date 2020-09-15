import isPlainObj from 'is-plain-obj'

export default function isPlainObject(val: unknown): val is Record<string|number|symbol, unknown> {
  return isPlainObj(val)
}
