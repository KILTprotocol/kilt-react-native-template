import React from 'react'
import { Storage } from '../runtime/modules/storage/storage'
import { NessieRuntime } from '../runtime/index'
import { View, Text, TextInput, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import * as AsyncStore from 'expo-secure-store'

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    paddingTop: 250,
  },
  text: {
    color: 'white',
    marginBottom: 20,
    fontSize: 30,
  },
  textInput: {
    padding: 5,
    paddingStart: 15,
    backgroundColor: '#3b3b3b',
    width: screenWidth * 0.8,
    borderRadius: 25,
    marginBottom: 15,
    color: 'white',
    fontWeight: '600',
  },
  loginBtn: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#ff1178',
    borderRadius: 25,
    color: 'white',
    textAlign: 'center',
  },
})

export default function OnboardUser(): JSX.Element {
  const [password, setPassword] = React.useState<undefined | string>()

  const createMasterPassword = async (): Promise<void> => {
    if (password === null) {
      return
    }
    const runtime = new NessieRuntime()
    const store = new Storage(runtime, password)

    await store.set('test', textEncoder.encode('test'))
    await AsyncStore.setItemAsync('nessie-initialized', 'true')
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
      <TouchableOpacity style={styles.loginBtn} onPress={createMasterPassword}>
        <Text>Create Master Password</Text>
      </TouchableOpacity>
    </View>
  )
}
