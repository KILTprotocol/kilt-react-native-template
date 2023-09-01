import React, { useContext } from 'react'
import { Storage } from '../runtime/modules/storage/storage'
import { NessieRuntime } from '../runtime/index'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'
import AsyncStorage from '@react-native-async-storage/async-storage'

const textEncoder = new TextEncoder()

export default function OnboardUser({ navigation }): JSX.Element {
  const [password, setPassword] = React.useState<undefined | string>()
  const [rememberPassword, setRemeberPassword] = React.useState<boolean>(false)
  const authContext = useContext(AuthContext)

  const createMasterPassword = async (): Promise<void> => {
    if (!password) {
      return
    }
    const runtime = new NessieRuntime(password)
    const store = new Storage(runtime, password)

    await store.set('test', textEncoder.encode('test'))
    await AsyncStorage.setItem('nessie-initialized', 'true')
    if (rememberPassword) {
      await AsyncStorage.setItem('session-password', password)
    }

    authContext.authenticate()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Nessie Mobile</Text>
      <Text style={styles.text}>
        This password will be used to encrypt your data. It will not be stored anywhere. Please make
        sure to remember it.
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder="password"
        value={undefined}
        onChangeText={setPassword}
      />
      <BouncyCheckbox onPress={() => setRemeberPassword(!rememberPassword)} />
      <TouchableOpacity style={styles.loginBtn} onPress={createMasterPassword}>
        <Text>Create Master Password</Text>
      </TouchableOpacity>
    </View>
  )
}
