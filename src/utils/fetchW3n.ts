import { DidUri, connect, Did } from '@kiltprotocol/sdk-js'

export default async function getWeb3NameForDid(did: DidUri): Promise<string | undefined> {
  const api = await connect('wss://peregrine.kilt.io/parachain-public-ws/')

  const didChain = await api.call.did.query(Did.toChain(did))
  if (didChain.isNone) {
    return
  }
  const { web3Name } = Did.linkedInfoFromChain(didChain)
  await api.disconnect()
  return web3Name
}
