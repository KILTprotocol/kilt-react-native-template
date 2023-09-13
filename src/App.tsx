import React, { useContext, useEffect } from 'react'
import { navigationRef } from './components/RootNavigation'
import { Image, TouchableOpacity, Text, SafeAreaView } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { connect } from '@kiltprotocol/sdk-js'
import { StatusBar } from 'expo-status-bar'
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
import TokenReceiver from './components/TokenReceiver'
import TokenSender from './components/TokenSender'
import AccountScreen from './screen/AccountScreen'
import DidManagement from './components/DidManagement'
import { removeStorage } from './storage/storage'
import Warning from './components/Warning'
import AddAccount from './components/AddAccount'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function Main({ navigation }) {
  const authContext = useContext(AuthContext)

  useEffect(() => {}, [authContext])
  return (
    <Tab.Navigator
      initialRouteName="Identity"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Accounts') {
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
          backgroundColor: '#530832',
          shadowColor: 'transparent',
        },
        headerTitleAlign: 'left',
        borderColor: 'transparent',

        tabBarStyle: {
          backgroundColor: '#530832',
          borderTopColor: 'transparent',
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackVisible: false,
      })}
    >
      <Tab.Screen name="Accounts" component={AccountScreen} />
      <Tab.Screen name="Identity" component={DidScreen} />
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
          backgroundColor: '#530832',
        },
        headerTitleAlign: 'left',
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackVisible: false,

        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              await removeStorage('session-password')
              authContext.logout()
            }}
          >
            <Text style={{ color: 'white' }}>Log out</Text>
          </TouchableOpacity>
        ),
      }}
    >
      {!authContext.isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Unlock Nessie" component={UnlockStorageScreen} />
          <Stack.Screen name="New Nessie User" component={OnboardUserScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Nessie" component={Main} />
          <Stack.Screen name="ClaimW3n" component={ClaimW3n} />
          <Stack.Screen name="Add Account" component={AddAccount} />
          <Stack.Screen name="TokenSender" component={TokenSender} />
          <Stack.Screen name="TokenReceiver" component={TokenReceiver} />
          <Stack.Screen name="SelectAccount" component={SelectAccount} />
          <Stack.Screen name="CreateDid" component={CreateDid} />
          <Stack.Screen name="SelectDid" component={SelectDid} />
          <Stack.Screen name="QrScanner" component={QrScanner} />
          <Stack.Screen name="DidManagement" component={DidManagement} />
          <Stack.Screen name="Warning" component={Warning} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthContextProvider>
      <NavigationContainer ref={navigationRef}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#530832' }}>
          <StatusBar backgroundColor="#440031" style="light" />
          <AuthStack />
        </SafeAreaView>
      </NavigationContainer>
    </AuthContextProvider>
  )
}
