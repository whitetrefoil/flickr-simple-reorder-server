import * as _ from 'lodash-es'
import type * as API from '../../api/index.js'
import { get } from '../../helpers/flickr/get.js'
import { post } from '../../helpers/flickr/post.js'
import { getLogger } from '../../helpers/log.js'


const { debug } = getLogger(import.meta.url)


interface FlickrApiPhoto {
  id: string
  secret: string
  server: string
  farm: number
  title: string
  isprimary: 0|1
  ispublic: 0|1
  isfriend: 0|1
  isfamily: 0|1
  datetaken: string
  datetakengranularity: 0|1
  datetakenunknown: 0|1
  views: string
}

interface FlickrApiPhotosets {
  id: string
  primary: string
  owner: string
  ownername: string
  photo: FlickrApiPhoto[]
  page: number
  per_page: string
  perpage: string
  pages: number
  title: string
  total: number
}

export async function getPhotos(
  nsid: string,
  setId: string,
  token: string,
  secret: string,
  page = 1,
): Promise<FlickrApiPhoto[]> {

  const { photoset } = await get('flickr.photosets.getPhotos', {
    photoset_id: setId,
    user_id    : nsid,
    page,
    extras     : 'date_upload,date_taken,views',
  }, token, secret) as {
    photoset: FlickrApiPhotosets
  }

  if (photoset.page >= photoset.pages) {
    // debugGetPhotos(`Got ${response.photoset.page} / ${response.photoset.pages} page.`)
    return photoset.photo
  }

  return photoset.photo.concat(await getPhotos(nsid, setId, token, secret, page + 1))
}


export async function reorderPhotoset(
  nsid: string,
  setId: string,
  orderBy: string,
  isDesc: boolean,
  token: string,
  secret: string,
): Promise<API.IPostPhotosetReorderResponse> {
  const photos = await getPhotos(nsid, setId, token, secret)
  debug(`Got ${photos.length} photos!`)

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

  const sortedPhotoIds = sortedPhotos.map(p => p.id).join(',')

  debug(`New order: ${sortedPhotoIds}`)

  const reorderResult = await post('flickr.photosets.reorderPhotos', {
    photoset_id: setId,
    photo_ids  : sortedPhotoIds,
  }, token, secret)

  debug(reorderResult)
  return {
    result: {
      isSkipped   : false,
      isSuccessful: true,
    },
  }
}
