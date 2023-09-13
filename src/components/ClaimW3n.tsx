import { Utils } from '@kiltprotocol/sdk-js'

import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Text, View, ScrollView } from 'react-native'

import styles from '../styles/styles'
import { claimWeb3Name } from '../utils/claimW3n'
import SelectAccount from './SelectAccount'

export default function ClaimW3n({ navigation, route }) {
  const [paymentAccount, setPaymentAccount] = useState()
  const [w3n, setW3n] = useState()

  useEffect(() => {
    console.log(route.params)
    if (!route.params) return
    setPaymentAccount(route.params.selectAccount)
    setW3n(route.params.w3n)
  }, [route.params])

  const claimW3n = async () => {
    if (!paymentAccount || !route.params.did || !w3n) return

    const did = JSON.parse(JSON.stringify(route.params.did))

    const keyring = new Utils.Keyring({
      ss58Format: 38,
      type: JSON.parse(JSON.stringify(paymentAccount)).metadata.type,
    })
    const account = keyring.addFromMnemonic(JSON.parse(JSON.stringify(paymentAccount)).mnemonic, {
      type: JSON.parse(JSON.stringify(paymentAccount)).metadata.type,
    })

    const { keypairs } = did

    const authentication = keyring.addFromMnemonic(JSON.parse(keypairs).authentication, {
      type: did.document.authentication[0].type,
    })

    await claimWeb3Name(did.document.uri, account, w3n, async ({ data }) => ({
      signature: authentication.sign(data),
      keyType: authentication.type,
    }))

    console.log('claimed')
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>Claim your web3name: {w3n}</Text>

      <SelectAccount navigation={navigation} route={route} />

      <View style={{ ...styles.buttonContainer, paddingTop: '10%' }}>
        <TouchableOpacity style={styles.redButton} onPress={() => claimW3n()}>
          <Text style={styles.redButtonText}>CANCEL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.orangeButton} onPress={() => claimW3n()}>
          <Text style={styles.orangeButtonText}>CLAIM</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
