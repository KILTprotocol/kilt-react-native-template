import React, { useContext, useState } from 'react'

import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native'

import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'

import { setStorage } from '../storage/storage'
import NessieLogo from '../components/NessieLogo'

// This would needs to be CHANGED!
export default function OnboardUserScreen(): JSX.Element {
  const [password, setPassword] = useState<string>('')
  // const [rememberPassword, setRemeberPassword] = useState<boolean>(false)
  const [hidePassword, setHidePassword] = useState(true)
  const authContext = useContext(AuthContext)

  const createMasterPassword = async (): Promise<void> => {
    if (!password) {
      return
    }

    await setStorage('test', 'test', password)
    await setStorage('session-password', password)
    await setStorage('nessie-initialized', 'true', password)

    authContext.authenticate()
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="position">
      <View style={styles.main}>
        <NessieLogo pink={false} purple={true} />

        <Text style={{ ...styles.text, marginBottom: 10 }}>Create Master Password</Text>
        <Text style={{ ...styles.text, textAlign: 'center', marginBottom: 10 }}>
          This password will be used to encrypt your data. It will not be stored anywhere.
        </Text>
        <Text style={{ ...styles.text, marginBottom: 24 }}>Please make sure to remember it.</Text>
        <TextInput
          style={{ ...styles.input, width: '80%', marginBottom: 24 }}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
        />
        {/* <BouncyCheckbox onPress={() => setRemeberPassword(!rememberPassword)} /> */}
        <TouchableOpacity style={styles.orangeButton} onPress={createMasterPassword}>
          <Text style={styles.orangeButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
