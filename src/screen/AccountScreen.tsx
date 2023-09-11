import React, { useState, useEffect } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'

import styles from '../styles/styles'
import SelectAccount from '../components/SelectAccount'
import { CommonActions } from '@react-navigation/native'

export default function AccountScreen({ navigation, route }) {
  const [account, setAccount] = useState()
  useEffect(() => {
    if (!route.params) {
      return
    }
    console.log('hello', route.params)
    setAccount(route.params.selectAccount)
  }, [route.params])

  return (
    <View style={styles.container}>
      {account ? (
        <>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('TokenSender', { selectAccount: account })}
          >
            <Text>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('TokenReceiver', { selectAccount: account })}
          >
            <Text>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.dispatch(CommonActions.setParams({ selectAccount: null }))}
          >
            <Text>Select another account</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <SelectAccount navigation={navigation} route={route} />

          <Text>Please select an account, if you have no account please create a key</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('ImportKey')}
          >
            <Text>Add or Import Key</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}
