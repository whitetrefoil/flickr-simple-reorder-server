'use strict'

const crypto  = require('crypto')
// const debug   = require('debug')('/routes/auth.js')
const Router  = require('koa-router')
const _       = require('lodash')
const OAuth   = require('oauth-1.0a')
const qs      = require('querystring')
const request = require('superagent')

const router = new Router()

const oauth = OAuth({
  // TODO
  consumer        : {
    key   : '5cdc0f5ec9c28202f1098f615edba5cd',
    secret: 'e3b842e3b923b0fb',
  },
  // eslint-disable-next-line camelcase
  signature_method: 'HMAC-SHA1',
  // eslint-disable-next-line camelcase
  hash_function   : (baseString, key) => {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64')
  },
})

// region /loginToken

router.get('/loginToken', async (ctx, next) => {
  const data = {
    url   : 'https://www.flickr.com/services/oauth/request_token',
    method: 'GET',
    data  : {
      // TODO
      // eslint-disable-next-line camelcase
      oauth_callback: 'http://localhost:8000/#/login',
    },
  }

  try {
    const raw = await request(data.method, data.url)
      .query(oauth.authorize(data, {}))
    const res = qs.parse(raw.text)
    ctx.body  = {
      token : res.oauth_token,
      secret: res.oauth_token_secret,
    }
  } catch (error) {
    ctx.throw(error)
  }

  await next()
})

// endregion

// region /accessToken

router.get('/accessToken', async (ctx, next) => {
  ctx.validateRequire(['token', 'secret', 'verifier'])

  const data = {
    url   : 'https://www.flickr.com/services/oauth/access_token',
    method: 'GET',
    data  : {
      // eslint-disable-next-line camelcase
      oauth_verifier: ctx.request.mergedBody.verifier,
      // eslint-disable-next-line camelcase
      oauth_token   : ctx.request.mergedBody.token,
    },
  }

  const authorized = oauth.authorize(data, {
    token : ctx.request.mergedBody.token,
    secret: ctx.request.mergedBody.secret,
  })

  try {
    const raw = await request(data.method, data.url)
      .query(authorized)
    const res = qs.parse(raw.text)
    ctx.body  = {
      token   : res.oauth_token,
      secret  : res.oauth_token_secret,
      nsid    : res.user_nsid,
      username: res.username,
    }
  } catch (error) {
    ctx.throw(error)
  }

  await next()
})

// endregion

module.exports = router
