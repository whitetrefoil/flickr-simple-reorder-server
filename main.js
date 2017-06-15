'use strict'

const mount     = require('koa-mount')
const _         = require('lodash')
const app       = require('./server')
const auth      = require('./routes/auth')
const photosets = require('./routes/photosets')
const config    = require('./helpers/config')

app.use(require('./middlewares/response-body')())
app.use(require('koa-logger')())
app.use(require('koa-helmet')())
app.use(require('koa-conditional-get')())
app.use(require('koa-etag')())
app.use(require('koa-bodyparser')())
app.use(require('./middlewares/error-formatter')())
app.use(require('./middlewares/request-body')())
app.use(require('./middlewares/validate')())

app.use(mount('/auth', auth.routes()))
app.use(mount('/auth', auth.allowedMethods()))
app.use(mount('/photosets', photosets.routes()))
app.use(mount('/photosets', photosets.allowedMethods()))

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started!')
})
