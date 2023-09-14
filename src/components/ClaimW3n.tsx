import { Utils, Did } from '@kiltprotocol/sdk-js'

import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Text, View, ScrollView, ActivityIndicator } from 'react-native'

import styles from '../styles/styles'
import { claimWeb3Name } from '../utils/claimW3n'
import SelectAccount from './SelectAccount'
import { CommonActions } from '@react-navigation/native'

import { getDidKeypair } from '../storage/did/store'
import { getStorage } from '../storage/storage'
import { mnemonicToMiniSecret } from '@polkadot/util-crypto'

export default function ClaimW3n({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false)

  const claimW3n = async () => {
    setIsLoading(true)

    if (!route.params.did || !route.params.w3n || !route.params.selectAccount) {
      return setIsLoading(false)
    }

    const password = await getStorage('session-password')

    const w3n = JSON.parse(JSON.stringify(route.params.w3n))
    const paymentAccount = JSON.parse(JSON.stringify(route.params.selectAccount))
    const did = JSON.parse(JSON.stringify(route.params.did))

    const keyring = new Utils.Keyring({
      ss58Format: 38,
      type: JSON.parse(JSON.stringify(paymentAccount)).metadata.type,
    })
    const account = keyring.addFromMnemonic(JSON.parse(JSON.stringify(paymentAccount)).mnemonic, {
      type: JSON.parse(JSON.stringify(paymentAccount)).metadata.type,
    })

    const didKeypairs = await getDidKeypair(did.uri, password)

    const authKey = JSON.parse(didKeypairs)

    const authentication = Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(authKey.authentication),
      did.authentication[0].type
    )

    await claimWeb3Name(did.uri, account, w3n.toLowerCase(), async ({ data }) => ({
      signature: authentication.sign(data),
      keyType: authentication.type,
    })).catch((e) => setIsLoading(false))
    setIsLoading(false)
    navigation.dispatch(CommonActions.goBack())
  }

  return (
    <ScrollView style={styles.container}>
      {route.params.w3n && <Text style={styles.text}>Claim your web3name: {route.params.w3n}</Text>}

      <SelectAccount navigation={navigation} route={route} />
      <ActivityIndicator color="orange" animating={isLoading} />

      <View style={{ ...styles.buttonContainer, paddingTop: '10%' }}>
        <TouchableOpacity
          style={styles.redButton}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.goBack(),
            })
          }
        >
          <Text style={styles.redButtonText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.orangeButton}
          disabled={isLoading || !route.params.selectAccount}
          onPress={() => claimW3n()}
        >
          <Text style={styles.orangeButtonText}>CLAIM</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
