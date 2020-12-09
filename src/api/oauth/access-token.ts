import got           from 'got'
import qs            from 'qs'
import { getLogger } from '~/helpers/log'
import oauth         from '~/helpers/oauth'

const { debug } = getLogger(`/src/${__filename.split('?')[0]}`)

const url = 'https://www.flickr.com/services/oauth/access_token'

interface Auth {
  token: string
  verifier: string
  secret: string
}

export default async function oauthAccessToken({
  secret,
  token,
  verifier,
}: Auth): Promise<{
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
      oauth_token   : token,
      oauth_verifier: verifier,
    },
  }

  const authorized = oauth({
    key: token,
    secret,
  }).authorize(requestData)

  const { body } = await got(url, {
    searchParams: {
      ...authorized,
    },
  })

  debug(body)

  const parsedQs = qs.parse(body)

  return {
    fullname          : parsedQs.fullname as string,
    oauth_token       : parsedQs.oauth_token as string,
    oauth_token_secret: parsedQs.oauth_token_secret as string,
    user_nsid         : parsedQs.user_nsid as string,
    username          : parsedQs.username as string,
  }
}
