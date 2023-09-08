import * as Kilt from '@kiltprotocol/sdk-js'

import { getStorage, setStorage, allStorage, removeStorage } from '../storage'

const PREFIX = 'did:'

type DidKeys = {
  authentication: Kilt.KiltKeyringPair
  keyAgreement?: Kilt.KiltEncryptionKeypair
  assertionMethod?: Kilt.KiltKeyringPair
  capabilityDelegation?: Kilt.KiltKeyringPair
}

export async function saveDidMetadata(
  didUri: Kilt.DidUri,
  document: Kilt.DidDocument,
  password: string
): Promise<void> {
  await setStorage(didUri, JSON.stringify(document), password)
}

export async function loadDidMetadata(key: string, password: string): Promise<Kilt.DidDocument> {
  const document = await getStorage(key, password)
  if (document == null) {
    throw new Error("can't find address")
  }

  return JSON.parse(document)
}

export async function importDid(
  { authentication, keyAgreement, assertionMethod, capabilityDelegation }: DidKeys,
  didUri: Kilt.DidUri,
  password: string
): Promise<DidKeys> {
  const fullDid = await Kilt.Did.resolve(didUri)
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
  return allStorage(password, PREFIX)
}

export async function setDidKeypairs(didUri: string, keypairs: DidKeys, password: string) {
  await setStorage(PREFIX + didUri, JSON.stringify(keypairs), password)
}

export async function removeKeypair(key: string, password: string): Promise<void> {
  return removeStorage(PREFIX + key)
}

export async function list(
  password: string
): Promise<{ keypairs: DidKeys; document: Kilt.DidDocument }[]> {
  console.log('call DID::list')

  const keypairs = await getDidKeypairs(password)
  return Promise.all(
    keypairs.map(async ([didUri, keypairs]: [string, string]) => {
      const document = await loadDidMetadata(didUri, password)

      return {
        keypairs: JSON.parse(keypairs),
        document,
      }
    })
  )
}
