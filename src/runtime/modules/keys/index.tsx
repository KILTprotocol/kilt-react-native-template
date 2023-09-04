import type { KeypairType } from '@polkadot/util-crypto/types'

import {
  mnemonicGenerate,
  keyFromPath,
  keyExtractPath,
  sr25519PairFromSeed,
  mnemonicToMiniSecret,
  blake2AsU8a,
} from '@polkadot/util-crypto'

import { box, box_open, randomBytes, box_keyPair_fromSecretKey } from 'tweetnacl-ts'

import { type KeyringPair } from '@polkadot/keyring/types'

import { Keyring } from '@polkadot/ui-keyring'

import {
  type StorageApiProvider,
  type Module,
  type KeysApi,
  type KeyInfo,
  type NessieRequest,
  type NessieResponse,
  type CoreApi,
  type ConsentCacheApiProvider,
  type ConsentCacheApi,
  type MasterKeyProvider,
} from '../../interfaces'

import { Keystore } from './store'
import generateName from '../../utils/generateName'
import kid from '../../utils/kid'
import { u8a } from '../../utils/u8a'

interface KeyMetadata {
  name: string
  address: string
  type: KeypairType | 'x25519'
  kid: string
  nacl?: {
    publicKey: Uint8Array
    secretKey: Uint8Array
  }
}

// this is what we need from the runtime
type RuntimeRequirements = CoreApi &
  StorageApiProvider &
  ConsentCacheApiProvider &
  MasterKeyProvider

export class KeysModule<R extends RuntimeRequirements> implements Module, KeysApi {
  private readonly runtime: R
  private readonly consentCache: ConsentCacheApi
  private readonly keyring: Keyring
  private isInitialized = false

  name = 'keys'
  displayName = 'Keys'

  constructor(runtime: R) {
    this.runtime = runtime
    this.keyring = new Keyring()
    this.consentCache = runtime.getConsentCacheApi()
  }

  private async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }
    try {
      const store = new Keystore(this.runtime.getStorage())
      this.keyring.loadAll({ store }) // runs async -.-
      await store.allWasCalled() // ugh, ugly. I put a promise in the constructor of the store that resolves when the first all() call is through.
      this.isInitialized = true
    } catch (e) {
      console.error(e)
    }
    console.log('keys::init ready')
  }

  async processRPCRequest(req: NessieRequest): Promise<NessieResponse> {
    switch (req.method) {
      case 'generateMnemonic':
        return { result: await this.generateMnemonic() }
      case 'import': {
        console.log('import index,', req)
        const typed = req as {
          params: {
            mnemonic: string
            derivationPath: string
            keyType: KeypairType | 'x25519'
            name: string
          }
        }
        const info = await this.import(
          typed.params.mnemonic,
          typed.params.derivationPath,
          typed.params.keyType,
          typed.params.name
        )
        console.log('I am the info', info)
        return { result: info }
      }
      case 'list': {
        const list = await this.list()
        return { result: list }
        // if (!(await this.consentCache.check('keys', 'list', req.name))) {
        //   const resp = await this.runtime.openPopup('keys-list-consent', {
        //     name: req.name,
        //     params: {
        //       keys: list,
        //     },
        //   })
        //   if (resp.meta !== undefined && resp.meta?.cacheSeconds > 0) {
        //     await this.consentCache.cache(
        //       'keys',
        //       'list',
        //       req.name,
        //       resp.meta.cacheSeconds,
        //       resp.result
        //     )
        //   }
        //   return { result: resp.result }
        // } else {
        //   const list = await this.consentCache.getContext('keys', 'list', req.name)
        //   if (list === undefined) {
        //     throw new Error('consent cache is empty')
        //   }
        //   return { result: list }
        // }
      }
      case 'sign': {
        const typed = req as {
          params: {
            kid: string
            msg: string
            withType?: boolean
          }
        }
        if (!(await this.consentCache.check('keys', 'sign', req.name))) {
          const resp = await this.runtime.openPopup('keys-sign-consent', {
            name: req.name,
            params: {
              kid: typed.params.kid,
              msg: typed.params.msg,
            },
          })
          if (resp.meta !== undefined && resp.meta?.cacheSeconds > 0) {
            await this.consentCache.cache('keys', 'sign', req.name, resp.meta.cacheSeconds)
          }
        }
        const sig = await this.sign(typed.params.kid, u8a(typed.params.msg), typed.params.withType)
        return { result: '0x' + Buffer.from(sig).toString('hex') }
      }
      case 'encrypt': {
        const typed = req as {
          params: {
            kid: string
            receiverPubkey: string
            msg: string
          }
        }
        if (!(await this.consentCache.check('keys', 'encrypt', req.name))) {
          const resp = await this.runtime.openPopup('keys-encrypt-consent', {
            name: req.name,
            params: {
              senderKid: typed.params.kid,
              receiverPubkey: typed.params.receiverPubkey,
              msg: typed.params.msg,
            },
          })
          if (resp.meta !== undefined && resp.meta?.cacheSeconds > 0) {
            await this.consentCache.cache('keys', 'encrypt', req.name, resp.meta.cacheSeconds)
          }
        }
        const data = await this.encrypt(
          typed.params.kid,
          u8a(typed.params.receiverPubkey),
          u8a(typed.params.msg)
        )
        return { result: data }
      }
      case 'decrypt': {
        const typed = req as {
          params: {
            kid: string
            senderPubkey: string
            msg: string
          }
        }
        if (!(await this.consentCache.check('keys', 'decrypt', req.name))) {
          const resp = await this.runtime.openPopup('keys-decrypt-consent', {
            name: req.name,
            params: {
              receiverKid: typed.params.kid,
              senderPubkey: typed.params.senderPubkey,
              msg: typed.params.msg,
            },
          })
          if (resp.meta !== undefined && resp.meta?.cacheSeconds > 0) {
            await this.consentCache.cache('keys', 'decrypt', req.name, resp.meta.cacheSeconds)
          }
        }
        const data = await this.decrypt(
          typed.params.kid,
          u8a(typed.params.senderPubkey),
          u8a(typed.params.msg)
        )
        return { result: data }
      }
      default:
        throw new Error('unknown method')
    }
  }

  saveMetadata(pair: KeyringPair, md: KeyMetadata): void {
    this.keyring.saveAddress(pair.address, { md })
  }

  loadMetadata(pair: KeyringPair): KeyMetadata {
    const addr = this.keyring.getAddress(pair.address, null)
    if (addr == null) {
      throw new Error("can't find address")
    }
    const { md } = addr.meta
    return md as KeyMetadata
  }

  // api functions
  async generateMnemonic(words: 12 | 15 | 18 | 21 | 24 = 12): Promise<string> {
    await this.init()
    return mnemonicGenerate(words)
  }

  async import(
    mnemonic: string,
    derivationPath = '',
    keyType: KeypairType | 'x25519' = 'sr25519',
    name = ''
  ): Promise<KeyInfo> {
    await this.init()
    if (mnemonic.length === 0) {
      mnemonic = await this.generateMnemonic()
    }
    let keyTypeToGenerate = keyType
    if (keyType === 'x25519') {
      keyTypeToGenerate = 'sr25519'
    }
    const { pair } = this.keyring.addUri(
      mnemonic + derivationPath,
      await this.runtime.getMasterKey(),
      { keyType, name },
      keyTypeToGenerate as KeypairType
    )

    const meta: KeyMetadata = {
      name: name.length > 0 ? name : generateName(),
      address: pair.address,
      type: keyType,
      kid: kid(pair),
    }
    if (keyType === 'x25519') {
      const seed = mnemonicToMiniSecret(mnemonic)
      const keypair = sr25519PairFromSeed(seed)
      const { path } = keyExtractPath(derivationPath)
      const { secretKey } = keyFromPath(keypair, path, 'sr25519')
      const naclPair = box_keyPair_fromSecretKey(blake2AsU8a(secretKey))
      meta.nacl = naclPair
      meta.kid = '0x' + Buffer.from(naclPair.publicKey).toString('hex')
    }
    this.saveMetadata(pair, meta)
    return {
      kid: meta.kid,
      name: meta.name,
      type: meta.type,
    }
  }

  async list(): Promise<KeyInfo[]> {
    await this.init()
    console.log('call keys::list')
    return this.keyring.getPairs().map((pair) => {
      const meta = this.loadMetadata(pair)
      console.log('keys::list got meta', meta)
      return {
        kid: meta.kid,
        name: meta.name,
        type: meta.type,
      }
    })
  }

  async remove(keyId: string): Promise<void> {
    await this.init()
    const [address] = this.keyring
      .getPairs()
      .map((pair) => {
        const meta = this.loadMetadata(pair)
        return { pair, meta }
      })
      .filter(({ meta }) => meta.kid === keyId)
      .map(({ pair }) => pair.address)
    if (address === undefined) {
      throw new Error("can't find key")
    }
    this.keyring.forgetAccount(address)
    this.keyring.forgetAddress(address)
  }

  async sign(keyId: string, msg: Uint8Array, withType = false): Promise<Uint8Array> {
    await this.init()
    const [pair] = this.keyring.getPairs().filter((pair) => kid(pair) === keyId)
    if (pair === undefined) {
      throw new Error("can't find key")
    }
    pair.unlock(await this.runtime.getMasterKey())
    const sig = pair.sign(msg, { withType })
    pair.lock()
    return sig
  }

  async encrypt(keyId: string, receiverPubkey: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
    await this.init()
    // load sender key
    const [senderMeta] = this.keyring
      .getPairs()
      .map((pair) => this.loadMetadata(pair))
      .filter((meta) => meta.kid === keyId)
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

  async decrypt(kid: string, senderPubkey: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
    await this.init()
    // load receiver key
    const [receiverMeta] = this.keyring
      .getPairs()
      .map((pair) => this.loadMetadata(pair))
      .filter((meta) => meta.kid === kid)
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
}
