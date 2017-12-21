import * as Router  from 'koa-router'
import * as _       from 'lodash'
import * as through from 'through'
import * as API     from '../api'
import * as flickr  from '../helpers/flickr'
import { debug }    from '../helpers/log'

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

async function reorderPhotoset(
  nsid: string,
  setId: string,
  orderBy: string,
  isDesc: boolean,
  token: string,
  secret: string,
  logger: Function,
): Promise<API.IPostPhotosetReorderResponse> {
  const photos = await getPhotos(nsid, setId, token, secret)
  logger(`Got ${photos.length} photos!`)

  const sortedPhotos = _.orderBy(photos, _.toLower(orderBy), isDesc ? 'desc' : 'asc')

  if (_.isEqual(photos, sortedPhotos)) {
    const equalRes: API.IPostPhotosetReorderResponse = {
      result: {
        isSkipped   : true,
        isSuccessful: true,
      },
    }

    return equalRes
  }

  const sortedPhotoIds = _(sortedPhotos)
    .map('id')
    .join(',')

  logger(`New order: ${sortedPhotoIds}`)

  const reorderResult = await flickr.post('flickr.photosets.reorderPhotos', {
    photoset_id: setId,
    photo_ids  : sortedPhotoIds,
  }, token, secret)

  logger(reorderResult)
  return {
    result: {
      isSkipped   : false,
      isSuccessful: true,
    },
  }
}

// region GET /list

// TODO: Assume there's only one page of photosets
const debugGetPhotosetList = debug('/routes/photosets.js - GET /list').debug
router.get('/list', async(ctx, next) => {
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
router.post('/reorder', async(ctx, next) => {
  ctx.validateRequire(['nsid', 'setId', 'orderBy', 'isDesc', 'token', 'secret'])

  const body: API.IPostPhotosetReorderRequest = ctx.request.mergedBody

  ctx.assert(
    _.includes(['dateTaken', 'dateUpload', 'title', 'views'], body.orderBy),
    400,
    '"orderBy" must be one of "dateTaken", "dateUpload", "title", "views"',
  )

  const response = await reorderPhotoset(
    body.nsid,
    body.setId,
    body.orderBy,
    body.isDesc,
    body.token,
    body.secret,
    debugPostPhotosetReorder,
  )

  ctx.body = response

  await next()
})

// endregion

const debugPostPhotosetBulkReorder = debug('/routes/photosets.js - POST /bulk_reorder').debug

router.post('/bulk_reorder', (ctx, next) => {
  ctx.validateRequire(['nsid', 'setIds', 'orderBy', 'isDesc', 'token', 'secret'])

  const body: API.IPostPhotosetBulkReorderRequest = ctx.request.mergedBody

  ctx.assert(
    _.includes(['dateTaken', 'dateUpload', 'title', 'views'], body.orderBy),
    400,
    '"orderBy" must be one of "dateTaken", "dateUpload", "title", "views"',
  )

  const stream = through()
  ctx.body     = stream

  Promise.all(_.map(body.setIds, (setId) => {
    let flag: string

    debugPostPhotosetBulkReorder(`Reordering: ${setId}`)

    return reorderPhotoset(
      body.nsid,
      setId,
      body.orderBy,
      body.isDesc,
      body.token,
      body.secret,
      debugPostPhotosetBulkReorder,
    )
      .then((result) => {
        switch (true) {
          case result.result.isSkipped:
            debugPostPhotosetBulkReorder(`${setId} is skipped`)
            flag = 'k'
            break
          case result.result.isSuccessful:
            debugPostPhotosetBulkReorder(`${setId} is successful`)
            flag = 's'
            break
          default:
            debugPostPhotosetBulkReorder(`${setId} is failed`)
            flag = 'f'
        }
        stream.write(`${setId}:${flag},`)
      }, (e) => {
        debugPostPhotosetBulkReorder(`${setId} is failed by exception:\n${e.stack}`)
        flag = 'f'
        stream.write(`${setId}:${flag},`)
      })
  }))
    .then(() => {
      stream.end()
      debugPostPhotosetBulkReorder(`Done bulk reordering`)
    })
})

export default router
