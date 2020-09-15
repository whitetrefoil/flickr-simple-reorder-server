import type { IOrderByOption } from './order-by-option'

export interface IPostPhotosetReorderRequest {
  nsid: string
  setId: string
  orderBy: IOrderByOption
  isDesc: boolean
  token: string
  secret: string
}
