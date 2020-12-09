import type { DefaultState, Middleware } from 'koa'


export type IContext = {
  mergedBody: Dict
  validateRequire?: (fields: string[]) => void
  devMessage?: string

  assertRequired: <T>(field: string, assert: (val: unknown) => val is T) => T|never
  assertOptional: <T>(field: string, assert: (val: unknown) => val is T) => T|undefined|never
}

export type IMiddleware = Middleware<DefaultState, IContext>
