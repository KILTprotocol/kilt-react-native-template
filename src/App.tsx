import React, { useContext, useEffect } from 'react'
import { navigationRef } from './components/RootNavigation'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
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
import { useColorScheme } from 'react-native'

// style =

// {keyboardHidesTabBar -> tabBarHideOnKeyboard
// activeTintColor -> tabBarActiveTintColor
// inactiveTintColor -> tabBarInactiveTintColor
// activeBackgroundColor -> tabBarActiveBackgroundColor
// inactiveBackgroundColor -> tabBarInactiveBackgroundColor
// allowFontScaling -> tabBarAllowFontScaling
// showLabel -> tabBarShowLabel
// labelPosition -> tabBarLabelPosition
// labelStyle -> tabBarLabelStyle
// iconStyle -> tabBarIconStyle
// tabStyle -> tabBarItemStyle
// style -> tabBarStyle}

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function Main({ navigation }) {
  useEffect(() => {
    const connection = async () => await connect('wss://spiritnet.kilt.io')

    connection()
  })
  return (
    <Tab.Navigator
      initialRouteName="Identity"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === 'Account') {
            iconName = focused ? 'ios-information-circle' : 'ios-information-circle-outline'
          } else if (route.name === 'Settings') {
            iconName = focused ? 'ios-list' : 'ios-list-outline'
          } else if (route.name === 'Identity') {
            iconName = focused ? 'ios-list' : 'ios-list-outline'
          }

          // You can return any component that you like here!
          // return <Ionicons name={iconName} size={size} color={color} />
          return <> </>
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
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
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
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
      }}
    >
      {!authContext.isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Unlock Nessie" component={UnlockStorageScreen} />
          <Stack.Screen name="New Nessie User" component={OnboardUserScreen} />
        </Stack.Group>
      ) : (
        <>
          <Stack.Group>
            <Stack.Screen
              options={{
                headerStyle: {
                  backgroundColor: '#440031',
                },
                headerTitleAlign: 'left',

                headerShown: false,
              }}
              name="Nessie"
              component={Main}
            />
            <Stack.Screen name="Export Storage" component={ExportStorageScreen} />
          </Stack.Group>
          <Stack.Group>
            <Stack.Screen name="ClaimW3n" component={ClaimW3n} />
            <Stack.Screen name="ImportKey" component={ImportKey} />
            <Stack.Screen name="TokenSender" component={TokenSender} />
            <Stack.Screen name="TokenReceiver" component={TokenReceiver} />
            <Stack.Screen name="SelectAccount" component={SelectAccount} />
            <Stack.Screen name="CreateDid" component={CreateDid} />
            <Stack.Screen name="SelectDid" component={SelectDid} />
            <Stack.Screen name="QrScanner" component={QrScanner} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  const scheme = useColorScheme()

  return (
    <AuthContextProvider>
      <NavigationContainer ref={navigationRef}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar backgroundColor="#440031" style="light" />
          <AuthStack />
        </SafeAreaView>
      </NavigationContainer>
    </AuthContextProvider>
  )
}
