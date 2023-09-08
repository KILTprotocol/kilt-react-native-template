import { TouchableOpacity, Text, View } from 'react-native'
import styles from '../styles/styles'
import React, { useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'
import * as DidStore from '../storage/did/store'
import * as keyStore from '../storage/keys/store'
import { KeyInfo } from '../utils/interfaces'
import Keyring from '@polkadot/keyring'
import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import { getStorage } from '../storage/storage'
import createSimpleFullDid from '../utils/didCreate'
import SelectAccount from './SelectAccount'

export default function CreateDid({ navigation, route }) {
  const [did, setDid] = useState()
  const [account, setAccount] = useState()

  useEffect(() => {
    if (!route.params?.selectAccount) return

    setAccount(route.params?.selectAccount)
  }, [route.params?.selectAccount])

  const generateDid = async () => {
    if (!did) return
    const api = Kilt.ConfigService.get('api')

    const keyring = new Keyring({
      type: did.metadata.metadata.type,
      ss58Format: 38,
    })

    const { mnemonic } = did

    if (!mnemonic || !account) return console.log('mnemonic', mnemonic)

    const paymentAccount = keyring.addFromMnemonic(account.mnemonic)

    const authentication = Kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic),
      did.metadata.type
    )

    const keyAgreement = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic)
    )
    const didUri = Kilt.Did.getFullDidUriFromKey(authentication)

    const fullDid = await Kilt.Did.resolve(didUri)

    if (!fullDid?.document) {
      const didDoc = await createSimpleFullDid(
        paymentAccount,
        { authentication, keyAgreement },
        async ({ data }) => ({
          signature: authentication.sign(data),
          keyType: authentication.type,
        })
      )
      await DidStore.importDid({ authentication, keyAgreement }, didDoc.uri, 'Enter your password')
      return console.log('Finished')
    }
    return console.log('did generated already fetch it instaed.')
  }
  return (
    <View>
      <Text style={styles.text}>Create your DID</Text>
      <SelectAccount navigation={navigation} route={route} />

      <TouchableOpacity style={styles.loginBtn} onPress={generateDid}>
        <Text>Generate Basic DID</Text>
      </TouchableOpacity>
    </View>
  )
}
