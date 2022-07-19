import type { Middleware } from '@koa/router'
import type { IGetLoginTokenResponse } from '../../api/index.js'
import config from '../../config.js'
import { getAuth } from '../../helpers/flickr/get-auth.js'
import { getLogger } from '../../helpers/log.js'


const { debug } = getLogger(import.meta.url)


export const getLoginToken: Middleware = async ctx => {
  const gotLoginToken = await getAuth('https://www.flickr.com/services/oauth/request_token', {
    oauth_callback: config.callback,
  }) as {
    oauth_token: string
    oauth_token_secret: string
  }

  debug(gotLoginToken)

  const response: IGetLoginTokenResponse = {
    token: {
      key   : gotLoginToken.oauth_token,
      secret: gotLoginToken.oauth_token_secret,
    },
  }

  ctx.body = response
}
