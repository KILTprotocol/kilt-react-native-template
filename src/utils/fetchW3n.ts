import { DidUri, ConfigService, Did } from '@kiltprotocol/sdk-js'

export default async function getWeb3NameForDid(did: DidUri): Promise<string | undefined> {
  const api = ConfigService.get('api')
  const didChain = await api.call.did.query(Did.toChain(did))
  if (didChain.isNone) {
    return
  }
  const { web3Name } = Did.linkedInfoFromChain(didChain)
  return web3Name
}
