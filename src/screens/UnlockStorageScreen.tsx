import React, { useState, useEffect } from 'react'
import { Text, View, TextInput, TouchableOpacity } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { NessieRuntime } from '../runtime/index'
import OnboardUser from './OnboardUserScreen'
import { Storage } from '../runtime/modules/storage/storage'
import * as SecureStore from 'expo-secure-store'
import { CommonActions } from '@react-navigation/native'

import { NativeStackScreenProps } from '@react-navigation/native-stack'

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

interface UnlockStorageScreenProps {
  onUnlock: (password: string) => void
  navigation: any
  route: any
}

// type Props = NativeStackScreenProps<UnlockStorageScreenProps, 'UnlockStorageScreen', 'MyStack'>

export default function UnlockStorageScreen(props: UnlockStorageScreenProps) {
  const [password, setPassword] = useState('Enter your password')
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState('')
  const [storageInitialized, setStorageInitialized] = useState<boolean | null>(null)

  const runtime = new NessieRuntime()

  const checkIfStorageIsInitialized = async (): Promise<boolean> => {
    const result = await SecureStore.getItemAsync('nessie-initialized')
    console.log('result handle', result, password)
    return !!result
  }

  const rememberPasswordHandler = () => setRememberPassword(!rememberPassword)

  useEffect((): void => {
    checkIfStorageIsInitialized()
      .then((initialized) => {
        setStorageInitialized(initialized)
      })
      .catch((e: any) => {})
  }, [])

  const checkIfPasswordIsCorrect = async (password: string): Promise<boolean> => {
    const store = new Storage(runtime, password)
    console.log(store)
    try {
      const test = await store.get('test')
      console.log('did happen 1?')

      if (textDecoder.decode(test) !== 'test') {
        setError('Incorrect password')
        console.log('did happen 2?')

        return false
      }
    } catch (e) {
      setError('Incorrect password')
      console.log('did happen 3?')

      return false
    }
    console.log('did happen 4?')
    return true
  }

  const checkForCachedPassword = async (): Promise<void> => {
    const result = await SecureStore.getItemAsync('nessie-password')
    if (result && result !== undefined) {
      const correct = await checkIfPasswordIsCorrect(result)
      console.log('Helping the correct', correct)
      if (correct) {
        props.onUnlock(result)
      } else {
        await SecureStore.deleteItemAsync('nessie-password')
      }
    }
  }
  // checkForCachedPassword().catch(console.error)

  const onInsertPassword = (): void => {
    checkIfPasswordIsCorrect(password)
      .then((correct) => {
        if (correct) {
          if (rememberPassword) {
            SecureStore.getItemAsync('nessie-password').catch(console.error)
          }
          // props.onUnlock(password)
        }
      })
      .catch(console.error)
  }

  // if (storageInitialized === null) {
  //   return (
  //     <View>
  //       <Text>Unlock Storage</Text>
  //       <Text>Checking if storage is initialized...</Text>
  //     </View>
  //   )
  // }

  if (!storageInitialized) {
    return <OnboardUser />
  }

  return (
    <View>
      <Text>Unlock Storage</Text>
      <Text>Enter your password to unlock the storage.</Text>
      <TextInput value={password} onChangeText={setPassword} />
      {/* <BouncyCheckbox onPress={rememberPasswordHandler} /> <Text>Remember Password</Text> */}
      <TouchableOpacity onPress={onInsertPassword}>
        <Text>Unlock with your Password</Text>
      </TouchableOpacity>
      <Text>{error}</Text>
    </View>
  )
}
