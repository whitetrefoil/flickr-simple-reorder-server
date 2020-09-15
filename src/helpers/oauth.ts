import crypto from 'crypto'
import OAuth  from 'oauth-1.0a'
import config from './config'

export default new OAuth({
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
