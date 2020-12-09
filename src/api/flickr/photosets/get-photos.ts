import baseGet                       from '~/api/base/get'
import type { Photo as ExportPhoto } from '~/interfaces/photo'
import type { Token }                from '~/interfaces/token'


const method = 'flickr.photosets.getPhotos'


interface Photosets {
  photoset: Photoset
  stat: string
}

interface Photoset {
  id: string
  primary: string
  owner: string
  ownername: string
  photo: Photo[]
  page: number|string
  per_page: string
  perpage: string
  pages: number|string
  title: string
  total: number|string
}

interface Photo {
  id: string
  secret: string
  server: string
  farm: number|string
  title: string
  isprimary: number|string
  ispublic: number|string
  isfriend: number|string
  isfamily: number|string
  dateupload: string
  datetaken: string
  datetakengranularity: number|string
  datetakenunknown: number|string
  views: string
}


interface Params {
  nsid: string
  setId: string
  token: Token
}


export default async function flickrPhotosetsGetPhotos({
  nsid,
  setId,
  token,
}: Params, page = 1): Promise<ExportPhoto[]> {

  const response = await baseGet<Photosets>(method, {
    photoset_id: setId,
    user_id    : nsid,
    page,
    extras     : 'date_upload,date_taken,views',
  }, token)

  const photos = response.photoset.photo.map<ExportPhoto>(p => ({
    id        : p.id,
    title     : p.title,
    datetaken : new Date(p.datetaken).valueOf(),
    dateupload: new Date(p.dateupload).valueOf(),
    views     : parseInt(p.views, 10),
  }))

  if (page >= Number(response.photoset.pages)) {
    return photos
  }

  return photos.concat(await flickrPhotosetsGetPhotos({
    nsid,
    setId,
    token,
  }, page + 1))
}
