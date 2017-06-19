import * as _                 from 'lodash'
import * as koaLogger         from 'koa-logger'
import * as koaHelmet         from 'koa-helmet'
import * as koaConditionalGet from 'koa-conditional-get'
import * as koaEtag           from 'koa-etag'
import * as koaBodyparser     from 'koa-bodyparser'
import config                 from './helpers/config'
import { log }                from './helpers/log'
import errorFormatter         from './middlewares/error-formatter'
import requestBody            from './middlewares/request-body'
import responseBody           from './middlewares/response-body'
import validate               from './middlewares/validate'
import auth                   from './routes/auth'
import photosets              from './routes/photosets'
import app                    from './server'

const mount = require('koa-mount')

app.use(responseBody())
app.use(koaLogger())
app.use(koaHelmet())
app.use(koaConditionalGet())
app.use(koaEtag())
app.use(koaBodyparser())
app.use(errorFormatter())
app.use(requestBody())
app.use(validate())

app.use(mount('/api/auth', auth.routes()))
app.use(mount('/api/auth', auth.allowedMethods()))
app.use(mount('/api/photosets', photosets.routes()))
app.use(mount('/api/photosets', photosets.allowedMethods()))

app.listen(config.port, () => {
  log(`Server started at port ${config.port}`)
})
