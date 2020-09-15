import type { Middleware } from 'koa'

function requestBodyFactory(): Middleware {
  return async(ctx, next) => {
    ctx.request.mergedBody = {
      ...ctx.query,
      ...ctx.request.body,
    }
    await next()
  }
}

export default requestBodyFactory
