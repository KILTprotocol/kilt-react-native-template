import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import * as KeyStore from '../storage/keys/store'
import styles from '../styles/styles'
import { KeyInfo } from '../utils/interfaces'
import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'

export default function SelectAccount({ navigation, route }) {
  const [keys, setKeys] = useState<KeyInfo[]>()

  useEffect(() => {
    const handle = async () => {
      const password = await getStorage('session-password', 'Enter your password')
      if (!password) return console.log('no password')
      const keysList = await KeyStore.list(password)

      const keys = keysList.map((val: KeyInfo) => {
        return JSON.parse(JSON.stringify(val))
      })
      setKeys(keys)
    }
    handle()
  }, [])

  return (
    <View>
      {keys ? (
        keys.map((keyInfo: KeyInfo, key) => {
          return (
            <View key={key}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() =>
                  navigation.dispatch({
                    ...CommonActions.goBack(),
                    ...CommonActions.setParams({ selectAccount: keyInfo }),
                  })
                }
              >
                <Text>{keyInfo.metadata.address}</Text>
              </TouchableOpacity>
            </View>
          )
        })
      ) : (
        <></>
      )}
    </View>
  )
}
