import got from 'got'
import createHttpError from 'http-errors'
import * as _ from 'lodash-es'
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
  }

  const req = await got.post(requestData.url, {
    form        : authorize(requestData),
    responseType: 'json',
  })

  if (!req.ok || _.get(req.body, 'stat') !== 'ok') {
    throw createHttpError(req.statusCode, _.get(req.body, 'message'))
  }

  return formatFlickrApi(req.body as IFlickrResponseObj)
}
