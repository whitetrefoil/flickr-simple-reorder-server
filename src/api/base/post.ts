import got             from 'got'
import formatFlickrApi from '~/helpers/format-api'
import oauth           from '~/helpers/oauth'
import type { Token }  from '~/interfaces/token'


const url = 'https://api.flickr.com/services/rest/'


export default async function basePost<T = unknown>(method: string, data: Record<string, unknown>, consumer: Token) {
  const authorized = oauth(consumer).authorize({
    method: 'POST',
    url,
    data  : {
      ...data,
      method,
      oauth_token   : consumer.key,
      format        : 'json',
      nojsoncallback: '1',
    },
  })

  const response = await got.post(url, {
    form: { ...authorized },
  }).json()

  return formatFlickrApi(response) as T
}
