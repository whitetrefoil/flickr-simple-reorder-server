import type { DefaultState, Middleware } from 'koa'
import * as _ from 'lodash-es'
import type { ContextWithMergedBody } from './request-body.js'


function validateFactory(): Middleware<DefaultState, ContextWithMergedBody> {
  return async(ctx, next) => {
    ctx.validateRequire = (fields: string[]) => {
      _.forEach(fields, field => {
        if (_.isNil(_.get(ctx.request.mergedBody, field))) {
          ctx.throw(400, `${field} is required`)
        }
      })
    }

    await next()
  }
}

export default validateFactory
