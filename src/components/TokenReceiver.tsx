import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from '../styles/styles'
import QRCode from 'react-qr-code'
import { CommonActions } from '@react-navigation/native'

export default function TokenReceiver({ navigation, route }): JSX.Element {
  const [account, setAccount] = useState('')
  useEffect(() => {
    setAccount(route.params?.selectAccount)
  }, [route.params])

  return (
    <View>
      <Text style={styles.text}>Receive Tokens</Text>
      {!account ? null : (
        <View>
          <QRCode value={account.metadata.address} />
          <TouchableOpacity
            style={styles.orangeButton}
            onPress={() =>
              navigation.dispatch({
                ...CommonActions.navigate('Account'),
                params: { selectAccount: null },
              })
            }
          >
            <Text style={styles.orangeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
