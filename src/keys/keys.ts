import type { KeypairType } from '@polkadot/util-crypto/types'
import * as Kilt from '@kiltprotocol/sdk-js'

import { mnemonicGenerate } from '@polkadot/util-crypto'

import { box, box_open, randomBytes } from 'tweetnacl-ts'

import { type KeyringPair } from '@polkadot/keyring/types'

import { getStorage, setStorage, allStorage, removeStorage } from '../storage/storage'
import generateName from '../utils/generateName'
import kid from '../utils/kid'
import u8a from '../utils/u8a'
import { KeyInfo, KeyMetadata } from '../utils/interfaces'
const PREFIX = 'keys:'

export async function saveMetadata(
  pair: KeyringPair,
  metadata: KeyMetadata,
  password: string
): Promise<void> {
  await setStorage(pair.address, JSON.stringify({ metadata }), password)
}

export async function loadMetadata(key: string, password: string): Promise<KeyMetadata> {
  const keyMetadata = await getStorage(key, password)
  if (keyMetadata == null) {
    throw new Error("can't find address")
  }

  const metadata = JSON.parse(Buffer.from(keyMetadata).toString())
  return metadata as KeyMetadata
}

// api functions
export function generateMnemonic(words: 12 | 15 | 18 | 21 | 24 = 12): string {
  return mnemonicGenerate(words)
}

export async function importKey(
  mnemonic: string,
  derivationPath = '',
  keyType: KeypairType | 'x25519' = 'ed25519',
  name = '',
  password: string
): Promise<KeyInfo> {
  if (mnemonic.length === 0) {
    mnemonic = generateMnemonic()
  }
  let keyTypeToGenerate = keyType
  if (keyType === 'x25519') {
    keyTypeToGenerate = 'ed25519'
  }
  const keyPair = new Kilt.Utils.Keyring().addFromUri(
    mnemonic + derivationPath,
    { keyType, name },
    keyTypeToGenerate as KeypairType
  )

  const meta: KeyMetadata = {
    name: name.length > 0 ? name : generateName(),
    address: keyPair.address,
    type: keyType,
    kid: kid(keyPair),
  }
  if (keyType === 'x25519') {
    const naclPair = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(u8a(mnemonic))
    meta.nacl = naclPair
    meta.kid = '0x' + Buffer.from(naclPair.publicKey).toString('hex')
  }
  await saveMetadata(keyPair, meta, password)
  await setKeypair(keyPair, password)
  return {
    kid: meta.kid,
    name: meta.name,
    type: meta.type,
  }
}

export async function getKeypairs(password: string): Promise<Array<[string, Kilt.KeyringPair]>> {
  return allStorage(password, PREFIX)
}

export async function setKeypair(keyPair: Kilt.KeyringPair, password: string) {
  await setStorage(PREFIX + keyPair.address, JSON.stringify(keyPair), password)
}

export async function removeKeypair(key: string, password: string): Promise<void> {
  return removeStorage(PREFIX + key)
}

export async function list(password: string): Promise<KeyInfo[]> {
  console.log('call keys::list')

  const keypairs = await getKeypairs(password)
  return Promise.all(
    keypairs.map(async ([key, keypair]: [string, Kilt.KeyringPair]) => {
      const metadata = await loadMetadata(key, password)

      return {
        keypair: keypair,
        metadata,
      }
    })
  )
}

async function sign(
  address: string,
  msg: Uint8Array,
  withType = false,
  password: string
): Promise<Uint8Array> {
  const [keypair] = await (await getKeypairs(password)).filter((pair) => kid(pair) === address)
  if (keypair === undefined) {
    throw new Error("can't find key")
  }

  const signature = keypair.sign(msg, { withType })

  return signature
}

export async function encrypt(
  address: string,
  receiverPubkey: Uint8Array,
  msg: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const [senderMeta] = await (await getKeypairs(password)).filter((pair) => kid(pair) === address)
  if (senderMeta.nacl === undefined) {
    throw new Error("can't find sender key")
  }

  // create nonce using tweetnacl-ts
  const nonce = randomBytes(24)

  // encrypt message using tweetnacl-ts
  const encrypted = box(
    msg,
    nonce,
    Uint8Array.from(receiverPubkey),
    Uint8Array.from(Object.values(senderMeta.nacl.secretKey))
  )

  // prepend nonce to encrypted message
  const encryptedWithNonce = new Uint8Array(Buffer.concat([nonce, encrypted]))

  return encryptedWithNonce
}

export async function decrypt(
  kid: string,
  senderPubkey: Uint8Array,
  msg: Uint8Array,
  password: string
): Promise<Uint8Array> {
  // load receiver key
  const [receiverMeta] = await (
    await getKeypairs(password)
  ).map((pair) => loadMetadata(pair, password).filter((meta) => meta.kid === kid))

  if (receiverMeta === undefined || receiverMeta.nacl === undefined) {
    throw new Error("can't find receiver key")
  }

  // extract nonce from encrypted message
  const nonce = Uint8Array.from(msg.slice(0, 24))

  // extract encrypted message from encrypted message
  const encryptedMsg = Uint8Array.from(msg.slice(24))

  // decrypt message using tweetnacl-ts
  const decrypted = box_open(
    encryptedMsg,
    nonce,
    senderPubkey,
    Uint8Array.from(Object.values(receiverMeta.nacl.secretKey))
  )

  if (decrypted == null) {
    throw new Error('decryption failed')
  }

  // return decrypted message as hex string
  return decrypted
}
