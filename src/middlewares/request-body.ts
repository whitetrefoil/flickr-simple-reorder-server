import type { Request, Middleware, DefaultContext, DefaultState } from 'koa'
import * as _ from 'lodash-es'


export interface RequestWithMergedBody extends Request {
  mergedBody: unknown
}

export interface ContextWithMergedBody extends DefaultContext {
  request: RequestWithMergedBody
}


function requestBodyFactory(): Middleware<DefaultState, ContextWithMergedBody> {
  return async(ctx, next) => {
    ctx.request.mergedBody = _.assign({}, ctx.query, ctx.request.body)
    await next()
  }
}

export default requestBodyFactory

//
// declare module 'koa' {
//   interface Request {
//     mergedBody: unknown
//   }
// }
