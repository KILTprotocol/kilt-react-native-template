import type { KeypairType } from '@polkadot/util-crypto/types'

export interface KeyInfo {
  kid: string
  name: string
  type: KeypairType | 'x25519'
}

export interface KeysApi {
  generateMnemonic: (words: 12 | 15 | 18 | 21 | 24) => Promise<string>
  import: (
    mnemonic: string,
    derivationPath: string,
    keyType: KeypairType | 'x25519',
    name: string
  ) => Promise<KeyInfo>
  remove: (kid: string) => Promise<void>
  list: () => Promise<KeyInfo[]>
  sign: (kid: string, msg: Uint8Array, withType?: boolean) => Promise<Uint8Array>
  encrypt: (kid: string, receiverPubkey: Uint8Array, msg: Uint8Array) => Promise<Uint8Array>
  decrypt: (kid: string, senderPubKey: Uint8Array, msg: Uint8Array) => Promise<Uint8Array>
}
