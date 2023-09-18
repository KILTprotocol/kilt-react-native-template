import React, { useEffect, useState, useContext } from 'react'
import { View, Text, ScrollView } from 'react-native'

import * as AccountStore from '../storage/account/store'

import { KeyInfo } from '../storage/utils/interfaces'
import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'
import { AuthContext } from '../wrapper/AuthContextProvider'
import RadioButton from './RadioButton'
import styles from '../styles/styles'

export default function SelectAccount({ navigation, route }) {
  const [keys, setKeys] = useState<KeyInfo[]>()
  const [account, setAccount] = useState<KeyInfo | null>()
  const authContext = useContext(AuthContext)

  const handleSelectKeyInfo = (selectKeyInfo) => {
    setAccount(selectKeyInfo)
  }

  useEffect(() => {
    navigation.dispatch({ ...CommonActions.setParams({ selectAccount: account }) })
  }, [account])

  useEffect(() => {
    const handle = async () => {
      const password = await getStorage('session-password')

      if (!password) {
        authContext.logout()
        navigation.navigate('UnlockStorageScreen')
      }
      const keysList = await AccountStore.list(password)

      const keys = keysList.map((val: KeyInfo) => {
        return JSON.parse(JSON.stringify(val))
      })
      setKeys(keys)
    }
    handle()
  }, [])

  return (
    <ScrollView style={{ width: '100%' }}>
      <Text style={{ ...styles.text, alignSelf: 'flex-start', margin: 15 }}>Select Account</Text>
      <View style={styles.selectAccountRadioContainer}>
        {keys
          ? keys.map((keyInfo: KeyInfo, key) => {
              return (
                <RadioButton
                  key={key}
                  label={keyInfo.metadata.address}
                  selected={account === keyInfo}
                  onPress={() => handleSelectKeyInfo(keyInfo)}
                  first={key === 0}
                  last={keys.length - 1 === key}
                  backgroundColor={'rgba(249,105,67,0.2)'}
                />
              )
            })
          : null}
      </View>
    </ScrollView>
  )
}
