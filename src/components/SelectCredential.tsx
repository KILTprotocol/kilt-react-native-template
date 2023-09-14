import React, { useEffect, useState, useContext } from 'react'
import { View, Text, ScrollView } from 'react-native'

import * as CredentialStore from '../storage/credential/store'

import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'
import { AuthContext } from '../wrapper/AuthContextProvider'
import RadioButton from './RadioButton'
import styles from '../styles/styles'
import { ICredential } from '@kiltprotocol/sdk-js'

export default function SelectCredential({ navigation, route }) {
  const [credentials, setCredentials] = useState<{ name: string; credential: ICredential }[]>()
  const [credential, setCredential] = useState<ICredential>()
  const authContext = useContext(AuthContext)

  const handleSelectCredential = (selectCredential: ICredential) => {
    setCredential(selectCredential)
    navigation.dispatch({
      ...CommonActions.navigate('InspectCredential'),
      params: { credential: credential },
    })
  }

  useEffect(() => {
    const handle = async () => {
      const password = await getStorage('session-password')

      if (!password) {
        authContext.logout()
        navigation.navigate('UnlockStorageScreen')
      }
      const credentialList = await CredentialStore.list(password)

      const getAllCredentials = credentialList.map(({ name, credential }) => {
        return JSON.parse(JSON.stringify({ name, credential }))
      })
      setCredentials(getAllCredentials)
    }
    handle()
  }, [])

  return (
    <ScrollView style={{ width: '100%' }}>
      <Text style={{ ...styles.text, alignSelf: 'flex-start' }}>Select Credentials</Text>
      <View style={styles.selectAccountRadioContainer}>
        {credentials
          ? credentials.map(({ name, credential: a }, key) => {
              return (
                <RadioButton
                  key={key}
                  label={name}
                  selected={a === credential}
                  onPress={() => handleSelectCredential(a)}
                  first={key === 0}
                  last={credentials.length - 1 === key}
                  backgroundColor={'rgba(249,105,67,0.2)'}
                />
              )
            })
          : null}
      </View>
    </ScrollView>
  )
}
