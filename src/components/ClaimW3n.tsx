import { Utils, DidDocument, DidUri } from '@kiltprotocol/sdk-js'

import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Text, View, TextInput } from 'react-native'

import styles from '../styles/styles'
import * as DidStore from '../storage/did/store'

import SelectDid from './SelectDid'
import { claimWeb3Name } from '../utils/claimW3n'
import SelectAccount from './SelectAccount'
import { CommonActions } from '@react-navigation/native'
import { DidKeys } from '../utils/interfaces'

export default function ClaimW3n({ navigation, route }) {
  const [paymentAccount, setPaymentAccount] = useState()
  const [w3n, setW3n] = useState()

  useEffect(() => {
    console.log(route.params)
    if (!route.params) return
    setPaymentAccount(route.params.selectAccount)
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
    <View style={styles.container}>
      <Text style={styles.text}>Claim your W3N</Text>
      {!paymentAccount ? (
        <SelectAccount navigation={navigation} route={route} />
      ) : (
        <View>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.dispatch(CommonActions.setParams({ selectAccount: null }))}
          >
            <Text>Choose payment another account</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.loginBtn} onPress={() => claimW3n()}>
        <Text>Confirm your w3n name</Text>
      </TouchableOpacity>
    </View>
  )
}
