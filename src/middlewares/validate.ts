import { get }             from 'dot-prop'
import type { Middleware } from 'koa'

function validateFactory(): Middleware {
  return async(ctx, next) => {
    ctx.validateRequire = (fields: string[]) => {
      fields.forEach(field => {
        ctx.assert(get(ctx.request.mergedBody, field) != null, 400, `"${field}" is required.`)
      })
    }

    await next()
  }
}

export default validateFactory
