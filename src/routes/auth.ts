import Router from '@koa/router'
import { getAccessToken } from './auth/get-access-token.js'
import { getLoginToken } from './auth/get-login-token.js'
import { postCheckToken } from './auth/post-check-token.js'


export const authRouter = new Router()
  .get('/loginToken', getLoginToken)
  .get('/accessToken', getAccessToken)
  .post('/checkToken', postCheckToken)
