import React, { useContext } from 'react'
import { AuthContext } from '../wrapper/AuthContextProvider'
import { TouchableOpacity, Text, View } from 'react-native'
import styles from '../styles/styles'
import { removeStorage } from '../storage/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SettingScreen({ navigation }) {
  const authContext = useContext(AuthContext)

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={async () => {
          await AsyncStorage.clear()
          authContext.logout()
        }}
      >
        <Text>Clear Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={async () => {
          await removeStorage('session-password')
          authContext.logout()
        }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={async () => {
          navigation.navigate('Export Storage')
        }}
      >
        <Text>Export storage</Text>
      </TouchableOpacity>
    </View>
  )
}
