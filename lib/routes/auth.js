"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const _ = require("lodash");
const config_1 = require("../helpers/config");
const flickr = require("../helpers/flickr");
const log_1 = require("../helpers/log");
const router = new Router();
const debugGetUserInfo = log_1.debug('/routes/auth.js - getUserInfo()');
async function getUserInfo(userId, token, secret) {
    const data = {
        user_id: userId,
    };
    const gotUserInfo = await flickr.post('flickr.people.getInfo', data, token, secret);
    debugGetUserInfo(gotUserInfo);
    return {
        nsid: gotUserInfo.person.nsid,
        iconServer: gotUserInfo.person.iconserver,
        iconFarm: gotUserInfo.person.iconfarm,
        pathAlias: gotUserInfo.person.path_alias,
        username: gotUserInfo.person.username,
        photosUrl: gotUserInfo.person.photosurl,
        profileUrl: gotUserInfo.person.profileurl,
    };
}
// region GET /loginToken
const debugGetLoginToken = log_1.debug('/routes/auth.js - GET /loginToken');
router.get('/loginToken', async (ctx, next) => {
    const gotLoginToken = await flickr.getAuth('https://www.flickr.com/services/oauth/request_token', {
        oauth_callback: config_1.default.callback,
    });
    debugGetLoginToken(gotLoginToken);
    const response = {
        token: {
            key: gotLoginToken.oauth_token,
            secret: gotLoginToken.oauth_token_secret,
        },
    };
    ctx.body = response;
    await next();
});
// endregion
// region GET /accessToken
const debugGetAccessToken = log_1.debug('/routes/auth.js - GET /accessToken');
router.get('/accessToken', async (ctx, next) => {
    ctx.validateRequire(['token', 'secret', 'verifier']);
    const body = ctx.request.mergedBody;
    const gotAccessToken = await flickr.getAuth('https://www.flickr.com/services/oauth/access_token', {
        oauth_verifier: ctx.request.mergedBody.verifier,
        oauth_token: ctx.request.mergedBody.token,
    }, body.token, body.secret);
    debugGetAccessToken(gotAccessToken);
    const gotUserInfo = await getUserInfo(gotAccessToken.user_nsid, gotAccessToken.oauth_token, gotAccessToken.oauth_token_secret);
    const response = {
        token: {
            key: gotAccessToken.oauth_token,
            secret: gotAccessToken.oauth_token_secret,
        },
        user: gotUserInfo,
    };
    ctx.body = response;
    await next();
});
// endregion
// region POST /checkToken
const debugPostCheckToken = log_1.debug('/routes/auth.js - POST /checkToken');
router.post('/checkToken', async (ctx, next) => {
    ctx.validateRequire(['token', 'secret']);
    const body = ctx.request.mergedBody;
    const checkedToken = await flickr.post('flickr.auth.oauth.checkToken', {
        oauth_token: ctx.request.mergedBody.token,
    }, body.token, body.secret);
    debugPostCheckToken('flickr.auth.oauth.checkToken:', checkedToken);
    const nsid = _.get(checkedToken, 'oauth.user.nsid');
    ctx.assert(nsid != null, 502, 'Flickr didn\'t response NSID.');
    const userInfo = await getUserInfo(nsid, body.token, body.secret);
    const response = {
        user: userInfo,
    };
    ctx.body = response;
    await next();
});
// endregion
exports.default = router;
//# sourceMappingURL=auth.js.map