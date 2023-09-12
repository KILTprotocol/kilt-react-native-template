import React, { useContext } from 'react'
import { AuthContext } from '../wrapper/AuthContextProvider'
import { TouchableOpacity, Text, View, ScrollView } from 'react-native'
import styles from '../styles/styles'
import { removeStorage } from '../storage/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SettingScreen({ navigation }) {
  const authContext = useContext(AuthContext)

  return (
    <ScrollView style={styles.scroll}>
      <TouchableOpacity
        style={styles.orangeButton}
        onPress={async () => {
          navigation.navigate('Export Storage')
        }}
      >
        <Text style={styles.orangeButtonText}>Export storage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.orangeButton}
        onPress={async () => {
          await AsyncStorage.clear()
          authContext.logout()
        }}
      >
        <Text style={styles.orangeButtonText}>Clear Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.orangeButton}
        onPress={async () => {
          await removeStorage('session-password')
          authContext.logout()
        }}
      >
        <Text style={styles.orangeButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
