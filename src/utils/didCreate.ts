import {
  KeyringPair,
  NewDidVerificationKey,
  NewDidEncryptionKey,
  Did,
  DidDocument,
  Blockchain,
  ConfigService,
} from '@kiltprotocol/sdk-js'

export default async function createSimpleFullDid(
  submitterAccount: KeyringPair,
  {
    authentication,
    keyAgreement,
  }: {
    authentication: NewDidVerificationKey
    keyAgreement: NewDidEncryptionKey
  },
  signCallback: Did.GetStoreTxSignCallback
): Promise<DidDocument> {
  const api = ConfigService.get('api')
  const fullDidCreationTx = await Did.getStoreTx(
    {
      authentication: [authentication],
      keyAgreement: [keyAgreement],
    },
    submitterAccount.address as `4${string}`,
    signCallback
  )

  await Blockchain.signAndSubmitTx(fullDidCreationTx, submitterAccount)

  const fullDid = Did.getFullDidUriFromKey(authentication)

  const encodedUpdatedDidDetails = await api.call.did.query(Did.toChain(fullDid))
  return Did.linkedInfoFromChain(encodedUpdatedDidDetails).document
}
