import type { KeypairType } from '@polkadot/util-crypto/types'
import { KiltEncryptionKeypair, KiltKeyringPair } from '@kiltprotocol/sdk-js'
export interface KeyMetadata {
  name: string
  address: string
  type: KeypairType | 'x25519'
  kid: string
  nacl?: {
    publicKey: Uint8Array
    secretKey: Uint8Array
  }
}
export interface KeyInfo {
  mnemonic: string
  metadata: KeyMetadata
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

export type DidKeys = {
  authentication: string
  keyAgreement?: string
  assertionMethod?: string
  capabilityDelegation?: string
}
