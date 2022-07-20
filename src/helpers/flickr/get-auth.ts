import qs from 'querystring'
import { client } from '../client.js'
import { getLogger } from '../log.js'
import type { OAuthData } from './oauth.js'
import { authorize } from './oauth.js'

const { debug } = getLogger(import.meta.url)


export async function getAuth<T extends OAuthData>(
  url: string,
  data: T,
  key?: string,
  secret?: string,
): Promise<unknown> {
  const requestData = { method: 'GET', url, data, key, secret }

  const raw = await client.get(url, {
    searchParams: authorize(requestData),
  })

  debug(raw.body)

  return qs.parse(raw.body)
}
