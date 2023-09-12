import { TouchableOpacity, Text, View } from 'react-native'
import styles from '../styles/styles'
import React, { useContext, useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'
import * as DidStore from '../storage/did/store'
import * as keyStore from '../storage/keys/store'
import Keyring from '@polkadot/keyring'
import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import { getStorage } from '../storage/storage'
import createSimpleFullDid from '../utils/didCreate'
import SelectAccount from './SelectAccount'
import { AuthContext } from '../wrapper/AuthContextProvider'

export default function CreateDid({ navigation, route }) {
  const [didMnemonic, setDidMnemonic] = useState()
  const [account, setAccount] = useState<null | any>()
  const authContext = useContext(AuthContext)
  useEffect(() => {
    if (!route.params.selectAccount) return
    setAccount(route.params.selectAccount)
  }, [route.params])

  const generateDid = async () => {
    if (!account) return
    const keyring = new Keyring({
      type: account.metadata.type,
      ss58Format: 38,
    })
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }

    const paymentAccount = keyring.addFromMnemonic(account.mnemonic)
    console.log('hello')
    const authentication = Kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(didMnemonic || account.mnemonic),
      account.metadata.type
    )
    console.log('hello 1')

    const keyAgreement = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(didMnemonic || account.mnemonic)
    )

    console.log('hello 2')

    const didUri = Kilt.Did.getFullDidUriFromKey(authentication)
    console.log('hello 3')

    const fullDid = await Kilt.Did.resolve(didUri)
    console.log('hello 4')

    if (!fullDid?.document) {
      const didDoc = await createSimpleFullDid(
        paymentAccount,
        { authentication, keyAgreement },
        async ({ data }) => ({
          signature: authentication.sign(data),
          keyType: authentication.type,
        })
      )
      console.log('hello 5')

      await DidStore.importDid(
        {
          authentication: didMnemonic || account.mnemonic,
          keyAgreement: didMnemonic || account.mnemonic,
        },
        didDoc.uri,
        password
      )
    }
    console.log('hello 6')

    await DidStore.importDid(
      {
        authentication: didMnemonic || account.mnemonic,
        keyAgreement: didMnemonic || account.mnemonic,
      },
      didUri,
      password
    )
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create your DID</Text>

      {!account ? <SelectAccount navigation={navigation} route={route} /> : null}
      {/* 
      This would be more advanced usecases at the moment we will use the keygeneration bassed on what is available from sporran 
      {!didMnemonic ? (
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => setDidMnemonic(keyStore.generateMnemonic(12))}
        >
          <Text>Generate a Mnemonic for DID Key</Text>
        </TouchableOpacity>
      ) : null} */}

      <TouchableOpacity style={styles.orangeButton} onPress={generateDid}>
        <Text style={styles.orangeButtonText}>Generate Basic DID</Text>
      </TouchableOpacity>

      <View>
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => {
            setAccount(null)
            navigation.navigate('Identity')
          }}
        >
          <Text style={styles.orangeButtonText}>Head back to DID list</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
