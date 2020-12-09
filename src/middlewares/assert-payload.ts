import { get }              from 'dot-prop'
import type { IMiddleware } from '~/interfaces/middleware'


export const isString = (val: unknown): val is string =>
  typeof val === 'string'

export const isNumber = (val: unknown): val is number =>
  typeof val === 'number'

export const isBool = (val: unknown): val is boolean =>
  typeof val === 'boolean'


function composeMessage(
  val: unknown,
  defaultOne: string,
  passedIn?: string|((val: unknown) => string),
): string {
  if (passedIn == null) {
    return defaultOne
  }
  return typeof passedIn === 'function' ? passedIn(val) : passedIn
}

export default function assertPayload(): IMiddleware {
  return async(ctx, next) => {
    ctx.assertRequired = <T>(
      field: string,
      assert: (val: unknown) => val is T,
      message?: string|((val: unknown) => string),
    ): T|never => {
      const val = get<T>(ctx.mergedBody, field)
      if (val === undefined) {
        ctx.throw(400, composeMessage(field, `"${field}" is required`, message))
      }
      if (!assert(val)) {
        ctx.throw(400, composeMessage(field, `typeof "${field}" is incorrect`, message))
      }
      return val as T
    }

    ctx.assertOptional = <T>(
      field: string,
      assert: (val: unknown) => val is T,
      message?: string|((val: unknown) => string),
    ): T|undefined|never => {
      const val = get<T>(ctx.mergedBody, field)
      if (val === undefined) {
        return val
      }
      if (!assert(val)) {
        ctx.throw(400, composeMessage(field, `typeof "${field}" is incorrect`, message))
      }
      return val as T
    }

    await next()
  }
}
