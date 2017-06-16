"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function responseBodyFactory() {
    return async (ctx, next) => {
        await next();
        const body = ctx.body;
        const devMessage = ctx.devMessage;
        const code = ctx.status;
        const formattedBody = {
            code,
            devMessage,
            data: body,
        };
        ctx.body = formattedBody;
    };
}
exports.default = responseBodyFactory;
//# sourceMappingURL=response-body.js.map