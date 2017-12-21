import * as crypto  from 'crypto'
import * as _       from 'lodash'
import * as OAuth   from 'oauth-1.0a'
import * as qs      from 'querystring'
import * as request from 'superagent'
import config       from '../helpers/config'
import format       from './format-api'
import { debug }    from './log'


const oauth = OAuth({
  consumer        : {
    key   : config.key,
    secret: config.secret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function   : (baseString, key) => crypto.createHmac('sha1', key)
    .update(baseString)
    .digest('base64'),
})


const debugGetAuth = debug('/helpers/flickr.js - getAuth()').debug

export async function getAuth(url: string, data: any, token?: string, secret?: string): Promise<any> {
  const requestData: OAuth.IRequest = {
    url,
    method: 'GET',
    data,
  }

  const authToken = token == null || secret == null ? {} : { token, secret }

  const authorized = oauth.authorize(requestData, authToken)

  const raw = await request('GET', url)
    .query(authorized)

  debugGetAuth(raw.text)

  return qs.parse(raw.text)
}


const debugGet = debug('/helpers/flickr.js - get()').debug

export async function get(method: string, data: any, token: string, secret: string): Promise<any> {
  const requestData: OAuth.IRequest = {
    url   : 'https://api.flickr.com/services/rest/',
    method: 'GET',
    data  : _.defaults(data, {
      oauth_token   : token,
      method,
      format        : 'json',
      nojsoncallback: '1',
    }),
  }

  const authToken = token == null || secret == null ? {} : { token, secret }

  const authorized = oauth.authorize(requestData, authToken)

  const raw = await request(requestData.method, requestData.url)
    .ok((res) => res.status < 400 && _.get(res, 'body.stat') === 'ok')
    .query(authorized)

  // debugGet(raw.body)

  return format(raw.body)
}


const debugPost = debug('/helpers/flickr.js - post()').debug

export async function post(method: string, data: any, token: string, secret: string) {
  const requestData: OAuth.IRequest = {
    url   : 'https://api.flickr.com/services/rest/',
    method: 'POST',
    data  : _.defaults(data, {
      oauth_token   : token,
      method,
      format        : 'json',
      nojsoncallback: '1',
    }),
  }

  const authorized = oauth.authorize(requestData, { token, secret })
  debugPost(authorized)

  const raw = await request(requestData.method, requestData.url)
    .type('form')
    .ok((res) => {
      const statusIsOk = res.status < 400
      debugPost('Is status OK?:', statusIsOk)
      if (!statusIsOk) { return false }

      const flickrIsOk = _.get(res, 'body.stat') === 'ok'
      debugPost('Is flickr OK?:', flickrIsOk)
      if (!flickrIsOk) {
        res.status = 400
        return false
      }

      return true
    })
    .send(authorized)

  debugPost(raw.body)

  return format(raw.body)
}
