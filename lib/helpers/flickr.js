"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const _ = require("lodash");
const OAuth = require("oauth-1.0a");
const qs = require("querystring");
const request = require("superagent");
const config_1 = require("../helpers/config");
const format_api_1 = require("./format-api");
const log_1 = require("./log");
const oauth = OAuth({
    consumer: {
        key: config_1.default.key,
        secret: config_1.default.secret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64'),
});
const debugGetAuth = log_1.debug('/helpers/flickr.js - getAuth()');
async function getAuth(url, data, token, secret) {
    const requestData = {
        url,
        method: 'GET',
        data,
    };
    const authToken = token == null || secret == null ? {} : { token, secret };
    const authorized = oauth.authorize(requestData, authToken);
    const raw = await request('GET', url).query(authorized);
    debugGetAuth(raw.text);
    return qs.parse(raw.text);
}
exports.getAuth = getAuth;
const debugGet = log_1.debug('/helpers/flickr.js - get()');
async function get(method, data, token, secret) {
    const requestData = {
        url: 'https://api.flickr.com/services/rest/',
        method: 'GET',
        data: _.defaults(data, {
            oauth_token: token,
            method,
            format: 'json',
            nojsoncallback: '1',
        }),
    };
    const authToken = token == null || secret == null ? {} : { token, secret };
    const authorized = oauth.authorize(requestData, authToken);
    const raw = await request(requestData.method, requestData.url)
        .ok((res) => res.status < 400 && _.get(res, 'body.stat') === 'ok')
        .query(authorized);
    debugGet(raw.body);
    return format_api_1.default(raw.body);
}
exports.get = get;
const debugPost = log_1.debug('/helpers/flickr.js - post()');
async function post(method, data, token, secret) {
    const requestData = {
        url: 'https://api.flickr.com/services/rest/',
        method: 'POST',
        data: _.defaults(data, {
            oauth_token: token,
            method,
            format: 'json',
            nojsoncallback: '1',
        }),
    };
    const authorized = oauth.authorize(requestData, { token, secret });
    const raw = await request(requestData.method, requestData.url)
        .type('form')
        .ok((res) => res.status < 400 && _.get(res, 'body.stat') === 'ok')
        .send(authorized);
    debugPost(raw.body);
    return format_api_1.default(raw.body);
}
exports.post = post;
//# sourceMappingURL=flickr.js.map