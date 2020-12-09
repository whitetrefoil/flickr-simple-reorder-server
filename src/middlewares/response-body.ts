import { Stream }           from 'stream'
import { getLogger }        from '~/helpers/log'
import type { IMiddleware } from '~/interfaces/middleware'

const { debug } = getLogger(`/src/${__filename.split('?')[0]}`)

function responseBodyFactory(): IMiddleware {
  return async(ctx, next) => {
    await next()

    // eslint-disable-next-line prefer-destructuring
    const body = ctx.body as unknown

    if (body instanceof Stream) {
      debug('body is a stream')
      return
    }

    const { devMessage } = ctx
    const code = ctx.status

    ctx.body = {
      code,
      devMessage,
      data: body,
    }
  }
}

export default responseBodyFactory
