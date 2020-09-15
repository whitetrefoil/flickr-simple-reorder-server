import koaBodyparser     from 'koa-bodyparser'
import koaConditionalGet from 'koa-conditional-get'
import koaEtag           from 'koa-etag'
import koaHelmet         from 'koa-helmet'
import koaLogger         from 'koa-logger'
import koaMount          from 'koa-mount'
import config            from './helpers/config'
import { log }           from './helpers/log'
import errorFormatter    from './middlewares/error-formatter'
import requestBody       from './middlewares/request-body'
import responseBody      from './middlewares/response-body'
import validate          from './middlewares/validate'
import auth              from './routes/auth'
import photosets         from './routes/photosets'
import app               from './server'

app.use(responseBody())
app.use(koaLogger())
app.use(koaHelmet())
app.use(koaConditionalGet())
app.use(koaEtag())
app.use(koaBodyparser())
app.use(errorFormatter())
app.use(requestBody())
app.use(validate())

app.use(koaMount('/api/auth', auth.routes()))
app.use(koaMount('/api/auth', auth.allowedMethods()))
app.use(koaMount('/api/photosets', photosets.routes()))
app.use(koaMount('/api/photosets', photosets.allowedMethods()))

app.listen(config.port, () => {
  log(`Server started at port ${config.port}`)
})

export * from './api'
