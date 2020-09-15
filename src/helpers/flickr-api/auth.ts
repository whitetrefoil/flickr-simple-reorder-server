import crypto        from 'crypto'
import got           from 'got'
import OAuth         from 'oauth-1.0a'
import qs            from 'querystring'
import config        from '../config'
import { getLogger } from '../log'

const { debug } = getLogger(`/src/${__filename.split('?')[0]}`)

const oauth = new OAuth({
  consumer        : {
    key   : config.key,
    secret: config.secret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function   : (baseString, key) =>
    crypto
      .createHmac('sha1', key)
      .update(baseString)
      .digest('base64'),
})

export async function getAuth(
  url: string,
  data: { oauth_callback: string }|{ oauth_token: string, oauth_verifier: string },
  key?: string,
  secret?: string,
): Promise<{
  oauth_callback_confirmed: boolean
  oauth_token: string
  oauth_token_secret: string
}|{
  fullname: string
  user_nsid: string
  oauth_token: string
  oauth_token_secret: string
}> {

  const requestData: OAuth.RequestOptions = {
    url,
    method: 'GET',
    data,
  }

  const authToken = key == null || secret == null ? undefined : { key, secret }

  const authorized = oauth.authorize(requestData, authToken)

  const { body } = await got(url, {
    searchParams: {
      ...authorized,
    },
  })

  debug(body)

  return qs.parse(body) as {
    user_nsid?: string
    oauth_token: string
    oauth_token_secret: string
  }
}
