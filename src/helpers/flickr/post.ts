import createHttpError from 'http-errors'
import * as _ from 'lodash-es'
import { client } from '../client.js'
import type { IFlickrResponseObj } from '../format-api.js'
import formatFlickrApi from '../format-api.js'
import type { OAuthData } from './oauth.js'
import { authorize } from './oauth.js'


export async function post<T extends OAuthData>(
  method: string, data: T, key: string, secret: string): Promise<unknown> {
  const requestData = {
    url   : 'https://api.flickr.com/services/rest/',
    method: 'POST',
    data  : _.defaults(data, {
      oauth_token   : key,
      method,
      format        : 'json',
      nojsoncallback: '1',
    }),
    key,
    secret,
  }

  const res = await client.post(requestData.url, {
    form        : authorize(requestData),
    responseType: 'json',
  })

  if (!res.ok || _.get(res.body, 'stat') !== 'ok') {
    throw createHttpError(res.statusCode, _.get(res.body, 'message') ?? res.body ?? 'Unknown error')
  }

  return formatFlickrApi(res.body as IFlickrResponseObj)
}
