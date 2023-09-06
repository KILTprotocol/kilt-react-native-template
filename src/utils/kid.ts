import type { KeyringPair } from '@polkadot/keyring/types'

export default function kid(pair: KeyringPair): string {
  return '0x' + Buffer.from(pair.addressRaw).toString('hex')
}
