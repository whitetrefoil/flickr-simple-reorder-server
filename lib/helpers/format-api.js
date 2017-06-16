"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function formatFlickrApi(obj) {
    if (_.isNil(obj)) {
        return null;
    }
    if (obj._content) {
        return obj._content;
    }
    if (_.isPlainObject(obj)) {
        return _.mapValues(obj, formatFlickrApi);
    }
    else if (_.isArray(obj)) {
        return _.map(obj, formatFlickrApi);
    }
    return obj;
}
exports.default = formatFlickrApi;
//# sourceMappingURL=format-api.js.map