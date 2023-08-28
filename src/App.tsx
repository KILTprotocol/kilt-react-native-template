import React, { useEffect, useState } from 'react'
import { connect, Did, ConfigService } from '@kiltprotocol/sdk-js'

import { navigationRef } from './RootNavigation'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import UnlockStorageScreen from './runtime/modules/storage/UnlockStorage'
import OnboardUser from './runtime/modules/storage/OnboardUser'
import KeysSignConsentView from './runtime/modules/keys/KeysSignConsent'
import KeysEncryptConsentView from './runtime/modules/keys/KeysEncryptConsent'
import KeysDecryptConsentView from './runtime/modules/keys/KeysDecryptConsent'
import KeysListConsentView from './runtime/modules/keys/KeysListConsent'
import GenericConsentView from './runtime/utils/GenericConsentScreen'
import CredentialStoreConsentView from './runtime/modules/credentialapi/CredentialStoreConsent'
import DidSelectView from './runtime/modules/credentialapi/DidSelectView'
import CredentialSelectView from './runtime/modules/credentialstore/CredentialSelectView'
import PopupApp from './runtime/modules/core/PopupApp'

const Stack = createNativeStackNavigator()

interface Styles {
  container: {
    flex: number
    backgroundColor: string
    alignItems: 'center'
    justifyContent: 'center'
  }
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

function Main() {
  const [did, setDid] = useState('Fetching the Did Uri')
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
  })
  return (
    <View>
      <Text>come on DID get your ass here: {did}</Text>
    </View>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen name="main" component={Main} /> */}
      <Stack.Screen name="PopupApp" component={PopupApp} />
      <Stack.Screen name="UnlockStorageScreen" component={UnlockStorageScreen} />
      <Stack.Screen name="OnboardUser" component={OnboardUser} />
      {/* <Stack.Screen name="KeysSignConsentView" component={KeysSignConsentView} />
  <Stack.Screen name="KeysEncryptConsentView" component={KeysEncryptConsentView} />
  <Stack.Screen name="KeysDecryptConsentView" component={KeysDecryptConsentView} />
  <Stack.Screen name="KeysListConsentView" component={KeysListConsentView} />
  <Stack.Screen name="GenericConsentView" component={GenericConsentView} />
  <Stack.Screen name="CredentialStoreConsentView" component={CredentialStoreConsentView} />
  <Stack.Screen name="DidSelectView" component={DidSelectView} />
  <Stack.Screen name="CredentialSelectView" component={CredentialSelectView} /> */}
    </Stack.Navigator>
  )
}

function AuthUser() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="main" component={Main} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar />
        <AuthStack />
        <AuthUser />
      </SafeAreaView>
    </NavigationContainer>
  )
}
