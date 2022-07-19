import Router from '@koa/router'
import Koa from 'koa'
import koaBodyparser from 'koa-bodyparser'
import koaConditionalGet from 'koa-conditional-get'
import koaEtag from 'koa-etag'
import koaHelmet from 'koa-helmet'
import koaLogger from 'koa-logger'
import config from './config.js'
import { log } from './helpers/log.js'
import errorFormatter from './middlewares/error-formatter.js'
import requestBody from './middlewares/request-body.js'
import responseBody from './middlewares/response-body.js'
import validate from './middlewares/validate.js'
import { authRouter } from './routes/auth.js'
import { photosetsRouter } from './routes/photosets.js'


export async function main() {
  const router = new Router()
    .use('/api/auth', authRouter.routes(), authRouter.allowedMethods())
    .use('/api/photosets', photosetsRouter.routes(), photosetsRouter.allowedMethods())


  new Koa()
    .use(responseBody())
    .use(koaLogger())
    .use(koaHelmet())
    .use(koaConditionalGet())
    .use(koaEtag())
    .use(koaBodyparser())
    .use(errorFormatter())
    .use(requestBody())
    .use(validate())
    .use(router.routes())
    .use(router.allowedMethods())

    .listen(config.port, () => {
      log(`Server started at port ${config.port}`)
    })
}


export * from './api/index.js'
