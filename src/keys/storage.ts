import AsyncStorage from '@react-native-async-storage/async-storage'
import { decryptData, encryptData } from '../utils/crypto'

const decoder = new TextDecoder()
const encoder = new TextEncoder()

export async function getStorage(key: string, password: string): Promise<string> {
  const encodedResult = await AsyncStorage.getItem(key)

  console.log('encoded result,', key, encodedResult)

  if (encodedResult === undefined) {
    throw new Error(`Key '${key}' not found.`)
  }

  const decodedResult = Buffer.from(encodedResult as string, 'hex')
  console.log('decodedResult,', key, decodedResult)

  const decryptedData = await decryptData(decodedResult, password)
  const decoded = decoder.decode(decryptedData)
  console.log('decrypted', decoded)

  return decoded
}

export async function setStorage(key: string, value: any, password: string): Promise<void> {
  const encodedValue = encoder.encode(JSON.stringify(value))

  const encrypted = await encryptData(encodedValue, password)

  const encoded = Buffer.from(encrypted).toString('hex')

  await AsyncStorage.setItem(key, encoded)
}

export async function removeStorage(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}

export async function allStorage(password: string, prefix?: string): Promise<Array<[string, any]>> {
  const keys = await AsyncStorage.getAllKeys()
  console.log('I am the keys from the all', keys)

  const decrypted: Array<[string, string]> = []
  await Promise.all(
    keys.map(async (key) => {
      const storageEntry = await AsyncStorage.getItem(key)
      console.log('sotrage entry', storageEntry)
      if (!storageEntry) return console.log('no storage for the entry')
      if (prefix && storageEntry.startsWith(prefix)) {
        const storageEntryTrimmed = storageEntry.substring(prefix.length)
        const encodedStorageEntryTrimmed = Buffer.from(storageEntryTrimmed)
        const decryptedData = await decryptData(encodedStorageEntryTrimmed, password)
        decrypted.push([key, decryptedData])
      } else {
        const val = Buffer.from(storageEntry)
        const decryptedData = await decryptData(val, password)
        decrypted.push([key, decryptedData])
        console.log('2', decrypted.length)
      }
    })
  )
  console.log('1', decrypted.length)
  return decrypted
}
