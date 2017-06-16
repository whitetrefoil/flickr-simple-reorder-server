import * as Koa from 'koa'

declare module 'koa' {
  interface Context {
    validateRequire?: Function
    devMessage?: any
  }

  interface Request {
    mergedBody: any
  }
}
