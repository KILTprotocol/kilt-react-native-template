import React, { useContext } from 'react'
import { AuthContext } from '../wrapper/AuthContextProvider'
import { TouchableOpacity, Text, Share, ScrollView, View } from 'react-native'
import styles from '../styles/styles'
import { getStorage } from '../storage/storage'
import * as AccountStore from '../storage/account/store'

export default function SettingScreen({ navigation }) {
  const authContext = useContext(AuthContext)

  const fetchKeys = async () => {
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }

    const keys = await AccountStore.getKeypairs(password)
    Share.share({
      message: JSON.stringify(keys),
      title: 'KILT Demo account Haus of Chaos',
    })
  }

  return (
    <ScrollView style={styles.scroll}>
      <View style={{ ...styles.centerContainer, top: '50%' }}>
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
      </View>
    </ScrollView>
  )
}
