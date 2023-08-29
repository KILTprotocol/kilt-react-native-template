import React, { useContext, useEffect, useState } from 'react'
import { connect, Did, ConfigService } from '@kiltprotocol/sdk-js'

import { navigationRef } from './RootNavigation'
import { StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import UnlockStorageScreen from './screens/UnlockStorageScreen'
import OnboardUserScreen from './screens/OnboardUserScreen'
import KeysSignConsentView from './runtime/modules/keys/KeysSignConsent'
import KeysEncryptConsentView from './runtime/modules/keys/KeysEncryptConsent'
import KeysDecryptConsentView from './runtime/modules/keys/KeysDecryptConsent'
import KeysListConsentView from './runtime/modules/keys/KeysListConsent'
import GenericConsentView from './runtime/utils/GenericConsentScreen'
import CredentialStoreConsentView from './runtime/modules/credentialapi/CredentialStoreConsent'
import DidSelectView from './runtime/modules/credentialapi/DidSelectView'
import CredentialSelectView from './runtime/modules/credentialstore/CredentialSelectView'
import PopupApp from './runtime/modules/core/PopupApp'
import AuthContextProvider, { AuthContext } from './runtime/modules/storage/auth-context'
import styles from './styles/styles'
import YesNo from './runtime/utils/YesNo'

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
  })
  return (
    <View style={styles.container}>
      <Text style={styles.text}>come on DID get your ass here: {did}</Text>
      <TouchableOpacity style={styles.text} onPress={() => authContext.logout()}>
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          /* 1. Navigate to the Details route with params */
          navigation.navigate('YesNo', {
            title: 86,
            children: 'anything you want here',
            origin: 'Main',
          })
        }}
      >
        <Text style={styles.text}>Go to Yes or No</Text>
      </TouchableOpacity>
    </View>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UnlockStorageScreen" component={UnlockStorageScreen} />
      <Stack.Screen name="OnboardUserScreen" component={OnboardUserScreen} />
    </Stack.Navigator>
  )
}

function AuthUser() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="YesNo" component={YesNo} />
      <Stack.Screen name="KeysSignConsentView" component={KeysSignConsentView} />
      <Stack.Screen name="KeysEncryptConsentView" component={KeysEncryptConsentView} />
      <Stack.Screen name="KeysDecryptConsentView" component={KeysDecryptConsentView} />
      <Stack.Screen name="KeysListConsentView" component={KeysListConsentView} />
      <Stack.Screen name="GenericConsentView" component={GenericConsentView} />
      <Stack.Screen name="CredentialStoreConsentView" component={CredentialStoreConsentView} />
      <Stack.Screen name="DidSelectView" component={DidSelectView} />
      <Stack.Screen name="CredentialSelectView" component={CredentialSelectView} />
    </Stack.Navigator>
  )
}

function Auth() {
  const authContext = useContext(AuthContext)

  useEffect(() => {
    console.log('authContext', authContext)
  }, [authContext])

  return <>{!authContext.isAuthenticated ? <AuthStack /> : <AuthUser />}</>
}

export default function App() {
  return (
    <AuthContextProvider>
      <NavigationContainer ref={navigationRef}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar />
          <Auth />
        </SafeAreaView>
      </NavigationContainer>
    </AuthContextProvider>
  )
}
