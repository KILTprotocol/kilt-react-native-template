import React, { useState, useEffect } from 'react'
import { TouchableOpacity, Text, View, ScrollView } from 'react-native'

import styles from '../styles/styles'
import SelectAccount from '../components/SelectAccount'
import { CommonActions } from '@react-navigation/native'

export default function AccountScreen({ navigation, route }) {
  const [account, setAccount] = useState()
  useEffect(() => {
    if (!route.params) {
      return
    }

    setAccount(route.params.selectAccount)
  }, [route.params])

  return (
    <ScrollView style={styles.scroll}>
      <SelectAccount navigation={navigation} route={route} />
      <View>
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => navigation.navigate('TokenSender', { selectAccount: account })}
        >
          <Text style={styles.orangeButtonText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => navigation.navigate('TokenReceiver', { selectAccount: account })}
        >
          <Text style={styles.orangeButtonText}>Receive</Text>
        </TouchableOpacity>
      </View>

      <>
        <Text>Please select an account, if you have no account please create a key</Text>
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => navigation.navigate('ImportKey')}
        >
          <Text>Add or Import Key</Text>
        </TouchableOpacity>
      </>
    </ScrollView>
  )
}
