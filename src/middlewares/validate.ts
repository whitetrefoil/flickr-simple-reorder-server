import { Middleware } from 'koa'
import * as _         from 'lodash'

function validateFactory(): Middleware {
  return async(ctx, next) => {
    ctx.validateRequire = (fields: string[]) => {
      _.forEach(fields, (field) => {
        ctx.assert(!_.isNil(_.get(ctx.request.mergedBody, field)), 400, `"${field}" is required.`)
      })
    }

    await next()
  }
}

export default validateFactory
