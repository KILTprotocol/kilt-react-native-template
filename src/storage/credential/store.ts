import { Credential, ICredential } from '@kiltprotocol/sdk-js'
import { setStorage, allStorage, removeStorage } from '../storage'

const PREFIX = 'credential:'

export async function importCredential(
  credentialName: string,
  credential: ICredential,
  password: string
): Promise<void> {
  const verifiedCredential = Credential.isICredential(credential)
  if (!verifiedCredential) {
    throw new Error('Not a valid KILT Credential.')
  }
  await setCredential(credentialName, credential, password)
}

export async function getCredentials(password: string): Promise<Array<[string, string]>> {
  return allStorage(password, PREFIX)
}

export async function setCredential(
  credentialName: string,
  credential: ICredential,
  password: string
) {
  await setStorage(PREFIX + credentialName, JSON.stringify(credential), password)
}

export async function removeCredential(key: string): Promise<void> {
  return removeStorage(PREFIX + key)
}

export async function list(password: string): Promise<{ name: string; credential: ICredential }[]> {
  const credentials = await getCredentials(password)

  return Promise.all(
    credentials.map(async ([name, credential]: [string, string]) => {
      return {
        credential: JSON.parse(JSON.stringify(credential)),
        name,
      }
    })
  )
}
