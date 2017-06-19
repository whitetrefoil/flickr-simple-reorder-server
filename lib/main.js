"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koaLogger = require("koa-logger");
const koaHelmet = require("koa-helmet");
const koaConditionalGet = require("koa-conditional-get");
const koaEtag = require("koa-etag");
const koaBodyparser = require("koa-bodyparser");
const config_1 = require("./helpers/config");
const log_1 = require("./helpers/log");
const error_formatter_1 = require("./middlewares/error-formatter");
const request_body_1 = require("./middlewares/request-body");
const response_body_1 = require("./middlewares/response-body");
const validate_1 = require("./middlewares/validate");
const auth_1 = require("./routes/auth");
const photosets_1 = require("./routes/photosets");
const server_1 = require("./server");
const mount = require('koa-mount');
server_1.default.use(response_body_1.default());
server_1.default.use(koaLogger());
server_1.default.use(koaHelmet());
server_1.default.use(koaConditionalGet());
server_1.default.use(koaEtag());
server_1.default.use(koaBodyparser());
server_1.default.use(error_formatter_1.default());
server_1.default.use(request_body_1.default());
server_1.default.use(validate_1.default());
server_1.default.use(mount('/auth', auth_1.default.routes()));
server_1.default.use(mount('/auth', auth_1.default.allowedMethods()));
server_1.default.use(mount('/photosets', photosets_1.default.routes()));
server_1.default.use(mount('/photosets', photosets_1.default.allowedMethods()));
server_1.default.listen(config_1.default.port, () => {
    log_1.log(`Server started at port ${config_1.default.port}`);
});
//# sourceMappingURL=main.js.map