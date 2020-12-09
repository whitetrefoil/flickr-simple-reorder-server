import got             from 'got'
import formatFlickrApi from '~/helpers/format-api'
import oauth           from '~/helpers/oauth'
import type { Token }  from '~/interfaces/token'


const url = 'https://api.flickr.com/services/rest/'


export default async function baseGet<T = unknown>(method: string, data: Record<string, unknown>, consumer: Token) {
  const authorized = oauth(consumer).authorize({
    method: 'GET',
    url,
    data  : {
      ...data,
      method,
      oauth_token   : consumer.key,
      format        : 'json',
      nojsoncallback: '1',
    },
  })

  const response = await got(url, {
    searchParams: { ...authorized },
  })

  return formatFlickrApi(response) as T
}
