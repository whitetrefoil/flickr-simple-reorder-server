import type { Middleware } from '@koa/router'
import type { DefaultState } from 'koa'
import type * as API from '../../api/index.js'
import { get } from '../../helpers/flickr/get.js'
import type { ContextWithMergedBody } from '../../middlewares/request-body.js'
import type { MaybeObj } from '../../utils/types.js'


interface RawExtras {
  url_m: string
  height_m: string
  width_m: string
}

interface RawPhotoset {
  id: string
  owner: string
  username: string
  primary: string
  secret: string
  server: string
  farm: number
  count_views: number
  count_comments: number
  count_photos: number
  count_videos: number
  title: string
  description: string
  can_comment: 1|0
  date_create: string
  date_update: string
  photos: number
  videos: number
  visibility_can_see_set: 1|0
  needs_interstitial: 1|0
  primary_photo_extras: RawExtras
}

interface RawPhotosets {
  cancreate: 1|0
  page: number
  pages: number
  perpage: string
  total: string
  photoset: RawPhotoset[]
}

interface RawRes {
  photosets: RawPhotosets
  stat: string
}


export const getPhotosets: Middleware<DefaultState, ContextWithMergedBody> = async ctx => {
  const { nsid, token, secret } = ctx.request.mergedBody as MaybeObj<'nsid'|'token'|'secret'>
  if (typeof nsid !== 'string' || typeof token !== 'string' || typeof secret !== 'string') {
    ctx.throw(400)
    return
  }

  const rawRes = await get('flickr.photosets.getList', {
    user_id             : nsid,
    primary_photo_extras: 'url_m',
  }, token, secret) as RawRes

  const simplifiedPhotosets = rawRes.photosets.photoset.map(photoset => ({
    url   : photoset.primary_photo_extras.url_m,
    id    : photoset.id,
    photos: photoset.photos,
    title : photoset.title,
    height: parseFloat(photoset.primary_photo_extras.height_m),
    width : parseFloat(photoset.primary_photo_extras.width_m),
  }))

  const response: API.IGetPhotosetListResponse = {
    photosets: simplifiedPhotosets,
  }

  ctx.body = response
}
