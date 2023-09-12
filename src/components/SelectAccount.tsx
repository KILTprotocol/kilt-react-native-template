import React, { useEffect, useState, useContext } from 'react'
import { TouchableOpacity, View, Text, Image } from 'react-native'

import * as KeyStore from '../storage/keys/store'
import styles from '../styles/styles'
import { KeyInfo } from '../utils/interfaces'
import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'
import { AuthContext } from '../wrapper/AuthContextProvider'

export default function SelectAccount({ navigation, route }) {
  const [keys, setKeys] = useState<KeyInfo[]>()
  const authContext = useContext(AuthContext)

  useEffect(() => {
    const handle = async () => {
      const password = await getStorage('session-password')

      if (!password) {
        authContext.logout()
        navigation.navigate('UnlockStorageScreen')
      }
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
            <View key={key} style={{ paddingTop: '0.5%', paddingBottom: '0.5%' }}>
              <TouchableOpacity
                style={styles.rectangleButtonPurple}
                onPress={() =>
                  navigation.dispatch({
                    ...CommonActions.goBack(),
                    ...CommonActions.setParams({ selectAccount: keyInfo }),
                  })
                }
              >
                <Text style={styles.rectangleButtonText}>{keyInfo.metadata.address}</Text>
                <View style={{ right: '40%' }}>
                  <Image source={require('../../assets/Manage.png')} />
                </View>
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
