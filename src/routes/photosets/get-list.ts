import flickrPhotosetsGetList            from '~/api/flickr/photosets/get-list'
import type { IGetPhotosetListResponse } from '~/api/get-photoset-list-response'
import type { IMiddleware }              from '~/interfaces/middleware'
import { isString }                      from '~/middlewares/assert-payload'


const getList: IMiddleware = async(ctx, next) => {
  const nsid = ctx.assertRequired('nsid', isString)
  const key = ctx.assertRequired('token', isString)
  const secret = ctx.assertRequired('secret', isString)

  const photosets = await flickrPhotosetsGetList({
    nsid,
    token: { key, secret },
  })

  const response: IGetPhotosetListResponse = {
    photosets,
  }

  ctx.body = response

  await next()
}


export default getList
