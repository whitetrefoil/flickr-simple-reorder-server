import got           from 'got'
import qs            from 'qs'
import config        from '~/helpers/config'
import { getLogger } from '../helpers/log'
import oauth         from '../helpers/oauth'

const { debug } = getLogger(`/src/${__filename.split('?')[0]}`)

const url = 'https://www.flickr.com/services/oauth/access_token'

export default async function oauthRequestToken(): Promise<{
  fullname: string
  oauth_token: string
  oauth_token_secret: string
  user_nsid: string
  username: string
}> {

  const requestData: OAuth.RequestOptions = {
    url,
    method: 'GET',
    data  : {
      oauth_callback: config.callback,
    },
  }

  const authorized = oauth.authorize(requestData)

  const { body } = await got(url, {
    searchParams: {
      ...authorized,
    },
  })

  debug(body)

  const parsedQs = qs.parse(body)

  return {
    oauth_callback_confirmed: parsedQs.oauth_callback_confirmed === 'true',
    oauth_token             : parsedQs.oauth_token as string,
    oauth_token_secret      : parsedQs.oauth_token_secret as string,
  }
}
