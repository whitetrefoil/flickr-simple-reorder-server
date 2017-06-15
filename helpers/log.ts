/* tslint:disable:no-console */

import * as _         from 'lodash'
import * as timestamp from 'time-stamp'
import config         from './config'

function datetime(): string {
  return timestamp('YYYY-MM-DD HH:mm:ss.ms')
}

export function log(...args: any[]): void {
  if (config.logLevel !== 'log') { return }
  console.log(datetime(), '- LOG -', ...args)
}

export function warn(...args: any[]): void {
  if (config.logLevel === 'error') { return }
  console.warn(datetime(), '- WAR -', ...args)
}

export function error(...args: any[]): void {
  console.error(datetime(), '- ERR -', ...args)
}

export function debug(name: string): Function {
  if (!config.isDev() || _.isEmpty(process.env.DEBUG)) { return _.noop }
  return require('debug')(name)
}
