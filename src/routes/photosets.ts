import * as Router from 'koa-router'
import * as _      from 'lodash'
import config      from '../helpers/config'
import * as flickr from '../helpers/flickr'
import { debug }   from '../helpers/log'

const router = new Router()


const debugGetPhotos = debug('/routes/photosets.js - getPhotos()')
async function getPhotos(nsid: string, setId: string, token: string, secret: string, page = 1): Promise<any[]> {
  const response = await flickr.get('flickr.photosets.getPhotos', {
    photoset_id: setId,
    user_id    : nsid,
    page,
    extras     : 'date_upload,date_taken,views',
  }, token, secret)

  if (parseInt(response.photoset.page, 10) >= response.photoset.pages) {
    debugGetPhotos(`Got ${response.photoset.page} / ${response.photoset.pages} page.`)
    return response.photoset.photo
  }

  return response.photoset.photo.concat(await getPhotos(nsid, setId, token, secret, page + 1))
}

// region GET /list

// TODO: Assume there's only one page of photosets
const debugGetPhotosetList = debug('/routes/photosets.js - GET /list')
router.get('/list', async (ctx, next) => {
  ctx.validateRequire(['nsid', 'token', 'secret'])

  const gotPhotosetList = await flickr.get(null, {
    user_id             : ctx.request.mergedBody.nsid,
    primary_photo_extras: 'url_m',
    method              : 'flickr.photosets.getList',
  }, ctx.request.mergedBody.token, ctx.request.mergedBody.secret)
  debugGetPhotosetList(gotPhotosetList)

  const gotPhotosets        = _.get(gotPhotosetList, 'photosets.photoset') as any[]
  const simplifiedPhotosets = _.map(gotPhotosets, (photoset) =>
    _.assign(
      { url_m: _.get(photoset, 'primary_photo_extras.url_m') },
      _.pick(photoset, ['id', 'photos', 'title']),
    ),
  )

  ctx.body = {
    photosets: simplifiedPhotosets,
  }

  await next()
})

// endregion

// region POST /reorder

const debugPostPhotosetReorder = debug('/routes/photosets.js - POST /reorder')
router.post('/reorder', async (ctx, next) => {
  ctx.validateRequire(['nsid', 'setId', 'orderBy', 'isDesc', 'token', 'secret'])
  ctx.assert(
    _.includes(['datetaken', 'dateupload', 'title', 'views'], ctx.request.mergedBody.orderBy),
    400,
    '"orderBy" must be one of "datetaken", "dateupload", "title", "views"',
  )

  const photos = await getPhotos(
    ctx.request.mergedBody.nsid,
    ctx.request.mergedBody.setId,
    ctx.request.mergedBody.token,
    ctx.request.mergedBody.secret,
  )
  // debugPostPhotosetReorder(photos)
  debugPostPhotosetReorder(`Got ${photos.length} photos!`)

  const sortedPhotos = _.orderBy(photos, ctx.request.mergedBody.orderBy, ctx.request.mergedBody.isDesc ? 'desc' : 'asc')

  debugPostPhotosetReorder(`Original: ${photos}`)
  debugPostPhotosetReorder(`Sorted: ${sortedPhotos}`)

  if (_.isEqual(photos, sortedPhotos)) {
    ctx.body = {
      result: {
        isSkipped   : true,
        isSuccessful: true,
      },
    }
    await next()
    return
  }

  const sortedPhotoIds = _(sortedPhotos).map('id').join(',')
  debugPostPhotosetReorder(`New order: ${sortedPhotoIds}`)

  const reorderResult = await flickr.post(
    'flickr.photosets.reorderPhotos',
    {
      photoset_id: ctx.request.mergedBody.setId,
      photo_ids  : sortedPhotoIds,
    },
    ctx.request.mergedBody.token,
    ctx.request.mergedBody.secret,
  )

  debugPostPhotosetReorder(reorderResult)

  ctx.body = {
    result: {
      isSkipped   : false,
      isSuccessful: true,
    },
  }

  await next()
})

// endregion

export default router
