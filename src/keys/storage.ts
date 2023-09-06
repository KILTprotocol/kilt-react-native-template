import AsyncStorage from '@react-native-async-storage/async-storage'
import { decryptData, encryptData } from '../utils/crypto'

export async function get(key: string, password: string): Promise<Uint8Array> {
  const result = await AsyncStorage.getItem(key)
  console.log('get result', result)
  if (result === undefined) {
    throw new Error(`Key '${key}' not found.`)
  }
  const decoded: Uint8Array = Buffer.from(result as string, 'hex')

  return await decryptData(decoded, password)
}

export async function set(
  key: string,
  value: Uint8Array,
  password: string
): Promise<Uint8Array | null> {
  console.log('I am setting the value', key, value)
  let old: Uint8Array | null = null
  try {
    old = await get(key, password)
  } catch (e) {
    console.log('e', e)
  }

  const encrypted = await encryptData(value, password)
  const encoded = Buffer.from(encrypted).toString('hex')
  await AsyncStorage.setItem(key, encoded)
  return old
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}

export async function all(password: string): Promise<Array<[string, Uint8Array]>> {
  const keys = await AsyncStorage.getAllKeys()
  console.log('I am the keys from the all', keys)

  const decrypted: Array<[string, Uint8Array]> = []
  await Promise.all(
    keys.map(async (key) => {
      const storageEntry = await AsyncStorage.getItem(key)
      console.log('sotrage entry', storageEntry)
      if (!storageEntry) return [['', new Uint8Array()]]
      const val = Buffer.from(storageEntry)
      const clear = await decryptData(val, password)
      decrypted.push([key, clear])
      console.log('2', decrypted.length)
    })
  )
  console.log('1', decrypted.length)
  return decrypted
}
