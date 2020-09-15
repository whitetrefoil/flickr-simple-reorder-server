/* eslint-disable no-console */

import { setFilter } from '@whitetrefoil/debug-log'
import timestamp     from 'time-stamp'
import config        from './config'

export { getLogger } from '@whitetrefoil/debug-log'

if (process.env.DEBUG == null || process.env.DEBUG.length === 0) {
  setFilter('/')
}

function datetime(): string {
  return timestamp('YYYY-MM-DD HH:mm:ss.ms')
}

export function log(...args: any[]): void {
  if (config.logLevel !== 'log') {
    return
  }
  console.log(datetime(), '- LOG -', ...args)
}

export function warn(...args: any[]): void {
  if (config.logLevel === 'error') {
    return
  }
  console.warn(datetime(), '- WAR -', ...args)
}

export function error(...args: any[]): void {
  console.error(datetime(), '- ERR -', ...args)
}
