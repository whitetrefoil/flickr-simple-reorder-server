import baseGet                             from '~/api/base/get'
import type { Photoset as ExportPhotoset } from '~/interfaces/photoset'
import type { Token }                      from '~/interfaces/token'


const method = 'flickr.photosets.getList'


export interface PhotosetList {
  photosets: Photosets
  stat: string
}

export interface Photosets {
  cancreate: number
  page: number|string
  pages: number|string
  perpage: string
  total: string
  photoset: Photoset[]
}

interface PrimaryPhotoExtras {
  url_m: string
  height_m: string
  width_m: string
}

export interface Photoset {
  id: string
  owner: string
  username: string
  primary: string
  secret: string
  server: string
  farm: number|string
  count_views: number|string
  count_comments: number|string
  count_photos: number|string
  count_videos: number|string
  title: { _content: string }
  description: { _content: string }
  can_comment: number|string
  date_create: string
  date_update: string
  photos: number|string
  videos: number|string
  visibility_can_see_set: number|string
  needs_interstitial: number|string
  primary_photo_extras: PrimaryPhotoExtras
}


interface Params {
  nsid: string
  token: Token
}


export default async function flickrPhotosetsGetList(
  { nsid, token }: Params,
  page = 1,
): Promise<ExportPhotoset[]> {

  const response = await baseGet<PhotosetList>(method, {
    method,
    user_id             : nsid,
    primary_photo_extras: 'url_m',
  }, token)


  const photosets = response.photosets.photoset.map<ExportPhotoset>(p => ({
    id    : p.id,
    title : p.title._content,
    photos: parseInt(p.photos as string, 10),
    url   : p.primary_photo_extras.url_m,
    width : parseInt(p.primary_photo_extras.width_m as string, 10),
    height: parseInt(p.primary_photo_extras.height_m as string, 10),
  }))

  if (page >= Number(response.photosets.pages)) {
    return photosets
  }

  return photosets.concat(await flickrPhotosetsGetList({ nsid, token }, page + 1))
}
