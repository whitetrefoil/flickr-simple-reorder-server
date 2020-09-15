import 'koa'

declare module 'koa' {
  interface Context {
    validateRequire?: (fields: string[]) => void
    devMessage?: unknown
  }

  interface Request {
    mergedBody: unknown
  }
}
