import type { Middleware } from '@koa/router'
import type { DefaultState } from 'koa'
import type { ContextWithMergedBody } from '../../middlewares/request-body.js'
import type { MaybeObj } from '../../utils/types.js'
import { reorderPhotoset } from './utils.js'


const orders = ['dateTaken', 'dateUpload', 'title', 'views']


export const postPhotosetReorder: Middleware<DefaultState, ContextWithMergedBody> = async ctx => {
  const {
    nsid, setId, orderBy, isDesc, token, secret,
  } = ctx.request.mergedBody as MaybeObj<'nsid'|'setId'|'orderBy'|'isDesc'|'token'|'secret'>
  if (typeof nsid !== 'string'
      || typeof setId !== 'string'
      || typeof orderBy !== 'string'
      || typeof isDesc !== 'boolean'
      || typeof token !== 'string'
      || typeof secret !== 'string'
  ) {
    ctx.throw(400)
    return
  }

  if (!orders.includes(orderBy)) {
    ctx.throw(400, '"orderBy" must be one of "dateTaken", "dateUpload", "title", "views"')
    return
  }

  const res = await reorderPhotoset(nsid, setId, orderBy, isDesc, token, secret)

  ctx.body = res
}
