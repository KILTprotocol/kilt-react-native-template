import AsyncStorage from '@react-native-async-storage/async-storage'
import { decryptData, encryptData } from '../utils/crypto'

export async function getStorage(key: string, password?: string): Promise<string> {
  const encodedResult = await AsyncStorage.getItem(key)
  if (encodedResult === undefined || encodedResult === null) {
    throw new Error(`Key '${key}' not found.`)
  }
  if (password) {
    const decryptedData = decryptData(encodedResult, password)
    return decryptedData
  }
  return encodedResult
}

export async function setStorage(key: string, value: string, password?: string): Promise<void> {
  if (password) {
    const encrypted = encryptData(value, password)
    await AsyncStorage.setItem(key, JSON.stringify(encrypted))
    return
  }

  await AsyncStorage.setItem(key, value)
}

export async function removeStorage(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}

export async function allStorage(password: string, prefix?: string): Promise<Array<[string, any]>> {
  const keys = await AsyncStorage.getAllKeys()

  const decrypted: Array<[string, any]> = []
  await Promise.all(
    keys.map(async (key) => {
      if (prefix && key.startsWith(prefix)) {
        const storageEntry = await getStorage(key, password)
        if (storageEntry === undefined || storageEntry === null) {
          throw new Error(`Key '${key}' not found.`)
        }
        const keyTrimmed = key.substring(prefix.length)
        return decrypted.push([keyTrimmed, storageEntry])
      }
      if (!prefix) {
        const storageEntry = await getStorage(key, password)
        return decrypted.push([key, storageEntry])
      }
    })
  ).catch((e) => console.log(e))
  return decrypted
}
