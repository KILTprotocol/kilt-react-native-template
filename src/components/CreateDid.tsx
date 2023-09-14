import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native'
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
import getBalance from '../utils/getBalance'
import { CommonActions } from '@react-navigation/native'
import { connect } from '@kiltprotocol/sdk-js'

export default function CreateDid({ navigation, route }) {
  const [didMnemonic, setDidMnemonic] = useState()
  const [account, setAccount] = useState<null | any>()
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<null | string>()

  const authContext = useContext(AuthContext)
  useEffect(() => {
    if (!route.params.selectAccount) return
    setAccount(route.params.selectAccount)
  }, [route.params])

  useEffect(() => {
    if (!account) return setBalance(null)
    ;(async () => {
      const addressBalance = await getBalance(account.metadata.address)

      setBalance(addressBalance)
    })()
  }, [account])

  const generateDid = async () => {
    setIsLoading(true)
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
    await connect('wss://peregrine.kilt.io/parachain-public-ws/')

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
      setIsLoading(false)
      return navigation.dispatch(CommonActions.goBack())
    }

    await DidStore.importDid(
      {
        authentication: didMnemonic || account.mnemonic,
        keyAgreement: didMnemonic || account.mnemonic,
      },
      didUri,
      password
    )

    setIsLoading(false)
    return navigation.dispatch(CommonActions.goBack())
  }
  return (
    <View style={styles.container}>
      <View style={{ ...styles.header, backgroundColor: 'rgba(249,105,67,0.2)' }}>
        <Text style={styles.headerText}>Add Identity</Text>
      </View>
      <View style={{ height: '50%' }}>
        <SelectAccount navigation={navigation} route={route} />
        <ActivityIndicator color="orange" animating={isLoading} />
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

        {!!balance ? (
          <Text numberOfLines={1} style={styles.rectangleButtonText}>
            Balance : {balance}
          </Text>
        ) : null}

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
            style={
              !account || isLoading
                ? { ...styles.orangeButton, ...styles.buttonDisabled }
                : styles.orangeButton
            }
            disabled={!account || isLoading}
            onPress={generateDid}
          >
            <Text style={styles.orangeButtonText}>ADD IDENTITY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
