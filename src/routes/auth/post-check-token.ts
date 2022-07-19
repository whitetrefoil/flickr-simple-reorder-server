import type { Middleware } from '@koa/router'
import type { DefaultState } from 'koa'
import _ from 'lodash-es'
import type * as API from '../../api/index.js'
import { post } from '../../helpers/flickr/post.js'
import { getLogger } from '../../helpers/log.js'
import type { ContextWithMergedBody } from '../../middlewares/request-body.js'
import type { MaybeObj } from '../../utils/types.js'
import { getUserInfo } from './utils.js'


const { debug } = getLogger(import.meta.url)


export const postCheckToken: Middleware<DefaultState, ContextWithMergedBody> = async ctx => {
  const { token, secret } = ctx.request.mergedBody as MaybeObj<'token'|'secret'>
  if (typeof token !== 'string' || typeof secret !== 'string') {
    ctx.throw(400)
    return
  }

  const checkTokenRes = await post('flickr.auth.oauth.checkToken', {
    oauth_token: token,
  }, token, secret)
  debug('flickr.auth.oauth.checkToken:', checkTokenRes)

  const nsid = _.get(checkTokenRes, 'oauth.user.nsid') as unknown
  if (typeof nsid !== 'string') {
    ctx.throw(502)
    return
  }

  const userInfoRes = await getUserInfo(nsid, token, secret) as API.IUser
  debug(userInfoRes)

  const response: API.IPostCheckTokenResponse = {
    user: userInfoRes,
  }

  ctx.body = response
}
