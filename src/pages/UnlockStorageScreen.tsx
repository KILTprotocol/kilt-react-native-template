import React, { useState, useEffect, useContext } from 'react'
import { Text, View, TextInput, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { NessieRuntime } from '../runtime/index'
import OnboardUser from './OnboardUserScreen'
import { Storage } from '../runtime/modules/storage/storage'
import * as SecureStore from 'expo-secure-store'
import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'
import { RuntimeContext } from '../wrapper/RuntimeContextProvider'

const textDecoder = new TextDecoder()

// type Props = NativeStackScreenProps<UnlockStorageScreenProps, 'UnlockStorageScreen', 'MyStack'>

export default function UnlockStorageScreen() {
  const [enterPassword, setEnterPassword] = useState('Enter your password')
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState('')
  const [storageInitialized, setStorageInitialized] = useState<boolean | null>(null)
  const authContext = useContext(AuthContext)
  const runtimeContext = useContext(RuntimeContext)

  const runtime = new NessieRuntime()

  const checkIfStorageIsInitialized = async (): Promise<boolean> => {
    const result = await SecureStore.getItemAsync('nessie-initialized')
    console.log('result handle', result, enterPassword)
    return !!result
  }

  useEffect((): void => {
    checkIfStorageIsInitialized()
      .then((initialized) => {
        setStorageInitialized(initialized)
      })
      .catch((e: any) => {})
  }, [])

  const checkIfPasswordIsCorrect = async (password: string): Promise<boolean> => {
    const store = new Storage(runtime, password)

    try {
      const test = await store.get('test')
      if (textDecoder.decode(test) !== 'test') {
        setError('Incorrect password')

        return false
      }
    } catch (e) {
      setError('Incorrect password')

      return false
    }

    return true
  }

  const checkForCachedPassword = async (): Promise<void> => {
    const result = await SecureStore.getItemAsync('session-password')
    if (result && result !== undefined) {
      const correct = await checkIfPasswordIsCorrect(result)
      if (correct) {
        authContext.authenticate()
      } else {
        await SecureStore.deleteItemAsync('session-password')
      }
    }
  }
  checkForCachedPassword().catch(console.error)

  const onInsertPassword = (): void => {
    checkIfPasswordIsCorrect(enterPassword)
      .then((correct) => {
        if (correct) {
          if (rememberPassword) {
            authContext.authenticate()
            runtimeContext.getRuntime(enterPassword)
          }
        }
        authContext.authenticate()
        runtimeContext.getRuntime(enterPassword)
      })
      .catch(console.error)
  }

  if (!storageInitialized) {
    return <OnboardUser />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Unlock Storage</Text>
      <Text style={styles.text}>Enter your password to unlock the storage.</Text>
      <TextInput style={styles.textInput} value={enterPassword} onChangeText={setEnterPassword} />
      <Text style={styles.text}>Remember Password</Text>
      <BouncyCheckbox onPress={() => setRememberPassword(!rememberPassword)} />
      <TouchableOpacity style={styles.loginBtn} onPress={onInsertPassword}>
        <Text>Unlock with your Password</Text>
      </TouchableOpacity>
      <Text>{error}</Text>
    </View>
  )
}
