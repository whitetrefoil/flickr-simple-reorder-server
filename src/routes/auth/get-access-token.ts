import type { Middleware } from '@koa/router'
import type { DefaultState } from 'koa'
import type * as API from '../../api/index.js'
import { getAuth } from '../../helpers/flickr/get-auth.js'
import { getLogger } from '../../helpers/log.js'
import type { ContextWithMergedBody } from '../../middlewares/request-body.js'
import type { MaybeObj } from '../../utils/types.js'
import { getUserInfo } from './utils.js'


const { debug } = getLogger(import.meta.url)


export const getAccessToken: Middleware<DefaultState, ContextWithMergedBody> = async ctx => {
  const { token, secret, verifier } = ctx.request.mergedBody as MaybeObj<'token'|'secret'|'verifier'>
  if (typeof token !== 'string' || typeof secret !== 'string' || typeof verifier !== 'string') {
    ctx.throw(400)
    return
  }

  const accessTokenRes = await getAuth('https://www.flickr.com/services/oauth/access_token', {
    oauth_verifier: verifier,
    oauth_token   : token,
  }, token, secret) as {
    user_nsid: string
    oauth_token: string
    oauth_token_secret: string
  }
  debug(accessTokenRes)

  const userInfoRes = await getUserInfo(
    accessTokenRes.user_nsid,
    accessTokenRes.oauth_token,
    accessTokenRes.oauth_token_secret,
  ) as API.IUser
  debug(userInfoRes)

  const response: API.IGetAccessTokenResponse = {
    token: {
      key   : accessTokenRes.oauth_token,
      secret: accessTokenRes.oauth_token_secret,
    },
    user : userInfoRes,
  }

  ctx.body = response
}
