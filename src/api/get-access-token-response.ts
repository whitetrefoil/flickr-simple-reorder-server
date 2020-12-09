import type { Token } from '~/interfaces/token'
import type { User }  from '~/interfaces/user'

export interface IGetAccessTokenResponse {
  token: Token
  user: User
}
