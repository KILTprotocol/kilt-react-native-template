import { View, Text, TouchableOpacity } from 'react-native'
import React, { useMemo, useEffect, useState } from 'react'
import styles from '../styles/styles'
import QRCode from 'react-qr-code'
import { list } from '../storage/keys/store'
import { getStorage } from '../storage/storage'
import { KeyInfo } from '../utils/interfaces'
import SelectAccount from '../components/SelectAccount'
import { CommonActions } from '@react-navigation/native'

export default function ReceiverScreen({ navigation, route }): JSX.Element {
  const [address, setAddress] = useState('')
  useEffect(() => {
    if (!route.params?.selectAccount.metadata) return
    const { address } = route.params?.selectAccount.metadata
    setAddress(address)
  }, [route.params?.selectAccount])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Receive Tokens</Text>
      {!address ? (
        <SelectAccount navigation={navigation} route={route} />
      ) : (
        <View>
          <QRCode value={address} />
          <TouchableOpacity
            style={styles.loginBtn}
            // I need to fix this metadata stupidity
            onPress={() => navigation.dispatch(CommonActions.setParams({ selectAddress: null }))}
          >
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
