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
    if (!route.params?.selectAccount) return

    setAccount(route.params?.selectAccount)
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
    <View>
      <Text style={styles.text}>Create your DID</Text>
      {!account ? (
        <SelectAccount navigation={navigation} route={route} />
      ) : (
        <View>
          <TouchableOpacity style={styles.loginBtn} onPress={() => setAccount(null)}>
            <Text>Choose payment another account</Text>
          </TouchableOpacity>
        </View>
      )}
      {!didMnemonic ? (
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => setDidMnemonic(keyStore.generateMnemonic(12))}
        >
          <Text>Generate a Mnemonic for DID Key</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.loginBtn} onPress={generateDid}>
        <Text>Generate Basic DID</Text>
      </TouchableOpacity>

      <View>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {
            setAccount(null)
            navigation.navigate('Identity')
          }}
        >
          <Text>Head back to DID list</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
