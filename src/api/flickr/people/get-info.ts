import basePost       from '~/api/base/post'
import { getLogger }  from '~/helpers/log'
import type { Token } from '~/interfaces/token'
import type { User }  from '~/interfaces/user'


const { debug } = getLogger(`/src/${__filename.split('?')[0]}`)


interface Person {
  id: string
  nsid: string
  ispro: number|string
  can_buy_pro: number|string
  iconserver: string
  iconfarm: number|string
  path_alias: string
  has_stats: number|string
  pro_badge: string
  expire: number|string
  username: string
  realname: string
  mbox_sha1sum: string
  location: string
  timezone: Timezone
  description: string
  photosurl: string
  profileurl: string
  mobileurl: string
  photos: Photos
  upload_count: string
  upload_limit: number|string
  upload_limit_status: string
  is_cognito_user: number|string
  all_rights_reserved_photos_count: number|string
}

interface Photos {
  firstdatetaken: string
  firstdate: string
  count: string
  views: string
}

interface Timezone {
  label: string
  offset: string
  timezone_id: string
}

interface Response {
  person: Person
  stat: string
}


async function getUserInfo(userId: string, consumer: Token): Promise<User> {
  const data = {
    user_id: userId,
  }

  const gotUserInfo = await basePost<Response>('flickr.people.getInfo', data, consumer)
  debug(gotUserInfo)

  return {
    nsid      : gotUserInfo.person.nsid,
    iconServer: gotUserInfo.person.iconserver,
    iconFarm  : parseInt(gotUserInfo.person.iconfarm as string, 10),
    pathAlias : gotUserInfo.person.path_alias,
    username  : gotUserInfo.person.username,
    photosUrl : gotUserInfo.person.photosurl,
    profileUrl: gotUserInfo.person.profileurl,
  }
}


export default getUserInfo
