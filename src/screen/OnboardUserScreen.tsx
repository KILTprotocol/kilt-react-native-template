import React, { useContext, useState } from 'react'

import { View, Text, TextInput, TouchableOpacity } from 'react-native'

import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'

import { setStorage } from '../keys/storage'

const textEncoder = new TextEncoder()

export default function OnboardUserScreen(): JSX.Element {
  const [password, setPassword] = useState<string>('Enter your password')
  const [rememberPassword, setRemeberPassword] = React.useState<boolean>(false)
  const authContext = useContext(AuthContext)

  const createMasterPassword = async (): Promise<void> => {
    if (!password) {
      return
    }
    console.log('trigger 1')
    await setStorage('test', textEncoder.encode('test'), password)
    console.log('trigger 2')

    await setStorage('nessie-initialized', 'true', password)
    if (rememberPassword) {
      console.log('trigger 3')

      await setStorage('session-password', password, password)
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
        value={password}
        onChangeText={setPassword}
      />
      {/* <BouncyCheckbox onPress={() => setRemeberPassword(!rememberPassword)} /> */}
      <TouchableOpacity style={styles.loginBtn} onPress={createMasterPassword}>
        <Text>Create Master Password</Text>
      </TouchableOpacity>
    </View>
  )
}
