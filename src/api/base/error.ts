import got             from 'got'
import createHttpError from 'http-errors'

export default function handleApiError(e: unknown): never {
  if (e instanceof got.RequestError) {

  }
  throw createHttpError(500, 'unknown error')
}
