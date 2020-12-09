export function isUsefulString(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0
}
