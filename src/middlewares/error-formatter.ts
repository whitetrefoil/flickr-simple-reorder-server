import type { Response }    from 'got'
import { isHttpError }      from 'http-errors'
import * as statuses        from 'statuses'
import { error, getLogger } from '~/helpers/log'
import type { IMiddleware } from '~/interfaces/middleware'
import { isUsefulString }   from '../helpers/is-useful-string'

const { debug } = getLogger(`/src/${__filename.split('?')[0]}`)

function errorFormatterFactory(): IMiddleware {
  return async(ctx, next) => {
    try {
      await next()
    } catch (e: unknown) {
      debug(e)

      if (!isHttpError(e)) {
        ctx.status = 500
        ctx.body = {
          message: statuses.message[500],
        }
        if (e instanceof Error) {
          ctx.devMessage = e.stack
        }
        return
      }

      const response = e.response as Response|undefined

      if (response == null) {
        ctx.status = e.status
        ctx.body = { message: e.message }
        return
      }


      ctx.body = { message: statuses.message[ctx.status] }
      error(e.message)

      if (isUsefulString(response.body)) {
        ctx.devMessage = response.body
      }
    }
  }
}

export default errorFormatterFactory
