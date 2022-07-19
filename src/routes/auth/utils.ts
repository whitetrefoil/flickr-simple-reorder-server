import type * as API from '../../api/index.js'
import { post } from '../../helpers/flickr/post.js'
import { getLogger } from '../../helpers/log.js'


const { debug } = getLogger(import.meta.url)


export async function getUserInfo(userId: string, token: string, secret: string): Promise<API.IUser> {
  const data = {
    user_id: userId,
  }

  const gotUserInfo = await post('flickr.people.getInfo', data, token, secret) as {
    person: {
      nsid: string
      iconserver: string
      iconfarm: number
      path_alias: string
      username: string
      photosurl: string
      profileurl: string
    }
  }
  debug(gotUserInfo)

  return {
    nsid      : gotUserInfo.person.nsid,
    iconServer: gotUserInfo.person.iconserver,
    iconFarm  : gotUserInfo.person.iconfarm,
    pathAlias : gotUserInfo.person.path_alias,
    username  : gotUserInfo.person.username,
    photosUrl : gotUserInfo.person.photosurl,
    profileUrl: gotUserInfo.person.profileurl,
  }
}
