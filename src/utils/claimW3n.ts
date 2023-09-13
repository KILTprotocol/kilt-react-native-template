import {
  Blockchain,
  Did,
  DidUri,
  KiltKeyringPair,
  SignExtrinsicCallback,
  connect,
} from '@kiltprotocol/sdk-js'

export async function claimWeb3Name(
  did: DidUri,
  submitterAccount: KiltKeyringPair,
  name: Did.Web3Name,
  signCallback: SignExtrinsicCallback
): Promise<void> {
  const api = await connect('wss://peregrine.kilt.io/parachain-public-ws/')

  const web3NameClaimTx = api.tx.web3Names.claim(name)
  const authorizedWeb3NameClaimTx = await Did.authorizeTx(
    did,
    web3NameClaimTx,
    signCallback,
    submitterAccount.address
  )
  await Blockchain.signAndSubmitTx(authorizedWeb3NameClaimTx, submitterAccount)
  await api.disconnect()
}
