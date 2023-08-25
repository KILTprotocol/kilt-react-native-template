import { type KeyringJson, type KeyringStore } from '@polkadot/ui-keyring/types'

import { type StorageApi } from '../../interfaces'

const PREFIX = 'keys-'

const enc = new TextEncoder()
const dec = new TextDecoder()

export class Keystore implements KeyringStore {
  private readonly storage: StorageApi
  private readonly allWasCalledPromise: Promise<void>
  private resolveAllWasCalled: () => void = () => {}

  constructor (storage: StorageApi) {
    this.storage = storage
    this.allWasCalledPromise = new Promise((resolve) => {
      this.resolveAllWasCalled = resolve
    })
  }

  async allWasCalled (): Promise<void> {
    await this.allWasCalledPromise
  }

  all (cb: (key: string, value: KeyringJson) => void): void {
    this.storage.all().then((values: Array<[string, Uint8Array]>) => {
      values.forEach(([key, value]: [string, Uint8Array]) => {
        if (key.startsWith(PREFIX)) {
          console.log('got key candidate', key, 'from storage', value, 'decoding...')
          const k = key.substring(PREFIX.length)
          const v = JSON.parse(dec.decode(value))
          cb(k, v)
        }
      })
      this.resolveAllWasCalled()
    }).catch((err: Error) => {
      console.error('error while getting all keys from storage', err)
    })
  }

  get (key: string, cb: (value: KeyringJson) => void): void {
    this.storage.get(PREFIX + key).then((value: Uint8Array) => {
      const res: KeyringJson = JSON.parse(dec.decode(value))
      cb(res)
    }).catch((err: Error) => {
      console.error('error while getting key', key, 'from storage', err)
    })
  }

  remove (key: string, cb?: () => void): void {
    this.storage.remove(PREFIX + key).then(() => {
      cb?.()
    }).catch((err: Error) => {
      console.error('error while removing key', key, 'from storage', err)
    })
  }

  set (key: string, value: KeyringJson, cb?: () => void): void {
    this.storage.set(PREFIX + key, enc.encode(JSON.stringify(value))).then(() => {
      cb?.()
    }).catch((err: Error) => {
      console.error('error while setting key', key, 'to storage', err)
    })
  }
}
