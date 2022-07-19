export function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error && typeof (e as NodeJS.ErrnoException).code === 'string'
}
