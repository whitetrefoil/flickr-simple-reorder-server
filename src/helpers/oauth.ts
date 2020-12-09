import crypto from 'crypto'
import OAuth  from 'oauth-1.0a'
import config from './config'


export default function oauth(consumer: OAuth.Consumer = {
  key   : config.key,
  secret: config.secret,
}) {

  return new OAuth({
    consumer,
    signature_method: 'HMAC-SHA1',
    hash_function   : (baseString, key) =>
      crypto
        .createHmac('sha1', key)
        .update(baseString)
        .digest('base64'),
  })
}
