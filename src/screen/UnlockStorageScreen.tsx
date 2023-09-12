import React, { useState, useEffect, useContext } from 'react'
import { Text, View, TextInput, TouchableOpacity } from 'react-native'

import OnboardUser from './OnboardUserScreen'

import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'
import { getStorage, removeStorage, setStorage } from '../storage/storage'

const textDecoder = new TextDecoder()

// type Props = NativeStackScreenProps<UnlockStorageScreenProps, 'UnlockStorageScreen', 'MyStack'>

export default function UnlockStorageScreen({ navigation }) {
  const [enterPassword, setEnterPassword] = useState('Enter your password')
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState('')
  const [storageInitialized, setStorageInitialized] = useState<boolean | null>(null)

  const authContext = useContext(AuthContext)

  const checkIfStorageIsInitialized = async (): Promise<boolean> => {
    const result = await getStorage('nessie-initialized', enterPassword)
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
    try {
      const test = await getStorage('test', password)

      if (test !== 'test') {
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
    const result = await getStorage('session-password')

    if (result && result !== undefined) {
      const correct = await checkIfPasswordIsCorrect(result)
      if (correct) {
        authContext.authenticate()
      } else {
        await removeStorage('session-password')
      }
    }
  }
  checkForCachedPassword().catch((e) => console.log(e))

  const onInsertPassword = async (): Promise<void> => {
    await checkIfPasswordIsCorrect(enterPassword)
      .then(async (correct) => {
        if (correct) {
          if (rememberPassword) {
            await setStorage('session-password', enterPassword)

            authContext.authenticate()
          }
        }
        await setStorage('session-password', enterPassword)

        authContext.authenticate()
      })
      .catch(console.error)
  }

  if (!storageInitialized) {
    return <OnboardUser />
  }

  return (
    <View >
      <Text style={styles.text}>Unlock Storage</Text>
      <Text style={styles.text}>Enter your password to unlock the storage.</Text>
      <TextInput style={styles.textInput} value={enterPassword} onChangeText={setEnterPassword} />
      <Text style={styles.text}>Remember Password</Text>
      {/* <BouncyCheckbox onPress={() => setRememberPassword(!rememberPassword)} /> */}
      <TouchableOpacity style={styles.loginBtn} onPress={onInsertPassword}>
        <Text>Unlock with your Password</Text>
      </TouchableOpacity>
      <Text>{error}</Text>
    </View>
  )
}
