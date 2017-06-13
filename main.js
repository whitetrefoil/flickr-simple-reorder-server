'use strict'

const mount = require('koa-mount')
const _     = require('lodash')
const app   = require('./server')
const auth  = require('./routes/auth')

app.use(require('koa-logger')())
app.use(require('koa-helmet')())
app.use(require('koa-conditional-get')())
app.use(require('koa-etag')())
app.use(require('koa-bodyparser')())
app.use(async (ctx, next) => {
  ctx.request.mergedBody = _.assign({}, ctx.query, ctx.request.body)
  await next()
})
app.use(require('./helpers/validate')())
app.use(require('koa-json-error')(error => {
  let devMessage

  if (error.response != null) {
    if (!_.isEmpty(error.response.error)) {
      devMessage = error.response.error
    } else if (!_.isEmpty(error.response.body)) {
      devMessage = error.response.body
    } else {
      devMessage = error.response.text
    }
  } else {
    devMessage = error.message || error
  }
  return {
    status: error.status || 500,
    devMessage,
  }
}))

app.use(mount('/auth', auth.routes()))
app.use(mount('/auth', auth.allowedMethods()))

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started!')
})
