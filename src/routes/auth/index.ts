import type { DefaultState } from 'koa'
import Router                from 'koa-router'
import type { IContext }     from '~/interfaces/middleware'
import getAccessToken        from './get-access-token'
import getLoginToken         from './get-login-token'
import postCheckToken        from './post-check-token'

const router = new Router<DefaultState, IContext>()

router.get('/loginToken', getLoginToken)
router.get('/accessToken', getAccessToken)
router.post('/checkToken', postCheckToken)

export default router
