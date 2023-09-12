import React, { useContext, useEffect } from 'react'
import { navigationRef } from './components/RootNavigation'
import { Image, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { connect } from '@kiltprotocol/sdk-js'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import OnboardUserScreen from './screen/OnboardUserScreen'
import UnlockStorageScreen from './screen/UnlockStorageScreen'
import AuthContextProvider, { AuthContext } from './wrapper/AuthContextProvider'
import QrScanner from './components/QrScanner'
import DidScreen from './screen/DidScreen'
import SelectAccount from './components/SelectAccount'
import SelectDid from './components/SelectDid'
import CreateDid from './components/CreateDid'
import ClaimW3n from './components/ClaimW3n'
import SettingScreen from './screen/SettingScreen'
import ImportKey from './components/ImportKey'
import TokenReceiver from './components/TokenReceiver'
import TokenSender from './components/TokenSender'
import AccountScreen from './screen/AccountScreen'
import ExportStorageScreen from './screen/ExportStorageScreen'
import styles from './styles/styles'
import DidManagement from './components/DidManagement'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function Main({ navigation }) {
  useEffect(() => {
    const connection = async () => await connect('wss://spiritnet.kilt.io')

    connection()
  })
  return (
    <Tab.Navigator initialRouteName="Identity" screenOptions={TabNavigatorStyles}>
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Identity" component={DidScreen} options={{}} />
      <Tab.Screen name="Settings" component={SettingScreen} />
    </Tab.Navigator>
  )
}

function AuthStack() {
  const authContext = useContext(AuthContext)

  useEffect(() => {}, [authContext])

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#440031',
        },
        headerTitleAlign: 'left',
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      {!authContext.isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Unlock Nessie" component={UnlockStorageScreen} />
          <Stack.Screen name="New Nessie User" component={OnboardUserScreen} />
        </Stack.Group>
      ) : (
        <>
          <Stack.Group screenOptions={{}}>
            <Stack.Screen name="Nessie" component={Main} />
            <Stack.Screen name="Export Storage" component={ExportStorageScreen} />

            <Stack.Screen name="ClaimW3n" component={ClaimW3n} />
            <Stack.Screen name="ImportKey" component={ImportKey} />
            <Stack.Screen name="TokenSender" component={TokenSender} />
            <Stack.Screen name="TokenReceiver" component={TokenReceiver} />
            <Stack.Screen name="SelectAccount" component={SelectAccount} />
            <Stack.Screen name="CreateDid" component={CreateDid} />
            <Stack.Screen name="SelectDid" component={SelectDid} />
            <Stack.Screen name="QrScanner" component={QrScanner} />
            <Stack.Screen name="DidManagement" component={DidManagement} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthContextProvider>
      <NavigationContainer ref={navigationRef}>
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor="#440031" style="light" />
          <AuthStack />
        </SafeAreaView>
      </NavigationContainer>
    </AuthContextProvider>
  )
}

const TabNavigatorStyles = ({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => {
    if (route.name === 'Account') {
      return !focused ? (
        <Image source={require('../assets/Accounts.png')} />
      ) : (
        <Image source={require('../assets/account_focused.png')} />
      )
    } else if (route.name === 'Settings') {
      return !focused ? (
        <Image source={require('../assets/Settings.png')} />
      ) : (
        <Image source={require('../assets/setting_focused.png')} />
      )
    } else if (route.name === 'Identity') {
      return !focused ? (
        <Image source={require('../assets/Identity_small_1.png')} />
      ) : (
        <Image source={require('../assets/identity_focused.png')} />
      )
    }
  },
  tabBarActiveTintColor: 'tomato',
  tabBarInactiveTintColor: 'white',
  headerStyle: {
    backgroundColor: '#440031',
    shadowColor: 'transparent',
  },
  headerTitleAlign: 'left',
  borderColor: 'transparent',

  tabBarStyle: {
    // height: '79px',
    backgroundColor: '#440031',
    borderTopColor: 'transparent',
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
})
