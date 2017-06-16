import * as _         from 'lodash'
import { Middleware } from 'koa'

function requestBodyFactory(): Middleware {
  return async (ctx, next) => {
    ctx.request.mergedBody = _.assign({}, ctx.query, ctx.request.body)
    await next()
  }
}

export default requestBodyFactory
