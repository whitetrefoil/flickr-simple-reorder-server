/* eslint-disable no-console */

import { setFilter } from '@whitetrefoil/debug-log'
import { isEmpty } from 'lodash-es'
import { default as timestamp } from 'time-stamp'
import config from '../config.js'

if (isEmpty(process.env.DEBUG)) {
  setFilter('/')
}

export { getLogger } from '@whitetrefoil/debug-log'

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
