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
  const [account, setAccount] = useState('')
  useEffect(() => {
    setAccount(route.params?.selectAccount)
  }, [route.params?.selectAccount])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Receive Tokens</Text>
      {!account ? (
        <SelectAccount navigation={navigation} route={route} />
      ) : (
        <View>
          <QRCode value={account.metadata.address} />
          <TouchableOpacity
            style={styles.loginBtn}
            // I need to fix this metadata stupidity
            onPress={() => navigation.dispatch(CommonActions.setParams({ selectAccount: null }))}
          >
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
