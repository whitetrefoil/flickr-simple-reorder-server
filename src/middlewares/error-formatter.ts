import { getLogger } from '@whitetrefoil/debug-log'
import type { Middleware } from 'koa'
import { HttpError } from 'koa'
import statuses from 'statuses'
import * as log from '../helpers/log.js'
import type { StateWithDevMessage } from './response-body.js'


const { debug } = getLogger(import.meta.url)


function errorFormatterFactory(): Middleware<StateWithDevMessage> {
  return async(ctx, next) => {
    try {
      await next()
    } catch (e: unknown) {
      debug(e)
      if (!(e instanceof Error)) {
        throw new Error(`Unknown error: ${String(e)}`)
      }

      if (!(e instanceof HttpError)) {
        throw e
      }

      ctx.status = e.status ?? 500

      if (e.response == null) {
        ctx.body = { message: e.message }
        return
      }

      ctx.body = { message: statuses[ctx.status] as string }
      log.error(e.message)

      // if (ctx.state.devMessage != null) {
      //   ctx.body.devMessage = ctx.state.devMessage
      // }

      // if (!_.isEmpty(e.response.error)) {
      //   ctx.devMessage = e.response.error
      //   return
      // }
      //
      // if (!_.isEmpty(e.response.body)) {
      //   ctx.devMessage = e.response.body
      //   return
      // }
      //
      // ctx.devMessage = e.response.text
      // return
    }
  }
}

export default errorFormatterFactory
