import { IToken } from './token'
import { IUser }  from './user'

export interface IGetAccessTokenResponse {
  token: IToken
  user: IUser
}
