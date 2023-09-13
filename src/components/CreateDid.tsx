import { TouchableOpacity, Text, View, ScrollView } from 'react-native'
import styles from '../styles/styles'
import React, { useContext, useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'
import * as DidStore from '../storage/did/store'

import Keyring from '@polkadot/keyring'
import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import { getStorage } from '../storage/storage'
import createSimpleFullDid from '../utils/didCreate'
import SelectAccount from './SelectAccount'
import { AuthContext } from '../wrapper/AuthContextProvider'

export default function CreateDid({ navigation, route }) {
  const [didMnemonic, setDidMnemonic] = useState()
  const [account, setAccount] = useState<null | any>()
  const [isLoading, setIsLoading] = useState(false)

  const authContext = useContext(AuthContext)
  useEffect(() => {
    console.log('handled', route.params.selectAccount)
    if (!route.params.selectAccount) return
    setAccount(route.params.selectAccount)
  }, [route.params])

  const generateDid = async () => {
    setIsLoading(true)
    if (!account) return
    try {
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

      const authentication = Kilt.Utils.Crypto.makeKeypairFromSeed(
        mnemonicToMiniSecret(didMnemonic || account.mnemonic),
        account.metadata.type
      )

      const keyAgreement = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
        mnemonicToMiniSecret(didMnemonic || account.mnemonic)
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
    } catch (e) {
      console.log(e)
      setIsLoading(false)
    }
    setIsLoading(false)
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>Select an Account to create your Identity</Text>

      <SelectAccount navigation={navigation} route={route} />
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.redButton}
          disabled={isLoading}
          onPress={() => {
            setAccount(null)
            navigation.navigate('Identity')
          }}
        >
          <Text style={styles.redButtonText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.orangeButton}
          disabled={!account || isLoading}
          onPress={generateDid}
        >
          <Text style={styles.orangeButtonText}>CONFIRM</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
