"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function validateFactory() {
    return async (ctx, next) => {
        ctx.validateRequire = (fields) => {
            _.forEach(fields, (field) => {
                ctx.assert(!_.isNil(_.get(ctx.request.mergedBody, field)), 400, `"${field}" is required.`);
            });
        };
        await next();
    };
}
exports.default = validateFactory;
//# sourceMappingURL=validate.js.map