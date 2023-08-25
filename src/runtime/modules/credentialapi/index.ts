import { wrapError } from '../../utils/wrapError'
import type {
  ConsentCacheApi,
  ConsentCacheApiProvider,
  CoreApi,
  CredentialStoreApi,
  CredentialStoreApiProvider,
  DidApi,
  DidApiProvider,
  KeysApi,
  KeysApiProvider,
  KiltApi,
  KiltApiProvider,
  Module,
  NessieRequest,
  NessieResponse,
  StorageApi,
  StorageApiProvider,
} from '../../interfaces'

import type {
  EncryptedMessageV1,
  EncryptedMessageV3,
  Message,
  RequestCredentialMessage,
  StartSessionResultV1,
  StartSessionResultV3,
  SubmitTermsMessageV1,
  SubmitTermsMessageV3,
} from './types'

import {
  sr25519PairFromSeed,
  blake2AsU8a,
  encodeAddress,
  base58Encode,
} from '@polkadot/util-crypto'
import { box_keyPair_fromSecretKey, box, box_open } from 'tweetnacl-ts'
import cbor from 'cbor'
import { hexToU8a, u8aEq, u8aToHex, u8aToU8a } from '@polkadot/util'
import { CredentialBuilder } from './credential'
import type { DidDidDetails } from '@kiltprotocol/augment-api'
import { credentialStoreConsentView } from './CredentialStoreConsent'
import { didSelectViewContainer } from './DidSelectView'
import { credentialSelectView } from '../credentialstore/CredentialSelectView'
import { DidDocument } from '../dids/DidDocument'

type RuntimeRequirements = KiltApiProvider &
  KeysApiProvider &
  DidApiProvider &
  StorageApiProvider &
  CoreApi &
  ConsentCacheApiProvider &
  CredentialStoreApiProvider

interface SessionKey {
  dAppKeyUri: string
  dAppPublicKey: Uint8Array
  publicKey: Uint8Array
  secretKey: Uint8Array
}

class CredentialApiModule<R extends RuntimeRequirements> implements Module {
  private readonly keysApi: KeysApi
  private readonly didApi: DidApi
  private readonly storage: StorageApi
  private readonly consentCache: ConsentCacheApi
  private readonly coreApi: CoreApi
  private readonly kiltApi: KiltApi
  private readonly credentialStore: CredentialStoreApi

  private readonly sessionKeys: Map<string, SessionKey> = new Map<string, SessionKey>()

  public constructor(runtime: R) {
    this.keysApi = runtime.getKeysApi()
    this.didApi = runtime.getDidApi()
    this.storage = runtime.getStorage()
    this.consentCache = runtime.getConsentCacheApi()
    this.kiltApi = runtime.getKiltApi()
    this.credentialStore = runtime.getCredentialStoreApi()
    this.coreApi = runtime
  }

  public async processRPCRequest(req: NessieRequest): Promise<NessieResponse> {
    console.log('CredentialApiModule.processRPCRequest:', req)
    switch (req.method) {
      case 'startSession': {
        try {
          const { dAppName, dAppEncryptionKeyUri, challenge, version } = req.args as {
            dAppName: string
            dAppEncryptionKeyUri: string
            challenge: string
            version: string
          }
          if (version.startsWith('1')) {
            const result = await this.startSessionV1(dAppName, dAppEncryptionKeyUri, challenge)
            return { result }
          } else {
            const result = await this.startSessionV3(dAppName, dAppEncryptionKeyUri, challenge)
            return { result }
          }
        } catch (error) {
          throw wrapError('failed to start session', error)
        }
      }
      case 'processMessage': {
        try {
          const obj = req.args as {
            msg: EncryptedMessageV1 | EncryptedMessageV3
            version: string
          }
          if (obj.version.startsWith('1')) {
            const result = await this.processMessageV1(obj.msg as EncryptedMessageV1)
            return { result }
          } else {
            const result = await this.processMessageV3(obj.msg as EncryptedMessageV3)
            return { result }
          }
        } catch (error) {
          throw wrapError('failed to process credential api message', error)
        }
      }
      default:
        throw new Error('Method not implemented.')
    }
  }

  private async startSessionV1(
    dAppName: string,
    dAppEncryptionKeyUri: string,
    challenge: string
  ): Promise<StartSessionResultV1> {
    console.log('CredentialApiModule.startSessionV1:', dAppName, dAppEncryptionKeyUri, challenge)
    const { keyUri, secretKey, publicKey } = await this.createEncryptionKey()
    const dAppDidDoc = await this.kiltApi.getDidDocument(dAppEncryptionKeyUri)
    console.log([...dAppDidDoc.keyAgreementKeys.values()])
    const encryptionKeyId = [...dAppDidDoc.keyAgreementKeys.values()][0]
    const dAppEncryptionKey = [...dAppDidDoc.publicKeys.entries()].find(([key]) =>
      u8aEq(key, encryptionKeyId)
    )
    if (dAppEncryptionKey === undefined) throw new Error('dAppEncryptionKey is undefined')

    const sessionKey: SessionKey = {
      dAppKeyUri: dAppEncryptionKeyUri,
      dAppPublicKey: dAppEncryptionKey[1].key.asPublicEncryptionKey.asX25519,
      publicKey,
      secretKey,
    }
    this.sessionKeys.set(dAppEncryptionKeyUri, sessionKey)
    console.log('sessionKeys after set:', this.sessionKeys)
    const nonce = crypto.getRandomValues(new Uint8Array(24))
    const challengeBytes = u8aToU8a(challenge)
    const encryptedChallenge = box(challengeBytes, nonce, sessionKey.dAppPublicKey, secretKey)
    return {
      encryptionKeyId: keyUri,
      encryptedChallenge: u8aToHex(encryptedChallenge),
      nonce: u8aToHex(nonce),
    }
  }

  private async startSessionV3(
    dAppName: string,
    dAppEncryptionKeyUri: string,
    challenge: string
  ): Promise<StartSessionResultV3> {
    console.log('CredentialApiModule.startSessionV1:', dAppName, dAppEncryptionKeyUri, challenge)
    const { keyUri, secretKey, publicKey } = await this.createEncryptionKey()
    const dAppDidDoc = await this.kiltApi.getDidDocument(dAppEncryptionKeyUri)
    console.log([...dAppDidDoc.keyAgreementKeys.values()])
    const encryptionKeyId = [...dAppDidDoc.keyAgreementKeys.values()][0]
    const dAppEncryptionKey = [...dAppDidDoc.publicKeys.entries()].find(([key]) =>
      u8aEq(key, encryptionKeyId)
    )
    if (dAppEncryptionKey === undefined) throw new Error('dAppEncryptionKey is undefined')

    const sessionKey: SessionKey = {
      dAppKeyUri: dAppEncryptionKeyUri,
      dAppPublicKey: dAppEncryptionKey[1].key.asPublicEncryptionKey.asX25519,
      publicKey,
      secretKey,
    }
    this.sessionKeys.set(dAppEncryptionKeyUri, sessionKey)

    const nonce = crypto.getRandomValues(new Uint8Array(24))
    const challengeBytes = u8aToU8a(challenge)
    const encryptedChallenge = box(challengeBytes, nonce, sessionKey.dAppPublicKey, secretKey)
    return {
      encryptionKeyUri: keyUri,
      encryptedChallenge: u8aToHex(encryptedChallenge),
      nonce: u8aToHex(nonce),
    }
  }

  private async processMessageV1(msg: EncryptedMessageV1): Promise<EncryptedMessageV1> {
    console.log('sessionKeys:', this.sessionKeys)
    console.log('senderKeyId:', msg.senderKeyId)
    const sessionKey = this.sessionKeys.get(msg.senderKeyId)
    if (sessionKey === undefined) {
      throw new Error('no session key found')
    }
    const decrypted = box_open(
      hexToU8a(msg.ciphertext),
      hexToU8a(msg.nonce),
      sessionKey.dAppPublicKey,
      sessionKey.secretKey
    )
    const msgObject: Message = JSON.parse(new TextDecoder().decode(decrypted))
    let responseMessage: Message | undefined
    switch (msgObject.body.type) {
      case 'submit-terms': {
        responseMessage = await this.processSubmitTermsMessageV1(
          msgObject,
          sessionKey.dAppPublicKey
        )
        // response is a request-attestation message that needs to be encrypted by the claimer
        const senderDidDoc: DidDidDetails = await this.kiltApi.getDidDocument(
          responseMessage.sender
        )
        console.log('our did doc:', senderDidDoc)
        const encryptionKeyId = [...senderDidDoc.keyAgreementKeys.values()][0]
        console.log('encryptionKeyId:', encryptionKeyId)
        const localKid = [...senderDidDoc.publicKeys.entries()].find(([key]) =>
          u8aEq(key, encryptionKeyId)
        )
        console.log('localKid:', localKid)
        if (localKid === undefined) throw new Error('localKid is undefined')
        const kid = u8aToHex(localKid[1].key.asPublicEncryptionKey.asX25519)
        const data = new TextEncoder().encode(JSON.stringify(responseMessage))
        const encryptedWithNonce = await this.keysApi.encrypt(kid, sessionKey.dAppPublicKey, data)
        const nonce = encryptedWithNonce.slice(0, 24)
        const ciphertext = encryptedWithNonce.slice(24)
        return {
          receiverKeyId: msg.senderKeyId,
          senderKeyId: `${responseMessage.sender}#${u8aToHex(encryptionKeyId)}`,
          ciphertext: u8aToHex(ciphertext),
          nonce: u8aToHex(nonce),
        }
      }
      case 'request-credential': {
        responseMessage = await this.processRequestCredentialMessageV1(
          msgObject,
          sessionKey.dAppPublicKey
        )
        const senderDidDoc: DidDidDetails = await this.kiltApi.getDidDocument(
          responseMessage.sender
        )
        const encryptionKeyId = [...senderDidDoc.keyAgreementKeys.values()][0]
        const localKid = [...senderDidDoc.publicKeys.entries()].find(([key]) =>
          u8aEq(key, encryptionKeyId)
        )
        if (localKid === undefined) throw new Error('localKid is undefined')
        const kid = u8aToHex(localKid[1].key.asPublicEncryptionKey.asX25519)
        const data = new TextEncoder().encode(JSON.stringify(responseMessage))
        const encryptedWithNonce = await this.keysApi.encrypt(kid, sessionKey.dAppPublicKey, data)
        const nonce = encryptedWithNonce.slice(0, 24)
        const ciphertext = encryptedWithNonce.slice(24)
        return {
          receiverKeyId: msg.senderKeyId,
          senderKeyId: `${responseMessage.sender}#${u8aToHex(encryptionKeyId)}`,
          ciphertext: u8aToHex(ciphertext),
          nonce: u8aToHex(nonce),
        }
      }
      default: {
        throw new Error('unknown message type ' + msgObject.body.type)
      }
    }
  }

  private async processMessageV3(msg: EncryptedMessageV3): Promise<EncryptedMessageV3> {
    const sessionKey = this.sessionKeys.get(msg.senderKeyUri)
    if (sessionKey === undefined) {
      throw new Error('no session key found')
    }
    const decrypted = box_open(
      hexToU8a(msg.ciphertext),
      hexToU8a(msg.nonce),
      sessionKey.dAppPublicKey,
      sessionKey.secretKey
    )
    const msgObject: Message = JSON.parse(new TextDecoder().decode(decrypted))
    let responseMessage: Message | undefined
    switch (msgObject.body.type) {
      case 'submit-terms': {
        responseMessage = await this.processSubmitTermsMessageV3(
          msgObject,
          sessionKey.dAppPublicKey
        )
        // response is a request-attestation message that needs to be encrypted by the claimer
        const senderDidDoc: DidDidDetails = await this.kiltApi.getDidDocument(
          responseMessage.sender
        )
        console.log('our did doc:', senderDidDoc)
        const encryptionKeyUri = [...senderDidDoc.keyAgreementKeys.values()][0]
        console.log('encryptionKeyUri:', encryptionKeyUri)
        const localKid = [...senderDidDoc.publicKeys.entries()].find(([key]) =>
          u8aEq(key, encryptionKeyUri)
        )
        console.log('localKid:', localKid)
        if (localKid === undefined) throw new Error('localKid is undefined')
        const kid = u8aToHex(localKid[1].key.asPublicEncryptionKey.asX25519)
        const data = new TextEncoder().encode(JSON.stringify(responseMessage))
        const encryptedWithNonce = await this.keysApi.encrypt(kid, sessionKey.dAppPublicKey, data)
        const nonce = encryptedWithNonce.slice(0, 24)
        const ciphertext = encryptedWithNonce.slice(24)
        return {
          receiverKeyUri: msg.senderKeyUri,
          senderKeyUri: `${responseMessage.sender}#${u8aToHex(encryptionKeyUri)}`,
          ciphertext: u8aToHex(ciphertext),
          nonce: u8aToHex(nonce),
        }
      }
      case 'request-credential': {
        responseMessage = await this.processRequestCredentialMessageV3(
          msgObject,
          sessionKey.dAppPublicKey
        )
        const senderDidDoc: DidDidDetails = await this.kiltApi.getDidDocument(
          responseMessage.sender
        )
        const encryptionKeyId = [...senderDidDoc.keyAgreementKeys.values()][0]
        const localKid = [...senderDidDoc.publicKeys.entries()].find(([key]) =>
          u8aEq(key, encryptionKeyId)
        )
        if (localKid === undefined) throw new Error('localKid is undefined')
        const kid = u8aToHex(localKid[1].key.asPublicEncryptionKey.asX25519)
        const data = new TextEncoder().encode(JSON.stringify(responseMessage))
        const encryptedWithNonce = await this.keysApi.encrypt(kid, sessionKey.dAppPublicKey, data)
        const nonce = encryptedWithNonce.slice(0, 24)
        const ciphertext = encryptedWithNonce.slice(24)
        return {
          receiverKeyUri: msg.senderKeyUri,
          senderKeyUri: `${responseMessage.sender}#${u8aToHex(encryptionKeyId)}`,
          ciphertext: u8aToHex(ciphertext),
          nonce: u8aToHex(nonce),
        }
      }
      default: {
        throw new Error('unknown message type ' + msgObject.body.type)
      }
    }
  }

  private async createEncryptionKey(): Promise<{
    keyUri: string
    secretKey: Uint8Array
    publicKey: Uint8Array
  }> {
    const seed = crypto.getRandomValues(new Uint8Array(32))
    const keypair = sr25519PairFromSeed(seed)
    const naclPair = box_keyPair_fromSecretKey(blake2AsU8a(keypair.secretKey))
    const authAddress = encodeAddress(keypair.publicKey, 38)
    const objectToSerialize = {
      e: {
        publicKey: naclPair.publicKey,
        type: 'x25519',
      },
    }
    const cborEncoded = cbor.encode(objectToSerialize)
    const serializationVersion = 0x0
    const details = base58Encode([serializationVersion, ...cborEncoded], true)
    const keyUri = `did:kilt:light:00${authAddress}:${details}#encryption`
    return {
      keyUri,
      secretKey: naclPair.secretKey,
      publicKey: naclPair.publicKey,
    }
  }

  private async processSubmitTermsMessageV1(
    msg: Message,
    dAppPublicKey: Uint8Array
  ): Promise<Message> {
    console.log('processSubmitTermsMessage', msg)
    const submitTerms: SubmitTermsMessageV1 = msg.body.content as SubmitTermsMessageV1
    console.log('submit-terms:', submitTerms)
    const dids = await this.didApi.list()
    const result = await this.coreApi.openPopup(didSelectViewContainer.id, {
      origin: msg.sender,
      args: dids,
    })
    const did = result.result as string
    const credential = new CredentialBuilder()
      .withCTypeHash(submitTerms.claim.cTypeId)
      .withSubject(did)
      .withClaimContents(submitTerms.claim.contents)
      .withAttester(msg.sender.split('#')[0])
      .withCType(submitTerms.cTypes[0])
      .toKiltCredential()

    // ask user for consent
    await this.coreApi.openPopup(credentialStoreConsentView.id, {
      origin: msg.sender,
      args: credential,
    })

    // write credential to disk
    await this.credentialStore.store(credential)

    const requestAttestationMessage: Message = {
      body: {
        type: 'request-attestation',
        content: { credential },
      },
      sender: did,
      receiver: msg.sender,
      messageId: u8aToHex(crypto.getRandomValues(new Uint8Array(32))),
      inReplyTo: msg.messageId,
      createdAt: Date.now(),
    }

    return requestAttestationMessage
  }

  private async processSubmitTermsMessageV3(
    msg: Message,
    dAppPublicKey: Uint8Array
  ): Promise<Message> {
    console.log('processSubmitTermsMessageV3', msg)
    const submitTerms: SubmitTermsMessageV3 = msg.body.content as SubmitTermsMessageV3
    console.log('submit-terms:', submitTerms)
    const dids = await this.didApi.list()
    const result = await this.coreApi.openPopup(didSelectViewContainer.id, {
      origin: msg.sender,
      args: dids,
    })
    const did = result.result as string
    const credential = new CredentialBuilder()
      .withCTypeHash(submitTerms.claim.cTypeHash)
      .withSubject(did)
      .withClaimContents(submitTerms.claim.contents)
      .withAttester(msg.sender.split('#')[0])
      .withCType(submitTerms.cTypes[0])
      .toKiltCredential()

    // ask user for consent
    await this.coreApi.openPopup(credentialStoreConsentView.id, {
      origin: msg.sender,
      args: credential,
    })

    // write credential to disk
    await this.credentialStore.store(credential)

    const requestAttestationMessage: Message = {
      body: {
        type: 'request-attestation',
        content: { credential },
      },
      sender: did,
      receiver: msg.sender,
      messageId: u8aToHex(crypto.getRandomValues(new Uint8Array(32))),
      inReplyTo: msg.messageId,
      createdAt: Date.now(),
    }

    return requestAttestationMessage
  }

  private async processRequestCredentialMessageV1(
    msg: Message,
    dAppPublicKey: Uint8Array
  ): Promise<Message> {
    console.log('processRequestCredentialMessageV1', msg)
    const requestCredential: RequestCredentialMessage = msg.body.content as RequestCredentialMessage
    console.log('request-credential:', requestCredential)
    const dids = await this.didApi.list()
    const credentials = await this.credentialStore.list()
    const filteredCredentials = credentials.filter((c) =>
      requestCredential.cTypes.map((t) => t.cTypeHash).includes(c.claim.cTypeHash)
    )
    const credentialSelectResult = await this.coreApi.openPopup(credentialSelectView.id, {
      origin: msg.sender,
      args: filteredCredentials,
    })
    const selectedCredential = credentials.find((c) => c.rootHash === credentialSelectResult.result)
    if (selectedCredential === undefined) throw new Error('selectedCredential is undefined')

    const signatureData = new Uint8Array([
      ...hexToU8a(selectedCredential.rootHash),
      ...hexToU8a(requestCredential.challenge),
    ])

    const doc = new DidDocument(dids.find((d) => d.id === selectedCredential.claim.owner))
    const kid = u8aToHex(doc.getAuthenticationKey())
    if (kid === undefined) throw new Error('kid is undefined')
    const signature = await this.keysApi.sign(kid, signatureData, false) // only false in V1 to support moonsama!

    const keyId = doc.authentication[0]

    const credentialMessage: Message = {
      body: {
        type: 'submit-credential',
        content: {
          credential: {
            ...selectedCredential,
            claimerSignature: {
              keyUri: keyId,
              signature: u8aToHex(signature),
              challenge: requestCredential.challenge,
            },
          },
        },
      },
      sender: selectedCredential.claim.owner,
      receiver: msg.sender,
      messageId: u8aToHex(crypto.getRandomValues(new Uint8Array(32))),
      inReplyTo: msg.messageId,
      references: [],
      createdAt: Date.now(),
    }

    console.log('submit-credential message v1:', credentialMessage)

    return credentialMessage
  }

  private async processRequestCredentialMessageV3(
    msg: Message,
    dAppPublicKey: Uint8Array
  ): Promise<Message> {
    console.log('processRequestCredentialMessage', msg)
    const requestCredential: RequestCredentialMessage = msg.body.content as RequestCredentialMessage
    console.log('request-credential:', requestCredential)
    const dids = await this.didApi.list()
    const credentials = await this.credentialStore.list()
    const filteredCredentials = credentials.filter((c) =>
      requestCredential.cTypes.map((t) => t.cTypeHash).includes(c.claim.cTypeHash)
    )
    const credentialSelectResult = await this.coreApi.openPopup(credentialSelectView.id, {
      origin: msg.sender,
      args: filteredCredentials,
    })
    const selectedCredential = credentials.find((c) => c.rootHash === credentialSelectResult.result)
    if (selectedCredential === undefined) throw new Error('selectedCredential is undefined')

    const signatureData = new Uint8Array([
      ...hexToU8a(selectedCredential.rootHash),
      ...hexToU8a(requestCredential.challenge),
    ])

    const doc = new DidDocument(dids.find((d) => d.id === selectedCredential.claim.owner))
    const kid = u8aToHex(doc.getAuthenticationKey())
    if (kid === undefined) throw new Error('kid is undefined')
    const signature = await this.keysApi.sign(kid, signatureData, true)

    const keyId = doc.authentication[0]

    const credentialMessage: Message = {
      body: {
        type: 'submit-credential',
        content: [
          {
            ...selectedCredential,
            claimerSignature: {
              keyUri: keyId,
              signature: u8aToHex(signature),
              challenge: requestCredential.challenge,
            },
          },
        ],
      },
      sender: selectedCredential.claim.owner,
      receiver: msg.sender,
      messageId: u8aToHex(crypto.getRandomValues(new Uint8Array(32))),
      inReplyTo: msg.messageId,
      references: [],
      createdAt: Date.now(),
    }

    return credentialMessage
  }
}

export { CredentialApiModule }
