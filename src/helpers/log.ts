/* eslint-disable no-console */

import { getLogger, setFilter } from '@whitetrefoil/debug-log'
import timestamp                from 'time-stamp'
import config                   from './config'

if (process.env.DEBUG == null || process.env.DEBUG.length === 0) {
  setFilter('/')
}

export const debug = getLogger

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
