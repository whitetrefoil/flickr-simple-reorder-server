import * as Router from 'koa-router'
import * as _      from 'lodash'
import * as API    from '../api'
import config      from '../helpers/config'
import * as flickr from '../helpers/flickr'
import { debug }   from '../helpers/log'

const router = new Router()

const debugGetPhotos = debug('/routes/photosets.js - getPhotos()').debug
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
const debugGetPhotosetList = debug('/routes/photosets.js - GET /list').debug
router.get('/list', async (ctx, next) => {
  ctx.validateRequire(['nsid', 'token', 'secret'])

  const body: API.IGetPhotosetListRequest = ctx.request.mergedBody

  const gotPhotosetList = await flickr.get(null, {
    user_id             : ctx.request.mergedBody.nsid,
    primary_photo_extras: 'url_m',
    method              : 'flickr.photosets.getList',
  }, body.token, body.secret)
  debugGetPhotosetList(gotPhotosetList)

  const gotPhotosets        = _.get(gotPhotosetList, 'photosets.photoset') as any[]
  const simplifiedPhotosets = _.map(gotPhotosets, (photoset) => ({
    url   : _.get(photoset, 'primary_photo_extras.url_m') as string,
    id    : _.get(photoset, 'id') as string,
    photos: _.get(photoset, 'photos') as number,
    title : _.get(photoset, 'title') as string,
    height: parseFloat(_.get(photoset, 'primary_photo_extras.height_m') as string),
    width : parseFloat(_.get(photoset, 'primary_photo_extras.width_m') as string),
  }))

  const response: API.IGetPhotosetListResponse = {
    photosets: simplifiedPhotosets,
  }

  ctx.body = response

  await next()
})

// endregion

// region POST /reorder

const debugPostPhotosetReorder = debug('/routes/photosets.js - POST /reorder').debug
router.post('/reorder', async (ctx, next) => {
  ctx.validateRequire(['nsid', 'setId', 'orderBy', 'isDesc', 'token', 'secret'])

  const body: API.IPostPhotosetReorderRequest = ctx.request.mergedBody

  ctx.assert(
    _.includes(['dateTaken', 'dateUpload', 'title', 'views'], body.orderBy),
    400,
    '"orderBy" must be one of "dateTaken", "dateUpload", "title", "views"',
  )

  const photos = await getPhotos(
    ctx.request.mergedBody.nsid,
    ctx.request.mergedBody.setId,
    ctx.request.mergedBody.token,
    ctx.request.mergedBody.secret,
  )
  debugPostPhotosetReorder(`Got ${photos.length} photos!`)

  const sortedPhotos = _.orderBy(photos, _.toLower(body.orderBy), body.isDesc ? 'desc' : 'asc')

  if (_.isEqual(photos, sortedPhotos)) {
    const equalRes: API.IPostPhotosetReorderResponse = {
      result: {
        isSkipped   : true,
        isSuccessful: true,
      },
    }
    ctx.body = equalRes
    await next()
    return
  }

  const sortedPhotoIds = _(sortedPhotos).map('id').join(',')
  debugPostPhotosetReorder(`New order: ${sortedPhotoIds}`)

  const reorderResult = await flickr.post('flickr.photosets.reorderPhotos', {
    photoset_id: ctx.request.mergedBody.setId,
    photo_ids  : sortedPhotoIds,
  }, body.token, body.secret)

  debugPostPhotosetReorder(reorderResult)
  const response: API.IPostPhotosetReorderResponse =  {
    result: {
      isSkipped   : false,
      isSuccessful: true,
    },
  }
  ctx.body = response

  await next()
})

// endregion

export default router
