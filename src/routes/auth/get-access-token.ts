import getUserInfo                      from '~/api/flickr/people/get-info'
import type { IGetAccessTokenResponse } from '~/api/get-access-token-response'
import oauthAccessToken                 from '~/api/oauth/access-token'
import type { IMiddleware }             from '~/interfaces/middleware'
import { isString }                     from '~/middlewares/assert-payload'


const getAccessToken: IMiddleware = async(ctx, next) => {

  const token = ctx.assertRequired('token', isString)
  const verifier = ctx.assertRequired('token', isString)
  const secret = ctx.assertRequired('token', isString)

  const result = await oauthAccessToken({
    token,
    verifier,
    secret,
  })

  const userInfo = await getUserInfo(result.user_nsid, {
    key   : result.oauth_token,
    secret: result.oauth_token_secret,
  })

  const response: IGetAccessTokenResponse = {
    user : userInfo,
    token: {
      key: token,
      secret,
    },
  }

  ctx.body = response

  await next()
}


export default getAccessToken
