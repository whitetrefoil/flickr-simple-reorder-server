import basePost       from '~/api/base/post'
import type { Token } from '~/interfaces/token'


interface User {
  nsid: string
  username: string
  fullname: string
}

interface OAuth {
  token: { _content: string }
  perms: { _content: string }
  user: User
}

interface Response {
  stat: string
  oauth: OAuth
}


const method = 'flickr.auth.oauth.checkToken'


export async function flickrAuthOAuthCheckToken(token: Token) {
  return basePost<Response>(method, { oauth_token: token.key }, token)
}
