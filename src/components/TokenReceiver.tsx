import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { CommonActions } from '@react-navigation/native'
import styles from '../styles/styles'
import { KeyInfo } from '../utils/interfaces'

const componentStyles = StyleSheet.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 40,
  },
  code: {
    marginTop: 40,
  },
  address: {
    marginTop: 12,
    marginHorizontal: 70,
  },
  button: {
    marginTop: 36,
  },
})

export default function TokenReceiver({ navigation, route }): JSX.Element {
  const [address, setAddress] = useState('')
  useEffect(() => {
    setAddress((route.params?.selectAccount as KeyInfo).metadata.address)
  }, [route.params])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Receive Tokens</Text>
      </View>
      {address && (
        <View style={componentStyles.main}>
          <QRCode value={address} />
          <Text style={{ ...styles.text, ...componentStyles.address }} selectable>
            {address}
          </Text>
          <TouchableOpacity
            style={{ ...styles.redButton, ...componentStyles.button }}
            onPress={() =>
              navigation.dispatch({
                ...CommonActions.navigate('Accounts'),
                params: { selectAccount: null },
              })
            }
          >
            <Text style={styles.orangeButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}
