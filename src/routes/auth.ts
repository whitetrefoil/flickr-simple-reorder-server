import * as Router from 'koa-router'
import * as _      from 'lodash'
import * as API    from '../api'
import config      from '../helpers/config'
import * as flickr from '../helpers/flickr'
import { debug }   from '../helpers/log'

const router = new Router()

const debugGetUserInfo = debug('/routes/auth.js - getUserInfo()').debug

async function getUserInfo(userId: string, token: string, secret: string): Promise<API.IUser> {
  const data = {
    user_id: userId,
  }

  const gotUserInfo = await flickr.post('flickr.people.getInfo', data, token, secret)
  debugGetUserInfo(gotUserInfo)

  return {
    nsid      : gotUserInfo.person.nsid,
    iconServer: gotUserInfo.person.iconserver,
    iconFarm  : gotUserInfo.person.iconfarm,
    pathAlias : gotUserInfo.person.path_alias,
    username  : gotUserInfo.person.username,
    photosUrl : gotUserInfo.person.photosurl,
    profileUrl: gotUserInfo.person.profileurl,
  }
}


// region GET /loginToken

const debugGetLoginToken = debug('/routes/auth.js - GET /loginToken').debug
router.get('/loginToken', async(ctx, next) => {
  const gotLoginToken = await flickr.getAuth('https://www.flickr.com/services/oauth/request_token', {
    oauth_callback: config.callback,
  })
  debugGetLoginToken(gotLoginToken)

  const response: API.IGetLoginTokenResponse = {
    token: {
      key   : gotLoginToken.oauth_token,
      secret: gotLoginToken.oauth_token_secret,
    },
  }

  ctx.body = response

  await next()
})

// endregion

// region GET /accessToken

const debugGetAccessToken = debug('/routes/auth.js - GET /accessToken').debug
router.get('/accessToken', async(ctx, next) => {
  ctx.validateRequire(['token', 'secret', 'verifier'])

  const body: API.IGetAccessTokenRequest = ctx.request.mergedBody

  const gotAccessToken = await flickr.getAuth('https://www.flickr.com/services/oauth/access_token', {
    oauth_verifier: ctx.request.mergedBody.verifier,
    oauth_token   : ctx.request.mergedBody.token,
  }, body.token, body.secret)
  debugGetAccessToken(gotAccessToken)

  const gotUserInfo: API.IUser = await getUserInfo(
    gotAccessToken.user_nsid,
    gotAccessToken.oauth_token,
    gotAccessToken.oauth_token_secret,
  )

  const response: API.IGetAccessTokenResponse = {
    token: {
      key   : gotAccessToken.oauth_token,
      secret: gotAccessToken.oauth_token_secret,
    },
    user : gotUserInfo,
  }

  ctx.body = response

  await next()
})

// endregion

// region POST /checkToken

const debugPostCheckToken = debug('/routes/auth.js - POST /checkToken').debug
router.post('/checkToken', async(ctx, next) => {
  ctx.validateRequire(['token', 'secret'])

  const body: API.IPostCheckTokenRequest = ctx.request.mergedBody

  const checkedToken = await flickr.post('flickr.auth.oauth.checkToken', {
    oauth_token: body.token,
  }, body.token, body.secret)

  debugPostCheckToken('flickr.auth.oauth.checkToken:', checkedToken)
  const nsid = _.get(checkedToken, 'oauth.user.nsid') as string
  ctx.assert(nsid != null, 502, 'Flickr didn\'t response NSID.')

  const userInfo = await getUserInfo(nsid, body.token, body.secret)

  const response: API.IPostCheckTokenResponse = {
    user: userInfo,
  }

  ctx.body = response

  await next()
})

// endregion

export default router
