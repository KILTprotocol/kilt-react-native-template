export function wrapError (msg: string, err: unknown): Error {
  if (err instanceof Error) {
    return new Error(`${msg}: ${err.message}`)
  }
  if (typeof err === 'string') {
    return new Error(`${msg}: ${err}`)
  }
  return new Error(`${msg}: ${JSON.stringify(err)}`)
}
