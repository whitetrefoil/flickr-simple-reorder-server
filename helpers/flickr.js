'use strict'

const crypto  = require('crypto')
const debug   = require('debug')
const _       = require('lodash')
const OAuth   = require('oauth-1.0a')
const qs      = require('querystring')
const request = require('superagent')
const format  = require('./format-api')


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


const debugGetAuth = debug('/helpers/flickr.js - getAuth()')
async function getAuth(url, data, token, secret) {
  const requestData = {
    url,
    method: 'GET',
    data  : data,
  }

  const authToken = token == null || secret == null ? {} : { token, secret }

  const authorized = oauth.authorize(requestData, authToken)

  const raw = await request('GET', url).query(authorized)

  debugGetAuth(raw)

  return qs.parse(raw.text)
}


const debugGet = debug('/helpers/flickr.js - get()')
async function get(method, data, token, secret) {
  const requestData = {
    url   : 'https://api.flickr.com/services/rest/',
    method: 'GET',
    data  : _.defaults(data, {
      method        : method,
      format        : 'json',
      nojsoncallback: '1',
    }),
  }

  const authToken = token == null || secret == null ? {} : { token, secret }

  const authorized = oauth.authorize(requestData, authToken)

  const raw = await request(requestData.method, requestData.url)
    .ok((res) => {
      return res.status < 400 && _.get(res, 'body.stat') === 'ok'
    })
    .query(authorized)

  debugGet(raw)

  return format(raw.body)
}


const debugPost = debug('/helpers/flickr.js - post()')
async function post(method, data, token, secret) {
  const requestData = {
    url   : 'https://api.flickr.com/services/rest/',
    method: 'POST',
    data  : _.defaults(data, {
      method        : method,
      format        : 'json',
      nojsoncallback: '1',
    }),
  }

  const authorized = oauth.authorize(requestData, { token, secret })

  const raw = await request(requestData.method, requestData.url)
    .type('form')
    .ok((res) => {
      return res.status < 400 && _.get(res, 'body.stat') === 'ok'
    })
    .send(authorized)

  debugPost(raw.body)

  return format(raw.body)
}

module.exports = {
  getAuth,
  get,
  post,
}
