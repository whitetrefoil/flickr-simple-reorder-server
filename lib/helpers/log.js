"use strict";
/* tslint:disable:no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const timestamp = require("time-stamp");
const config_1 = require("./config");
function datetime() {
    return timestamp('YYYY-MM-DD HH:mm:ss.ms');
}
function log(...args) {
    if (config_1.default.logLevel !== 'log') {
        return;
    }
    console.log(datetime(), '- LOG -', ...args);
}
exports.log = log;
function warn(...args) {
    if (config_1.default.logLevel === 'error') {
        return;
    }
    console.warn(datetime(), '- WAR -', ...args);
}
exports.warn = warn;
function error(...args) {
    console.error(datetime(), '- ERR -', ...args);
}
exports.error = error;
function debug(name) {
    if (!config_1.default.isDev() || _.isEmpty(process.env.DEBUG)) {
        return _.noop;
    }
    return require('debug')(name);
}
exports.debug = debug;
//# sourceMappingURL=log.js.map