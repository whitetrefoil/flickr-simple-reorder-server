"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const _ = require("lodash");
const flickr = require("../helpers/flickr");
const log_1 = require("../helpers/log");
const router = new Router();
const debugGetPhotos = log_1.debug('/routes/photosets.js - getPhotos()');
async function getPhotos(nsid, setId, token, secret, page = 1) {
    const response = await flickr.get('flickr.photosets.getPhotos', {
        photoset_id: setId,
        user_id: nsid,
        page,
        extras: 'date_upload,date_taken,views',
    }, token, secret);
    if (parseInt(response.photoset.page, 10) >= response.photoset.pages) {
        debugGetPhotos(`Got ${response.photoset.page} / ${response.photoset.pages} page.`);
        return response.photoset.photo;
    }
    return response.photoset.photo.concat(await getPhotos(nsid, setId, token, secret, page + 1));
}
// region GET /list
// TODO: Assume there's only one page of photosets
const debugGetPhotosetList = log_1.debug('/routes/photosets.js - GET /list');
router.get('/list', async (ctx, next) => {
    ctx.validateRequire(['nsid', 'token', 'secret']);
    const body = ctx.request.mergedBody;
    const gotPhotosetList = await flickr.get(null, {
        user_id: ctx.request.mergedBody.nsid,
        primary_photo_extras: 'url_m',
        method: 'flickr.photosets.getList',
    }, body.token, body.secret);
    debugGetPhotosetList(gotPhotosetList);
    const gotPhotosets = _.get(gotPhotosetList, 'photosets.photoset');
    const simplifiedPhotosets = _.map(gotPhotosets, (photoset) => ({
        url: _.get(photoset, 'primary_photo_extras.url_m'),
        id: _.get(photoset, 'id'),
        photos: _.get(photoset, 'photos'),
        title: _.get(photoset, 'title'),
    }));
    const response = {
        photosets: simplifiedPhotosets,
    };
    ctx.body = response;
    await next();
});
// endregion
// region POST /reorder
const debugPostPhotosetReorder = log_1.debug('/routes/photosets.js - POST /reorder');
router.post('/reorder', async (ctx, next) => {
    ctx.validateRequire(['nsid', 'setId', 'orderBy', 'isDesc', 'token', 'secret']);
    const body = ctx.request.mergedBody;
    ctx.assert(_.includes(['dateTaken', 'dateUpload', 'title', 'views'], body.orderBy), 400, '"orderBy" must be one of "dateTaken", "dateUpload", "title", "views"');
    const photos = await getPhotos(ctx.request.mergedBody.nsid, ctx.request.mergedBody.setId, ctx.request.mergedBody.token, ctx.request.mergedBody.secret);
    debugPostPhotosetReorder(`Got ${photos.length} photos!`);
    const sortedPhotos = _.orderBy(photos, _.toLower(body.orderBy), body.isDesc ? 'desc' : 'asc');
    debugPostPhotosetReorder(`Original: ${photos}`);
    debugPostPhotosetReorder(`Sorted: ${sortedPhotos}`);
    if (_.isEqual(photos, sortedPhotos)) {
        const response = {
            result: {
                isSkipped: true,
                isSuccessful: true,
            },
        };
        ctx.body = response;
        await next();
        return;
    }
    const sortedPhotoIds = _(sortedPhotos).map('id').join(',');
    debugPostPhotosetReorder(`New order: ${sortedPhotoIds}`);
    const reorderResult = await flickr.post('flickr.photosets.reorderPhotos', {
        photoset_id: ctx.request.mergedBody.setId,
        photo_ids: sortedPhotoIds,
    }, body.token, body.secret);
    debugPostPhotosetReorder(reorderResult);
    const response = {
        result: {
            isSkipped: false,
            isSuccessful: true,
        },
    };
    ctx.body = response;
    await next();
});
// endregion
exports.default = router;
//# sourceMappingURL=photosets.js.map