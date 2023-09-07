import AsyncStorage from '@react-native-async-storage/async-storage'
import { decryptData, encryptData } from '../utils/crypto'

export async function getStorage(key: string, password: string): Promise<string> {
  const encodedResult = await AsyncStorage.getItem(key)
  if (encodedResult === undefined || encodedResult === null) {
    throw new Error(`Key '${key}' not found.`)
  }
  const decryptedData = decryptData(encodedResult, password)
  return decryptedData
}

export async function setStorage(key: string, value: string, password: string): Promise<void> {
  const encrypted = encryptData(value, password)
  await AsyncStorage.setItem(key, JSON.stringify(encrypted))
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
