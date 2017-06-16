import * as _         from 'lodash'
import { Middleware } from 'koa'

function responseBodyFactory(): Middleware {
  return async (ctx, next) => {
    await next()

    const body       = ctx.body
    const devMessage = ctx.devMessage
    const code       = ctx.status

    const formattedBody = {
      code,
      devMessage,
      data: body,
    }

    ctx.body = formattedBody
  }
}

export default responseBodyFactory
