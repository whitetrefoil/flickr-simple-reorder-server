import type { IOrderByOption } from './order-by-option.js'

export interface IPostPhotosetBulkReorderRequest {
  nsid: string
  setIds: string[]
  orderBy: IOrderByOption
  isDesc: boolean
  token: string
  secret: string
}
