import crypto from 'crypto'
import type { Authorization, RequestOptions, Token } from 'oauth-1.0a'
import OAuth from 'oauth-1.0a'
import config from '../../config.js'


const oauth = new OAuth({
  consumer        : {
    key   : config.key,
    secret: config.secret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function   : (baseString, key) => crypto.createHmac('sha1', key)
    .update(baseString)
    .digest('base64'),
})

export type OAuthData = Record<string, string|number|boolean|null|undefined>

export type OAuthRequestOption<T extends OAuthData> = Omit<RequestOptions, 'data'>&{
  data: T
  key?: string
  secret?: string
}

export function authorize<T extends OAuthData>(data: OAuthRequestOption<T>): T&Authorization {
  const { key, secret, ...opts } = data
  const authorized = key == null ? oauth.authorize(opts)
    : secret == null ? oauth.authorize(opts, { key } as Token)
      : oauth.authorize(opts, { key, secret })
  return authorized as T&Authorization
}
