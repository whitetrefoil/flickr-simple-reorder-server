import type { Middleware } from '@koa/router'
import type { DefaultState } from 'koa'
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

  // const s = new PassThrough()
  // ctx.body = s
  ctx.status = 200
  ctx.type = 'application/octet-stream'
  ctx.set({ 'X-Accel-Buffering': 'no' })
  ctx.set({ 'Transfer-Encoding': 'chunked' })

  await Promise.allSettled(setIds.map(async(setId: unknown) => {
    const sId = String(setId)

    try {
      const res = await reorderPhotoset(nsid, sId, orderBy, isDesc, token, secret)
      if (res.result.isSkipped) {
        ctx.res.write(`${sId}:k,`)
        // s.push(`${sId}:k,`)
        return
      }
      if (res.result.isSuccessful) {
        ctx.res.write(`${sId}:s,`)
        // s.push(`${sId}:s,`)
        return
      }
      ctx.res.write(`${sId}:f,`)
      // s.push(`${sId}:f,`)
    } catch (e: unknown) {
      ctx.res.write(`${sId}:f,`)
      // s.push(`${sId}:f,`)
    }
  }))
    .finally(() => {
      ctx.res.write('')
      ctx.res.end()
      // s.end()
    })
}
