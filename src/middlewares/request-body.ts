import { Middleware } from 'koa'
import * as _         from 'lodash'

function requestBodyFactory(): Middleware {
  return async(ctx, next) => {
    ctx.request.mergedBody = _.assign({}, ctx.query, ctx.request.body)
    await next()
  }
}

export default requestBodyFactory
