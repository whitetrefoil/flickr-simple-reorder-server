import { IOrderByOption } from './order-by-option'

export interface IPostPhotosetBulkReorderRequest {
  nsid: string
  setIds: string[]
  orderBy: IOrderByOption
  isDesc: boolean
  token: string
  secret: string
}
