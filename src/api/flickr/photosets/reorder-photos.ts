import basePost       from '~/api/base/post'
import type { Token } from '~/interfaces/token'


const method = 'flickr.photosets.reorderPhotos'


interface Params {
  photosetId: string
  photoIds: string[]
}


export default async function flickrPhotosetsReorderPhotos(params: Params, token: Token): Promise<void> {
  return basePost(method, {
    photoset_id: params.photosetId,
    photo_ids  : params.photoIds,
  }, token)
}
