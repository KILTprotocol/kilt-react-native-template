import React, { useContext, useEffect, useState } from 'react'
import { connect, Did, ConfigService } from '@kiltprotocol/sdk-js'

import { navigationRef } from './RootNavigation'
import { StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import UnlockStorageScreen from './pages/UnlockStorageScreen'
import OnboardUserScreen from './pages/OnboardUserScreen'
import KeysSignConsentView from './runtime/modules/keys/KeysSignConsent'
import KeysEncryptConsentView from './runtime/modules/keys/KeysEncryptConsent'
import KeysDecryptConsentView from './runtime/modules/keys/KeysDecryptConsent'
import KeysListConsentView from './runtime/modules/keys/KeysListConsent'
import GenericConsentView from './runtime/utils/GenericConsentScreen'
import CredentialStoreConsentView from './runtime/modules/credentialapi/CredentialStoreConsent'
import DidSelectView from './runtime/modules/credentialapi/DidSelectView'
import CredentialSelectView from './runtime/modules/credentialstore/CredentialSelectView'
import PopupApp from './runtime/modules/core/PopupApp'
import AuthContextProvider, { AuthContext } from './wrapper/AuthContextProvider'
import styles from './styles/styles'
import YesNo from './components/YesNo'
import { AppDrawer } from './runtime/modules/core/AppDrawer'
import ImportKeyScreen from './pages/ImportKeyScreen'
import RuntimeContextProvider, { RuntimeContext } from './wrapper/RuntimeContextProvider'
import ReceiverScreen from './pages/ReceiverScreen'
import SenderScreen from './pages/SenderScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createNativeStackNavigator()

function Main({ navigation }) {
  const [did, setDid] = useState('Fetching the Did Uri')
  const authContext = useContext(AuthContext)
  const [initialised] = useContext(RuntimeContext)

  useEffect(() => {
    const fetchDid = async () => {
      await connect('wss://peregrine.kilt.io')
      const web3Name = 'john_doe'
      const api = ConfigService.get('api')

      console.log(`Querying the blockchain for the web3name "${web3Name}"`)
      // // Query the owner of the provided web3name.
      // const encodedWeb3NameOwner = await api.call.did.queryByWeb3Name(web3Name)

      // const { document } = Did.linkedInfoFromChain(encodedWeb3NameOwner)

      // setDid(document.uri || 'unknown')
    }
    fetchDid()
  }, [did])

  // useEffect(() => {
  //   if (!initialised.nessieRuntime || !initialised.nessieRuntime.getKeysApi()) return

  //   const keys = initialised.nessieRuntime?.getKeysApi()
  //   console.log(
  //     'I am something',
  //     keys.list().then((val) => console.log(val[0].name))
  //   )
  // }, [])
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
// <TouchableOpacity
//   onPress={() => {
//     navigation.navigate('YesNo', {
//       title: 86,
//       children: 'anything you want here',
//       origin: 'Main',
//     })
//   }}
// >
//   <Text style={styles.text}>Go to Yes or No</Text>
// </TouchableOpacity>

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
          <Stack.Screen name="YesNo" component={YesNo} />
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
      <RuntimeContextProvider>
        <NavigationContainer ref={navigationRef}>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <AuthStack />
          </SafeAreaView>
        </NavigationContainer>
      </RuntimeContextProvider>
    </AuthContextProvider>
  )
}
