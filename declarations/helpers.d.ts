interface Indexed<T> {[key: string]: T}

type SimpleSet = Indexed<true>

type Resolved<T> = T extends PromiseLike<infer F> ? F : T
type ResolvedReturn<T> = T extends (...args: any[]) => PromiseLike<infer F> ? F
  : T extends (...args: any[]) => infer F2 ? F2
    : T

// eslint-disable-next-line @typescript-eslint/naming-convention
type nil = null|undefined

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/consistent-type-definitions
type EmptyObject = {}
