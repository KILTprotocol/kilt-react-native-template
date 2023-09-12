import React, { useState, useEffect } from 'react'
import { TouchableOpacity, Text, View, ScrollView, Image } from 'react-native'

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
      <View style={{ paddingTop: '16.33%', alignItems: 'center', paddingBottom: '15%' }}>
        <Image source={require('../../assets/Group.png')} />
        <Text
          style={{
            color: 'white',
            fontSize: 16,
          }}
        >
          Nessie
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 12,
          }}
        >
          your Identity wallet
        </Text>
      </View>

      <SelectAccount navigation={navigation} route={route} />
      {account ? (
        <View>
          <TouchableOpacity
            style={styles.orangeButton}
            onPress={() => navigation.navigate('TokenSender', { selectAccount: account })}
          >
            <Text style={styles.orangeButtonText}>SEND</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orangeButton}
            onPress={() => navigation.navigate('TokenReceiver', { selectAccount: account })}
          >
            <Text style={styles.orangeButtonText}>RECEIVE</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.orangeButton}
        onPress={() => navigation.navigate('ImportKey')}
      >
        <Text style={styles.orangeButtonText}>ADD ACCOUNT</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
