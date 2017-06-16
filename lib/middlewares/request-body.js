"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function requestBodyFactory() {
    return async (ctx, next) => {
        ctx.request.mergedBody = _.assign({}, ctx.query, ctx.request.body);
        await next();
    };
}
exports.default = requestBodyFactory;
//# sourceMappingURL=request-body.js.map