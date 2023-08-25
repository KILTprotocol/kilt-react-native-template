import React, { useState } from 'react'
import { Text, View, TextInput, TouchableOpacity } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { NessieRuntime } from '../../index'
import { OnboardUser } from './OnboardUser'
import { Storage } from './storage'
import * as SecureStore from 'expo-secure-store'

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

interface UnlockStorageScreenProps {
  onUnlock: (password: string) => void
}

export function UnlockStorageScreen(props: UnlockStorageScreenProps): JSX.Element {
  const [password, setPassword] = useState('Enter your password')
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState('')
  const [storageInitialized, setStorageInitialized] = useState<boolean | null>(null)

  const runtime = new NessieRuntime()

  const checkIfStorageIsInitialized = async (): Promise<boolean> => {
    const result = await SecureStore.getItemAsync('nessie-initialized')
    if (!result) throw new Error('UnlockStorage If storage is not initialized')
    return result!['nessie-initialized'] !== undefined
  }
  const rememberPasswordHandler = () => setRememberPassword(!rememberPassword)
  React.useEffect((): void => {
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
    const result = await SecureStore.getItemAsync('nessie-password')

    if (result && result['nessie-password'] !== undefined) {
      const correct = await checkIfPasswordIsCorrect(result['nessie-password'])
      if (correct) {
        props.onUnlock(result['nessie-password'])
      } else {
        await SecureStore.deleteItemAsync('nessie-password')
      }
    }
  }
  checkForCachedPassword().catch(console.error)

  const onInsertPassword = (): void => {
    checkIfPasswordIsCorrect(password)
      .then((correct) => {
        if (correct) {
          if (rememberPassword) {
            SecureStore.getItemAsync({ 'nessie-password': password }).catch(console.error)
          }
          props.onUnlock(password)
        }
      })
      .catch(console.error)
  }

  if (storageInitialized === null) {
    return (
      <View>
        <>
          <Text>Unlock Storage</Text>
          <Text>Checking if storage is initialized...</Text>
        </>
      </View>
    )
  }

  if (!storageInitialized) {
    return (
      <OnboardUser
        setMasterPassword={(password: string) => {
          const store = new Storage(runtime, password)
          Promise.all([
            store.set('test', textEncoder.encode('test')),
            SecureStore.setItemAsync('nessie-initialized', 'true'),
          ])
            .then(() => {
              if (rememberPassword) {
                SecureStore.setItemAsync('nessie-password', password).catch(console.error)
              }
              props.onUnlock(password)
            })
            .catch((e: any) => {
              console.error(e)
              setError('Error initializing storage')
            })
        }}
      />
    )
  }

  return (
    <View>
      <>
        <Text>Unlock Storage</Text>
        <Text>Enter your password to unlock the storage.</Text>
        <TextInput value={password} onChange={setPassword} />
        <BouncyCheckbox onPress={rememberPasswordHandler} /> <Text>Remember Password</Text>
        <TouchableOpacity onPress={onInsertPassword}>Unlock</TouchableOpacity>
        <Text>{error}</Text>
      </>
    </View>
  )
}
