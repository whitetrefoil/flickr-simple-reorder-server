'use strict'

const debug   = require('debug')
const Router  = require('koa-router')
const _       = require('lodash')

const flickr = require('../helpers/flickr')

const router = new Router()


async function getUserInfo(userId, token, secret) {
  const data = {
    // eslint-disable-next-line camelcase
    user_id: userId,
  }

  return await flickr.post('flickr.people.getInfo', data, token, secret)
}


// region GET /loginToken

const debugGetLoginToken = debug('/routes/auth.js - GET /loginToken')
router.get('/loginToken', async (ctx, next) => {
  const gotLoginToken = await flickr.get('https://www.flickr.com/services/oauth/request_token', {
    // TODO
    // eslint-disable-next-line camelcase
    oauth_callback: 'http://localhost:8000/#/login',
  })
  debugGetLoginToken(gotLoginToken)

  ctx.body = {
    token : gotLoginToken.oauth_token,
    secret: gotLoginToken.oauth_token_secret,
  }

  await next()
})

// endregion

// region GET /accessToken

const debugGetAccessToken = debug('/routes/auth.js - GET /accessToken')
router.get('/accessToken', async (ctx, next) => {
  ctx.validateRequire(['token', 'secret', 'verifier'])

  const gotAccessToken = await flickr.get(
    'https://www.flickr.com/services/oauth/access_token',
    {
      // eslint-disable-next-line camelcase
      oauth_verifier: ctx.request.mergedBody.verifier,
      // eslint-disable-next-line camelcase
      oauth_token   : ctx.request.mergedBody.token,
    },
    ctx.request.mergedBody.token,
    ctx.request.mergedBody.secret,
  )
  debugGetAccessToken(gotAccessToken)

  const gotUserInfo = await getUserInfo(gotAccessToken.user_nsid, gotAccessToken.oauth_token, gotAccessToken.oauth_token_secret)

  ctx.body = {
    auth  : gotAccessToken,
    person: gotUserInfo.person,
  }

  await next()
})

// endregion

// region POST /checkToken

const debugPostCheckToken = debug('/routes/auth.js - POST /checkToken')
router.post('/checkToken', async (ctx, next) => {
  ctx.validateRequire(['token', 'secret'])

  const checkedToken = await flickr.post('flickr.auth.oauth.checkToken', {
    // eslint-disable-next-line camelcase
    oauth_token: ctx.request.mergedBody.token,
  }, ctx.request.mergedBody.token, ctx.request.mergedBody.secret)

  debugPostCheckToken('flickr.auth.oauth.checkToken:', checkedToken)
  const nsid = _.get(checkedToken, 'oauth.user.nsid')
  ctx.assert(nsid != null, 502, 'Flickr didn\'t response NSID.')

  const userInfo = await getUserInfo(nsid, ctx.request.mergedBody.token, ctx.request.mergedBody.secret)
  ctx.body       = {
    oauth : checkedToken.oauth,
    person: userInfo.person,
  }

  await next()
})

// endregion

module.exports = router
