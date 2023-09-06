// based on https://github.com/bradyjoslin/webcrypto-example/blob/master/script.js

const enc = new TextEncoder()

const getPasswordKey = async (password: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey'
  ])

const deriveKey = async (
  passwordKey: CryptoKey,
  salt: Uint8Array,
  keyUsage: KeyUsage[]
): Promise<CryptoKey> =>
  await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 250000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    keyUsage
  )

export async function dummyEncryptData (secretData: Uint8Array, password: string): Promise<Uint8Array> {
  return secretData
}

export async function encryptData (secretData: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const passwordKey = await getPasswordKey(password)
  const aesKey = await deriveKey(passwordKey, salt, ['encrypt'])
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    aesKey,
    secretData
  )

  const encryptedContentArr = new Uint8Array(encryptedContent)
  const buff = new Uint8Array(
    salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
  )
  buff.set(salt, 0)
  buff.set(iv, salt.byteLength)
  buff.set(encryptedContentArr, salt.byteLength + iv.byteLength)
  console.log('encrypted data')
  return buff
}

export async function dummyDecryptData (encryptedData: Uint8Array, password: string): Promise<Uint8Array> {
  return encryptedData
}

export async function decryptData (encryptedData: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = encryptedData.slice(0, 16)
  const iv = encryptedData.slice(16, 16 + 12)
  const data = encryptedData.slice(16 + 12)
  const passwordKey = await getPasswordKey(password)
  const aesKey = await deriveKey(passwordKey, salt, ['decrypt'])
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    aesKey,
    data
  )
  console.log('decrypted data')
  return new Uint8Array(decryptedContent)
}