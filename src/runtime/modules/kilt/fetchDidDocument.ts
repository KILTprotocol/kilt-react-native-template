import type { DidDidDetails } from '@kiltprotocol/augment-api'
import { type ApiPromise } from '@polkadot/api'
import { base58Encode } from '@polkadot/util-crypto'
import { DidDocument } from '../dids/DidDocument'

async function fetchDidDocument (api: ApiPromise, did: string): Promise<DidDocument> {
  try {
    let didAccountId = did
    if (did.startsWith('did:kilt:')) {
      didAccountId = did.substring('did:kilt:'.length)
    }
    if (didAccountId.indexOf('#') !== undefined) {
      didAccountId = didAccountId.split('#')[0]
    }
    const resp = await api.query.did.did(didAccountId)
    if (resp.isNone) {
      throw new Error('DID does not exist')
    }
    const details: DidDidDetails = resp.unwrap()
    const textDecoder = new TextDecoder()
    const services = (await api.query.did.serviceEndpoints.entries(didAccountId)).map(([,service]) => {
      const s = service.unwrap()
      return {
        id: textDecoder.decode(s.id),
        type: s.serviceTypes.map((e) => textDecoder.decode(e)),
        serviceEndpoint: s.urls.map((e) => textDecoder.decode(e))
      }
    })
    const w3nResult = await api.query.web3Names.names(didAccountId)
    let w3n = ''
    if (w3nResult.isSome) {
      w3n = textDecoder.decode(w3nResult.unwrap())
    }
    const doc = new DidDocument({
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'ipfs://QmU7QkuTCPz7NmD5bD7Z7mQVz2UsSPaEK58B5sYnjnPRNW'
      ],
      id: did,
      verificationMethod: [...details.publicKeys].map(([id, details]) => {
        let t = ''
        let encodedPubkey = ''
        if (details.key.isPublicVerificationKey) {
          if (details.key.asPublicVerificationKey.isSr25519) {
            t = 'Sr25519VerificationKey2020'
            encodedPubkey = base58Encode(details.key.asPublicVerificationKey.asSr25519)
          } else if (details.key.asPublicVerificationKey.isEd25519) {
            t = 'Ed25519VerificationKey2020'
            encodedPubkey = base58Encode(details.key.asPublicVerificationKey.asEd25519)
          } else if (details.key.asPublicVerificationKey.isEcdsa) {
            t = 'EcdsaVerificationKey2020'
            encodedPubkey = base58Encode(details.key.asPublicVerificationKey.asEcdsa)
          }
        } else {
          t = 'X25519KeyAgreementKey2019'
          encodedPubkey = base58Encode(details.key.asPublicEncryptionKey.asX25519)
        }
        return {
          id: `${did}#${id.toHex()}`,
          controller: did,
          type: t,
          publicKeyBase58: encodedPubkey
        }
      }),
      authentication: [details.authenticationKey.toHex()],
      keyAgreement: [...details.keyAgreementKeys].map((e) => e.toHex()),
      assertionMethod: [details.attestationKey.toHex()],
      alsoKnownAs: [w3n],
      service: services
    })
    return doc
  } catch (error: unknown) {
    console.error(error)
    throw new Error('Failed to retrieve DID document')
  }
}

export { fetchDidDocument }
