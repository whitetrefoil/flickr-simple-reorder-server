import type { IGetLoginTokenResponse } from '~/api'
import oauthRequestToken               from '~/api/oauth/request-token'
import type { IMiddleware }            from '~/interfaces/middleware'

const getLoginToken: IMiddleware = async(ctx, next) => {
  const result = await oauthRequestToken()

  const response: IGetLoginTokenResponse = {
    token: {
      key   : result.oauth_token,
      secret: result.oauth_token_secret,
    },
  }

  ctx.body = response

  await next()
}

export default getLoginToken
