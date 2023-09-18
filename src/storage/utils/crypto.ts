// based on https://github.com/bradyjoslin/webcrypto-example/blob/master/script.js

import CryptoES from 'crypto-es'

const JsonFormatter = {
  stringify: function (cipherParams) {
    // create json object with ciphertext
    const jsonObj = { ct: cipherParams.ciphertext.toString(CryptoES.enc.Base64) } // optionally add iv and salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString()
    }
    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString()
    }
    // stringify json object
    return JSON.stringify(jsonObj)
  },
  parse: function (jsonStr) {
    // parse json string
    const jsonObj = JSON.parse(jsonStr) // extract ciphertext from json object, and create cipher params object
    const cipherParams = CryptoES.lib.CipherParams.create({
      ciphertext: CryptoES.enc.Base64.parse(jsonObj.ct),
    }) // optionally extract iv and salt
    if (jsonObj.iv) {
      cipherParams.iv = CryptoES.enc.Hex.parse(jsonObj.iv)
    }
    if (jsonObj.s) {
      cipherParams.salt = CryptoES.enc.Hex.parse(jsonObj.s)
    }
    return cipherParams
  },
}

export function encryptData(secretData: string, password: string): string {
  const encodedData = CryptoES.enc.Utf8.parse(secretData)
  const cipher = CryptoES.AES.encrypt(encodedData, password, {
    format: JsonFormatter,
  })
  return JsonFormatter.stringify(cipher)
}

export function decryptData(encryptedData: string, password: string): string {
  const decryptedContent = CryptoES.AES.decrypt(JSON.parse(encryptedData), password, {
    format: JsonFormatter,
  })
  return decryptedContent.toString(CryptoES.enc.Utf8)
}
