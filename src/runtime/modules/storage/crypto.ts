// based on https://github.com/bradyjoslin/webcrypto-example/blob/master/script.js

import { getRandomValues } from 'expo-crypto'
import cryptoEs from 'crypto-es'

const deriveKey = (password: string, salt: Uint8Array): cryptoEs.lib.WordArray => {
  return cryptoEs.PBKDF2(password, cryptoEs.lib.WordArray.create(salt))
}

export async function encryptData(secretData: Uint8Array, password: string): Promise<Uint8Array> {
  // const aesKey = deriveKey(password, salt)
  const { ciphertext, iv, salt } = cryptoEs.AES.encrypt(
    cryptoEs.lib.WordArray.create(secretData),
    password
  )
  // console.log(
  //   'this is the words against int arr',
  //   Int32Array.from(ciphertext!.words),
  //   ciphertext!.words
  // )

  const buff = new cryptoEs.lib.WordArray().concat(salt!).concat(iv!).concat(ciphertext!)
  const encryptedContentArr = new Uint8Array(Int32Array.from(buff!.words).buffer)

  return encryptedContentArr
}

export async function decryptData(
  encryptedData: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const salt = encryptedData.slice(0, 8)
  const iv = encryptedData.slice(8, 8 + 16)
  const data = encryptedData.slice(8 + 16)
  const decryptedContent = cryptoEs.AES.decrypt(
    {
      ciphertext: cryptoEs.lib.WordArray.create(data),
      iv: cryptoEs.lib.WordArray.create(iv),
      salt: cryptoEs.lib.WordArray.create(salt),
    },
    password
  )
  console.log('salt: ', salt)
  console.log('iv: ', iv)

  console.log('data: ', data)

  console.log('what am I?', decryptedContent)
  return new Uint8Array(Int32Array.from(decryptedContent.words).buffer)
}
