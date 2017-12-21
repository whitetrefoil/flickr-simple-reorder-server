import { Middleware } from 'koa'
import * as _         from 'lodash'
import * as statuses  from 'statuses'
import * as log       from '../helpers/log'

const { debug } = log.debug('/middlewares/error-formatter.js')

function errorFormatterFactory(): Middleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      debug(error)

      ctx.status = error.status || 500

      if (error.response == null) {
        ctx.body = { message: error.message || error }
        return
      }

      ctx.body = { message: statuses[ctx.status] }
      log.error(error.message)

      if (!_.isEmpty(error.response.error)) {
        ctx.devMessage = error.response.error
        return
      }

      if (!_.isEmpty(error.response.body)) {
        ctx.devMessage = error.response.body
        return
      }

      ctx.devMessage = error.response.text
      return
    }
  }
}

export default errorFormatterFactory
