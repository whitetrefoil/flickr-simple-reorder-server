import createHttpError from 'http-errors'
import * as _ from 'lodash-es'
import { client } from '../client.js'
import type { IFlickrResponseObj } from '../format-api.js'
import formatFlickrApi from '../format-api.js'
import type { OAuthData } from './oauth.js'
import { authorize } from './oauth.js'


export async function get<T extends OAuthData>(method: string, data: T, key: string, secret: string): Promise<unknown> {
  const requestData = {
    url   : 'https://api.flickr.com/services/rest/',
    method: 'GET',
    data  : _.defaults(data, {
      oauth_token   : key,
      method,
      format        : 'json',
      nojsoncallback: '1',
    }),
    key,
    secret,
  }

  const req = await client.get(requestData.url, {
    searchParams: authorize(requestData),
    responseType: 'json',
  })

  if (!req.ok || _.get(req.body, 'stat') !== 'ok') {
    throw createHttpError(req.statusCode, _.get(req.body, 'message'))
  }

  return formatFlickrApi(req.body as IFlickrResponseObj)
}
