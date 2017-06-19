"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const statuses = require("statuses");
const log = require("../helpers/log");
const debug = log.debug('/middlewares/error-formatter.js');
function errorFormatterFactory() {
    return async (ctx, next) => {
        try {
            await next();
        }
        catch (error) {
            debug(error);
            ctx.status = error.status || 500;
            if (error.response == null) {
                ctx.body = { message: error.message || error };
                return;
            }
            ctx.body = { message: statuses[ctx.status] };
            log.error(error.message);
            if (!_.isEmpty(error.response.error)) {
                ctx.devMessage = error.response.error;
                return;
            }
            if (!_.isEmpty(error.response.body)) {
                ctx.devMessage = error.response.body;
                return;
            }
            ctx.devMessage = error.response.text;
            return;
        }
    };
}
exports.default = errorFormatterFactory;
//# sourceMappingURL=error-formatter.js.map