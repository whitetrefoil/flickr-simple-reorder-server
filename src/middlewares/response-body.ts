import { getLogger } from '@whitetrefoil/debug-log'
import type { DefaultState, Middleware } from 'koa'
import { Stream } from 'stream'


const { debug } = getLogger(import.meta.url)


export interface StateWithDevMessage extends DefaultState {
  devMessage?: string
}


function responseBodyFactory(): Middleware<StateWithDevMessage> {
  return async(ctx, next) => {
    await next()

    const body = ctx.body as unknown

    if (body instanceof Stream) {
      debug('body is a stream')
      return
    }

    const { devMessage } = ctx.state
    const code = ctx.status

    const formattedBody = {
      code,
      devMessage,
      data: body,
    }

    ctx.body = formattedBody
  }
}

export default responseBodyFactory
