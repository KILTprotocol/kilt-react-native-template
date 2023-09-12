import React, { useContext, useState } from 'react'

import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'

import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'

import { setStorage } from '../storage/storage'

// This would needs to be CHANGED!
export default function OnboardUserScreen(): JSX.Element {
  const [password, setPassword] = useState<string>('Enter your password')
  const [rememberPassword, setRemeberPassword] = useState<boolean>(false)
  const authContext = useContext(AuthContext)

  const createMasterPassword = async (): Promise<void> => {
    if (!password) {
      return
    }

    await setStorage('test', 'test', password)

    await setStorage('nessie-initialized', 'true', password)

    await setStorage('session-password', password)

    authContext.authenticate()
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: '16.33%', alignItems: 'center' }}>
        <Image source={require('../../assets/Group.png')} />
        <Text
          style={{
            color: 'white',
            fontSize: 16,
          }}
        >
          Nessie
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 12,
          }}
        >
          your Identity wallet
        </Text>
      </View>
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
      <TouchableOpacity style={styles.orangeButton} onPress={createMasterPassword}>
        <Text style={styles.orangeButtonText}>Create Master Password</Text>
      </TouchableOpacity>
    </View>
  )
}
