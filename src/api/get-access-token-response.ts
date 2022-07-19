import type { IToken } from './token.js'
import type { IUser } from './user.js'

export interface IGetAccessTokenResponse {
  token: IToken
  user: IUser
}
