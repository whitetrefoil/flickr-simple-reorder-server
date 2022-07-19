import Router from '@koa/router'
import { getPhotosets } from './photosets/get-photosets.js'
import { postPhotosetReorder } from './photosets/post-photoset-reorder.js'
import { postPhotosetsBulkReorder } from './photosets/post-photosets-bulk-reorder.js'


export const photosetsRouter = new Router()
  .get('/list', getPhotosets)
  .post('/reorder', postPhotosetReorder)
  .post('/bulk_reorder', postPhotosetsBulkReorder)
