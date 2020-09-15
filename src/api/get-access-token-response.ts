import type { IToken } from './token'
import type { IUser }  from './user'

export interface IGetAccessTokenResponse {
  token: IToken
  user: IUser
}
