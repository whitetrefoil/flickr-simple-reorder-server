import type { Middleware } from '@koa/router'
import type { DefaultState } from 'koa'
import { Transform } from 'stream'
import type { ContextWithMergedBody } from '../../middlewares/request-body.js'
import type { MaybeObj } from '../../utils/types.js'
import { reorderPhotoset } from './utils.js'


const orders = ['dateTaken', 'dateUpload', 'title', 'views']


export const postPhotosetsBulkReorder: Middleware<DefaultState, ContextWithMergedBody> = async ctx => {
  const {
    nsid, setIds, orderBy, isDesc, token, secret,
  } = ctx.request.mergedBody as MaybeObj<'nsid'|'setIds'|'orderBy'|'isDesc'|'token'|'secret'>
  if (typeof nsid !== 'string'
      || !Array.isArray(setIds)
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

  const stream = new Transform()
  ctx.set({ 'X-Accel-Buffering': 'no' })
  ctx.body = stream

  await Promise.allSettled(setIds.map(async(setId: unknown) => {
    const sId = String(setId)

    try {
      const res = await reorderPhotoset(nsid, sId, orderBy, isDesc, token, secret)
      if (res.result.isSkipped) {
        stream.write(`${sId}:k,`)
        return
      }
      if (res.result.isSuccessful) {
        stream.write(`${sId}:s,`)
        return
      }
      stream.write(`${sId}:f,`)
    } catch (e: unknown) {
      stream.write(`${sId}:f,`)
    }
  }))
    .finally(() => {
      stream.end()
    })
}
