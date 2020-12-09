import { flickrAuthOAuthCheckToken }    from '~/api/flickr/auth/oauth/check-token'
import getUserInfo                      from '~/api/flickr/people/get-info'
import type { IPostCheckTokenResponse } from '~/api/post-check-token-response'
import type { IMiddleware }             from '~/interfaces/middleware'
import { isString }                     from '~/middlewares/assert-payload'


const postCheckToken: IMiddleware = async(ctx, next) => {
  const token = ctx.assertRequired('token', isString)
  const secret = ctx.assertRequired('secret', isString)

  const checked = await flickrAuthOAuthCheckToken({ key: token, secret })
  const { nsid } = checked.oauth.user

  const userInfo = await getUserInfo(nsid, { key: token, secret })
  const response: IPostCheckTokenResponse = {
    user: userInfo,
  }

  ctx.body = response

  await next()
}

export default postCheckToken
