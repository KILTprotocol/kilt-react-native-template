import type { EncryptedMessageV1, EncryptedMessageV3, EncryptedMessageCallbackV1, EncryptedMessageCallbackV3, PubSubSessionV1 as IPubSubSessionV1, PubSubSessionV3 as IPubSubSessionV3 } from '../modules/credentialapi/types'

export class PubSubSessionV1 implements IPubSubSessionV1 {
  public encryptionKeyId: string
  public encryptedChallenge: string
  public nonce: string

  private listenCb?: (msg: EncryptedMessageV1) => Promise<void>
  private readonly messageBuffer: EncryptedMessageV1[] = []

  constructor (keyId: string, encryptedChallenge: string, nonce: string) {
    this.encryptionKeyId = keyId
    this.encryptedChallenge = encryptedChallenge
    this.nonce = nonce
  }

  listen: (callback: EncryptedMessageCallbackV1) => Promise<void> = async (callback) => {
    this.listenCb = async (msg: EncryptedMessageV1) => {
      await callback(msg)
    }
    while (this.messageBuffer.length > 0) {
      const msg = this.messageBuffer.shift()
      if (msg !== undefined) {
        await this.listenCb(msg)
      }
    }
  }

  /** send the encrypted message to the extension */
  send: EncryptedMessageCallbackV1 = async (msg) => {
    const resp = await window.kilt.nessie.request({
      module: 'credentialapi',
      method: 'processMessage',
      args: { version: '1', msg }
    })
    if (this.listenCb !== undefined) {
      await this.listenCb(resp)
    } else {
      this.messageBuffer.push(resp)
    }
  }

  /** close the session and stop receiving further messages */
  close: () => Promise<void> = async () => {
    this.listenCb = undefined
  }
}

export class PubSubSessionV3 implements IPubSubSessionV3 {
  public encryptionKeyUri: string
  public encryptedChallenge: string
  public nonce: string

  private listenCb?: (msg: EncryptedMessageV3) => Promise<void>
  private readonly messageBuffer: EncryptedMessageV3[] = []

  constructor (keyUri: string, encryptedChallenge: string, nonce: string) {
    this.encryptionKeyUri = keyUri
    this.encryptedChallenge = encryptedChallenge
    this.nonce = nonce
  }

  listen: (callback: EncryptedMessageCallbackV3) => Promise<void> = async (callback) => {
    this.listenCb = async (msg: EncryptedMessageV3) => {
      await callback(msg)
    }
    while (this.messageBuffer.length > 0) {
      const msg = this.messageBuffer.shift()
      if (msg !== undefined) {
        await this.listenCb(msg)
      }
    }
  }

  /** send the encrypted message to the extension */
  send: EncryptedMessageCallbackV3 = async (msg) => {
    const resp = await window.kilt.nessie.request({
      module: 'credentialapi',
      method: 'processMessage',
      args: { version: '3', msg }
    })
    if (this.listenCb !== undefined) {
      await this.listenCb(resp)
    } else {
      this.messageBuffer.push(resp)
    }
  }

  /** close the session and stop receiving further messages */
  close: () => Promise<void> = async () => {
    this.listenCb = undefined
  }
}
