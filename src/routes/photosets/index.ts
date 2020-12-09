import type { DefaultState } from 'koa'
import Router                from 'koa-router'
import type { IContext }     from '~/interfaces/middleware'
import getList               from './get-list'

const router = new Router<DefaultState, IContext>()

router.get('/list', getList)

export default router
