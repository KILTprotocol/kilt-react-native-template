import AsyncStorage from '@react-native-async-storage/async-storage'
import { decryptData, encryptData } from "./crypto"

export async function get(key: string): Promise<Uint8Array> {
    const result = await AsyncStorage.getItem(key)
    console.log('get result', result)
    if (result === undefined) {
      throw new Error(`Key '${key}' not found.`)
    }
    const decoded: Uint8Array = Buffer.from(result as string, 'hex')

    return await decryptData(decoded, await this.getPassword())
  }

  export async function set(key: string, value: Uint8Array): Promise<Uint8Array | null> {
    console.log('I am setting the value', key, value)
    let old: Uint8Array | null = null
    try {
      old = await this.get(key)
    } catch (e) {}

    const encrypted = await encryptData(value, await this.getPassword())
    const encoded = Buffer.from(encrypted).toString('hex')
    await AsyncStorage.setItem(key, encoded)
    return old
  }

  export async function remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
  }

  export async function all(prefix?: string, password: string): Promise<Array<[string, Uint8Array]>> {
    const keys = await AsyncStorage.getAllKeys()
    console.log('result,', keys)
    const decrypted: Array<[string, Uint8Array]> = []


    for (const key of result) {
      if (!(typeof result[key] === 'string') || (prefix !== undefined && !key.startsWith(prefix))) {
        continue
      }
      try {
        const val: Uint8Array = Buffer.from(result[key], 'hex')
        console.log('storage.ts: all get candidate for decryption', key, val)
        try {
          const clear = await decryptData(val, password)
          decrypted.push([key, clear])
        } catch (e) {
          console.error('storage::all decryption failed', e)
        }
      } catch (e) {
        console.error('storage.ts: all', e)
      }
    }
    return decrypted
  }