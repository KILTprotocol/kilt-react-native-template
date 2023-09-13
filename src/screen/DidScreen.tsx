import { Did } from '@kiltprotocol/sdk-js'

import { TouchableOpacity, Text, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import styles from '../styles/styles'
import SelectDid from '../components/SelectDid'
import { CommonActions } from '@react-navigation/native'
import { getKeypairs } from '../storage/keys/store'
import { getStorage } from '../storage/storage'
import NessieLogo from '../components/NessieLogo'

export default function DidScreen({ navigation, route }) {
  const [isDisabled, setIsDisabled] = useState(true)
  const accounts = async () => {
    const password = await getStorage('session-password')
    const keypairs = await getKeypairs(password)
    console.log('keys', keypairs.length)
    if (keypairs.length === 0) {
      setIsDisabled(false)
    }

    setIsDisabled(true)
  }

  useEffect(() => {
    accounts()
  }, [])
  return (
    <ScrollView style={styles.scroll}>
      <NessieLogo pink={false} purple={true} />
      <View style={{ ...styles.header, backgroundColor: 'rgba(249,105,67,0.2)' }}>
        <Text style={styles.headerText}>Your Identities</Text>
      </View>
      <SelectDid navigation={navigation} route={route} />
      {!isDisabled && (
        <Text
          style={{
            ...styles.text,
            paddingVertical: 20,
            width: '50%',
            textAlign: 'center',
            alignSelf: 'center',
          }}
        >
          Nothing to see here. Add an account first
        </Text>
      )}
      <View style={{ paddingTop: 30 }}>
        <TouchableOpacity
          style={
            !isDisabled ? { ...styles.orangeButton, ...styles.buttonDisabled } : styles.orangeButton
          }
          disabled={!isDisabled}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.navigate({
                name: 'CreateDid',
                params: { selectAccount: null },
              }),
            })
          }
        >
          <Text style={styles.orangeButtonText}>ADD IDENTITY</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
