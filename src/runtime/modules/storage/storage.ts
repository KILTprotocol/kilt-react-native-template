import type { Module, StorageApi, NessieRequest, NessieResponse, CoreApi } from '../../interfaces'
import * as SecureStore from 'expo-secure-store'
import * as RootNavigation from './../../../RootNavigation'
import * as KeyStore from 'react-native-keychain'

import { dummyEncryptData as encryptData, dummyDecryptData as decryptData } from './crypto'

class Storage<R extends CoreApi> implements StorageApi, Module {
  private readonly runtime: R
  private password?: string

  constructor(runtime: R, password?: string) {
    this.runtime = runtime
    this.password = password
  }

  async get(key: string): Promise<Uint8Array> {
    const result = await SecureStore.getItemAsync(key)
    if (result === undefined) {
      throw new Error(`Key '${key}' not found.`)
    }
    const decoded: Uint8Array = Buffer.from(result as string, 'hex')
    return await decryptData(decoded, await this.getPassword())
  }

  async set(key: string, value: Uint8Array): Promise<Uint8Array | null> {
    let old: Uint8Array | null = null
    try {
      old = await this.get(key)
    } catch (e) {}
    const encrypted = await encryptData(value, await this.getPassword())
    const encoded = Buffer.from(encrypted).toString('hex')
    await SecureStore.setItemAsync(key, encoded)
    return old
  }

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key)
  }

  async all(prefix?: string): Promise<Array<[string, Uint8Array]>> {
    const result = await SecureStore.getItemAsync('all')
    const decrypted: Array<[string, Uint8Array]> = []
    const pw = await this.getPassword()
    // for (const key in result) {
    //   if (!(typeof result[key] === 'string') || (prefix !== undefined && !key.startsWith(prefix))) {
    //     continue
    //   }
    //   try {
    //     const val: Uint8Array = Buffer.from(result[key], 'hex')
    //     console.log('storage.ts: all get candidate for decryption', key, val)
    //     try {
    //       const clear = await decryptData(val, pw)
    //       decrypted.push([key, clear])
    //     } catch (e) {
    //       console.error('storage::all decryption failed', e)
    //     }
    //   } catch (e) {
    //     console.error('storage.ts: all', e)
    //   }
    // }
    return decrypted
  }

  async processRPCRequest(req: NessieRequest): Promise<NessieResponse> {
    switch (req.method) {
      case 'set': {
        console.log('storage.ts: set', req.params)
        const key = (req.params as any)[0] as string
        const value = (req.params as any)[1] as string
        await this.set(key, Uint8Array.from(Buffer.from(value, 'utf8')))
        return { result: true }
      }
      case 'get': {
        console.log('storage.ts: get', req.params)
        if (typeof (req.params as any)[0] !== 'string') {
          throw new Error('Invalid arguments.')
        }
        const key = (req.params as any)[0] as string
        const value = await this.get(key)
        return { result: Buffer.from(value).toString('utf8') }
      }
      case 'remove': {
        console.log('storage.ts: remove', req.params)
        if (typeof (req.params as any)[0] !== 'string') {
          throw new Error('Invalid arguments.')
        }
        const key = (req.params as any)[0] as string
        await this.remove(key)
        return { result: true }
      }
      case 'all': {
        console.log('storage.ts: all', req.params)
        const result = await this.all()
        return { result: result.map(([key, value]) => [key, Buffer.from(value).toString('utf8')]) }
      }
      default:
        throw new Error('Invalid method.')
    }
  }

  async getPassword(): Promise<string> {
    // first look at the memory if it is cached
    if (this.password !== undefined) {
      return this.password
    }
    // now check session storage
    const password = await SecureStore.getItemAsync('password')
    if (password !== undefined) {
      this.password = password as string
      return this.password
    }
    // if not, open the popup to get the password
    RootNavigation.navigate('UnlockStorageScreen', {})
    // if (resp === undefined) {
    //   throw new Error('No password provided.')
    // }
    // this.password = (resp.result as { password: string }).password
    // SecureStore.setItemAsync('password', this.password).catch(console.error)
    // return password
    return 'no'
  }
}

export { Storage }
