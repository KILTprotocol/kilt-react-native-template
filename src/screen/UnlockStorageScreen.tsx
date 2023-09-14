import React, { useState, useEffect, useContext } from 'react'
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native'

import OnboardUser from './OnboardUserScreen'

import { AuthContext } from '../wrapper/AuthContextProvider'
import styles from '../styles/styles'
import { getStorage, removeStorage, setStorage } from '../storage/storage'
import NessieLogo from '../components/NessieLogo'

const textDecoder = new TextDecoder()

// type Props = NativeStackScreenProps<UnlockStorageScreenProps, 'UnlockStorageScreen', 'MyStack'>

export default function UnlockStorageScreen({ navigation }) {
  const [enterPassword, setEnterPassword] = useState('')
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState('')
  const [hidePassword, setHidePassword] = useState(true)

  const authContext = useContext(AuthContext)

  const checkIfStorageIsInitialized = async (): Promise<boolean> => {
    const result = await getStorage('nessie-initialized', enterPassword)
    return !!result
  }

  useEffect((): void => {
    checkIfStorageIsInitialized()
      .then((initialized) => {
        if (!initialized) {
          navigation.navigate('Welcome')
        }
      })
      .catch((e: any) => {})
  }, [checkIfStorageIsInitialized, navigation])

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

  return (
    <KeyboardAvoidingView style={styles.container} behavior="position">
      <View style={styles.main}>
        <NessieLogo pink={false} purple={true} />

        <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 10 }}>Unleash Nessie</Text>

        <Text style={{ ...styles.text, marginBottom: 24 }}>
          Enter your master password to login.
        </Text>
        <TextInput
          style={{ ...styles.input, width: '80%', marginBottom: 24 }}
          value={enterPassword}
          onChangeText={setEnterPassword}
          placeholder="Enter password"
          placeholderTextColor="rgba(255,255,255,0.5)"
          secureTextEntry={hidePassword}
        />

        {/* <Text style={styles.text}>Remember Password</Text> */}
        {/* <BouncyCheckbox onPress={() => setRememberPassword(!rememberPassword)} /> */}
        <TouchableOpacity
          disabled={!enterPassword}
          style={styles.orangeButton}
          onPress={onInsertPassword}
        >
          <Text style={styles.orangeButtonText}>OK</Text>
        </TouchableOpacity>
        {/* <Text>{error}</Text> */}
      </View>
    </KeyboardAvoidingView>
  )
}
