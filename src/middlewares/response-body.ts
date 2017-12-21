import { Middleware } from 'koa'
import { Stream }     from 'stream'
import { debug }      from '../helpers/log'

const debugResponseBodyFactory = debug('/middlewares/response-body.ts').debug

function responseBodyFactory(): Middleware {
  return async(ctx, next) => {
    await next()

    const body = ctx.body

    if (body instanceof Stream) {
      debugResponseBodyFactory('body is a stream')
      return
    }

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
