import { Did, DidDocument, DidUri } from '@kiltprotocol/sdk-js'
import { getStorage, setStorage, allStorage, removeStorage } from '../storage'
import { DidKeys } from '../../utils/interfaces'

const KEY_PREFIX = 'did:kilt:'
const DOCUMENT_PREFIX = 'document:'

export async function saveDidMetadata(
  didUri: DidUri,
  document: DidDocument,
  password: string
): Promise<void> {
  console.log('document', document)
  await setStorage(DOCUMENT_PREFIX + didUri, JSON.stringify(document), password)
}

export async function loadDidMetadata(key: string, password: string): Promise<DidDocument> {
  const document = await getStorage(DOCUMENT_PREFIX + key, password)
  console.log('document')
  if (document == null) {
    throw new Error("can't find address")
  }

  return JSON.parse(document)
}

export async function importDid(
  { authentication, keyAgreement, assertionMethod, capabilityDelegation }: DidKeys,
  didUri: DidUri,
  password: string
): Promise<DidKeys> {
  const fullDid = await Did.resolve(didUri)
  if (!fullDid) {
    throw new Error('No DID on chain, please issue a full DID.')
  } else if (!fullDid.document) {
    throw new Error('DID has been deleted and can no longer be used.')
  }

  await saveDidMetadata(didUri, fullDid.document, password)
  await setDidKeypairs(
    didUri,
    { authentication, keyAgreement, assertionMethod, capabilityDelegation },
    password
  )
  return { authentication, keyAgreement, assertionMethod, capabilityDelegation }
}

export async function getDidKeypairs(password: string): Promise<Array<[string, string]>> {
  return allStorage(password, KEY_PREFIX)
}

export async function setDidKeypairs(didUri: string, keypairs: DidKeys, password: string) {
  await setStorage(KEY_PREFIX + didUri, JSON.stringify(keypairs), password)
}

export async function removeKeypair(key: string, password: string): Promise<void> {
  return removeStorage(KEY_PREFIX + key)
}

export async function list(
  password: string
): Promise<{ keypairs: DidKeys; document: DidDocument }[]> {
  console.log('call DID::list')

  const didKeypairs = await getDidKeypairs(password)

  return Promise.all(
    didKeypairs.map(async ([didUri, keypairs]: [string, string]) => {
      const document = await loadDidMetadata(didUri, password)
      console.log('document', document)
      return {
        keypairs: JSON.parse(keypairs),
        document,
      }
    })
  )
}
