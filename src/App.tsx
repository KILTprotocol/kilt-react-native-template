import React, { useContext, useEffect, useState } from 'react'
import { navigationRef } from './components/RootNavigation'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { connect, Did, ConfigService } from '@kiltprotocol/sdk-js'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles/styles'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ImportKeyScreen from './screen/ImportKeyScreen'
import OnboardUserScreen from './screen/OnboardUserScreen'
import ReceiverScreen from './screen/ReceiverScreen'
import SenderScreen from './screen/SenderScreen'
import UnlockStorageScreen from './screen/UnlockStorageScreen'
import AuthContextProvider, { AuthContext } from './wrapper/AuthContextProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createNativeStackNavigator()

function Main({ navigation }) {
  const [did, setDid] = useState('Fetching the Did Uri')
  const authContext = useContext(AuthContext)
  useEffect(() => {
    const fetchDid = async () => {
      await connect('wss://peregrine.kilt.io')
      const web3Name = 'john_doe'
      const api = ConfigService.get('api')

      console.log(`Querying the blockchain for the web3name "${web3Name}"`)
      // Query the owner of the provided web3name.
      const encodedWeb3NameOwner = await api.call.did.queryByWeb3Name(web3Name)

      const { document } = Did.linkedInfoFromChain(encodedWeb3NameOwner)

      setDid(document.uri || 'unknown')
    }

    fetchDid()
  }, [])
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fetching a DID: {did}</Text>
      <TouchableOpacity style={styles.text} onPress={() => navigation.navigate('ImportKeyScreen')}>
        <Text style={styles.text}>Import or Add keys</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.text} onPress={() => AsyncStorage.clear()}>
        <Text style={styles.text}>Clear Storage Tokens</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.text} onPress={() => navigation.navigate('ReceiverScreen')}>
        <Text style={styles.text}>Receive Tokens</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.text} onPress={() => navigation.navigate('SenderScreen')}>
        <Text style={styles.text}>Send Tokens</Text>
      </TouchableOpacity>
      <Text>Create a DID</Text>
      <TouchableOpacity style={styles.text} onPress={() => navigation.navigate('CreateDidScreen')}>
        <Text style={styles.text}>Create a DID</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.text}
        onPress={() => {
          authContext.logout()
        }}
      >
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

function AuthStack() {
  const authContext = useContext(AuthContext)

  useEffect(() => {
    console.log('authContext', authContext)
  }, [authContext])

  return (
    <Stack.Navigator>
      {!authContext.isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="UnlockStorageScreen" component={UnlockStorageScreen} />
          <Stack.Screen name="OnboardUserScreen" component={OnboardUserScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="ImportKeyScreen" component={ImportKeyScreen} />
          <Stack.Screen name="SenderScreen" component={SenderScreen} />
          <Stack.Screen name="ReceiverScreen" component={ReceiverScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthContextProvider>
      <NavigationContainer ref={navigationRef}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar />
          <AuthStack />
        </SafeAreaView>
      </NavigationContainer>
    </AuthContextProvider>
  )
}
