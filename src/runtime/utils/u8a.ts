export function u8a (arg: string | Uint8Array | Buffer): Uint8Array {
  if (typeof arg === 'string' && arg.startsWith('0x')) {
    return Buffer.from(arg.slice(2), 'hex')
  } else if (typeof arg === 'string') {
    return Buffer.from(arg)
  } else if (arg instanceof Buffer) {
    return Uint8Array.from(arg)
  } else if (arg instanceof Uint8Array) {
    return arg
  } else {
    throw new Error('Invalid type passed to u8a')
  }
}
