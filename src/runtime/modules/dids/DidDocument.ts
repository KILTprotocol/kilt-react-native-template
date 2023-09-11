import { hexToU8a } from '@polkadot/util'
import { base58Decode, base58Encode, blake2AsHex } from '@polkadot/util-crypto'
import type { KeyInfo } from '../../interfaces'

interface IDidDocument {
  '@context': string[]
  id: string
  verificationMethod: IVerificationMethod[]
  authentication: string[]
  keyAgreement: string[]
  assertionMethod: string[]
  service: IService[]
  alsoKnownAs: string[]
}

interface IVerificationMethod {
  id: string
  controller: string
  type: string
  publicKeyBase58: string
}

interface IService {
  id: string
  type: string[]
  serviceEndpoint: string[]
}

class DidDocument implements IDidDocument {
  public '@context': string[]
  public id: string
  public verificationMethod: IVerificationMethod[]
  public authentication: string[]
  public keyAgreement: string[]
  public assertionMethod: string[]
  public service: IService[]
  public alsoKnownAs: string[]

  constructor (
    doc: IDidDocument | undefined
  ) {
    if (doc !== undefined) {
      this['@context'] = doc['@context']
      this.id = doc.id
      this.verificationMethod = doc.verificationMethod
      this.authentication = doc.authentication
      this.keyAgreement = doc.keyAgreement
      this.assertionMethod = doc.assertionMethod
      this.service = doc.service
      this.alsoKnownAs = doc.alsoKnownAs
    } else {
      this['@context'] = [
        'https://www.w3.org/ns/did/v1',
        'ipfs://QmU7QkuTCPz7NmD5bD7Z7mQVz2UsSPaEK58B5sYnjnPRNW'
      ]
      this.id = 'did'
      this.verificationMethod = []
      this.authentication = []
      this.keyAgreement = []
      this.assertionMethod = []
      this.alsoKnownAs = []
      this.service = []
    }
  }

  public getDid (): string {
    return this.id
  }

  public getAuthenticationKey (): Uint8Array {
    return this.getPublicKey(this.authentication[0])
  }

  public getKeyAgreementKey (): Uint8Array {
    return this.getPublicKey(this.keyAgreement[0])
  }

  public getAssertionMethodKey (): Uint8Array {
    return this.getPublicKey(this.assertionMethod[0])
  }

  public getPublicKey (keyId: string): Uint8Array {
    const key = this.verificationMethod.find((k) => k.id === keyId)
    if (key === undefined) {
      throw new Error(`key ${keyId} not found`)
    }
    return base58Decode(key.publicKeyBase58)
  }

  public addKey (key: KeyInfo, usage: string): void {
    let t = ''
    let keyId = ''
    switch (key.type) {
      case 'ed25519':
        t = 'Ed25519VerificationKey2020'
        keyId = blake2AsHex(Buffer.from([0, 0, ...hexToU8a(key.kid)]))
        break
      case 'sr25519':
        t = 'Sr25519VerificationKey2020'
        keyId = blake2AsHex(Buffer.from([0, 1, ...hexToU8a(key.kid)])) // @TODO ???
        break
      case 'ecdsa':
        t = 'EcdsaVerificationKey2020'
        keyId = blake2AsHex(Buffer.from([0, 2, ...hexToU8a(key.kid)]))
        break
      case 'x25519':
        t = 'X25519KeyAgreementKey2019'
        keyId = blake2AsHex(Buffer.from([1, 0, ...hexToU8a(key.kid)]))
        break
    }
    this.verificationMethod.push({
      id: `${this.id}#${keyId}`,
      controller: this.id,
      type: t,
      publicKeyBase58: base58Encode(hexToU8a(key.kid))
    })
    switch (usage) {
      case 'authentication':
        this.authentication.push(`${this.id}#${keyId}`)
        break
      case 'keyAgreement':
        this.keyAgreement.push(`${this.id}#${keyId}`)
        break
      case 'attestation':
        this.assertionMethod.push(`${this.id}#${keyId}`)
        break
    }
  }

  public removeKey (keyId: string): void {
    const key = this.verificationMethod.find((k) => k.id === keyId)
    if (key === undefined) {
      throw new Error(`key ${keyId} not found`)
    }
    this.verificationMethod = this.verificationMethod.filter((k) => k.id !== keyId)
    this.authentication = this.authentication.filter((k) => k !== keyId)
    this.keyAgreement = this.keyAgreement.filter((k) => k !== keyId)
    this.assertionMethod = this.assertionMethod.filter((k) => k !== keyId)
  }
}

export type {
  IDidDocument,
  IVerificationMethod,
  IService
}

export {
  DidDocument
}
