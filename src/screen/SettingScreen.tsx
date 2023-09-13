import React, { useContext } from 'react'
import { AuthContext } from '../wrapper/AuthContextProvider'
import { TouchableOpacity, Text, Share, ScrollView } from 'react-native'
import styles from '../styles/styles'
import { getStorage, allStorage } from '../storage/storage'
import * as KeyStore from '../storage/keys/store'

export default function SettingScreen({ navigation }) {
  const authContext = useContext(AuthContext)

  const fetchKeys = async () => {
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }

    const getAllStorage = await allStorage(password)
    const keys = await KeyStore.getKeypairs(password)
    Share.share({
      message: JSON.stringify(keys),
      title: 'KILT Demo account Haus of Chaos',
    })
  }

  return (
    <ScrollView style={styles.scroll}>
      <TouchableOpacity
        style={styles.orangeButton}
        onPress={async () => {
          fetchKeys()
        }}
      >
        <Text style={styles.orangeButtonText}>Export storage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.orangeButton}
        onPress={async () => {
          navigation.navigate('Warning')
        }}
      >
        <Text style={styles.orangeButtonText}>Clear Storage</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
