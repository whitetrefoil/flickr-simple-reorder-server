/* eslint no-console:off, global-require:off */
'use strict'

const _         = require('lodash')
const timestamp = require('time-stamp')
const config    = require('./config')

/**
 * @returns {string}
 */
function datetime() {
  return timestamp('YYYY-MM-DD HH:mm:ss.ms')
}

function log(...args) {
  if (config.logLevel !== 'log') { return }
  console.log(datetime(), '- LOG -', ...args)
}

function warn(...args) {
  if (config.logLevel === 'error') { return }
  console.warn(datetime(), '- WAR -', ...args)
}

function error(...args) {
  console.error(datetime(), '- ERR -', ...args)
}

function debug(name) {
  if (!config.isDev() || _.isEmpty(process.env.DEBUG)) { return _.noop }
  return require('debug')(name)
}

module.exports = {
  log,
  warn,
  error,
  debug,
}
