import React from 'react'
import { View, Text, Image } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import UnlockStorageScreen from '../storage/UnlockStorage'
import ListKeys from '../keys/ListKeys'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

// import { Header } from './Header'
import { AppDrawer } from './AppDrawer'
import { Copyright } from './Copyright'
import { NessieRuntime } from '../../index'

import ImportKey from '../keys/ImportKey'
import KeysSign from '../keys/KeysSign'
import KeysEncrypt from '../keys/KeysEncrypt'
// import KeysDecrypt from '../keys/KeysDecrypt'

import DidsList from '../dids/DidsList'
import { DidsCreate } from '../dids/DidsCreate'
import { DidsImport } from '../dids/DidsImport'
import { DidsEdit } from '../dids/DidsEdit'

import CredentialsList from '../credentialstore/CredentialsList'

export default function PopupApp({ navigation, route }) {
  const [masterPassword, setMasterPassword] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [runtime, setRuntime] = React.useState<NessieRuntime | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [currentComponent, setCurrentComponent] = React.useState(() => (
    <View>{/* <Image source={'logo.png'} style={{ width: '80%', marginTop: '5%' }} /> */}</View>
  ))

  // const urlParams = new URLSearchParams(window.location.search)
  // const fullscreen = urlParams.get('__fullscreen') !== null

  const checkForCachedPassword = async (): Promise<void> => {
    // const result = await SecureStore.getItemAsync('nessie-password')
    const result = null
    if (result !== null) {
      setMasterPassword(result)
    }

    setLoading(false)
  }
  const handler = (password: string) => {
    setMasterPassword(password)
  }
  React.useEffect((): void => {
    checkForCachedPassword().catch(console.error)
  }, [])

  React.useEffect((): void => {
    if (masterPassword !== '') {
      const runtime = new NessieRuntime(masterPassword)
      runtime
        .unlock()
        .then(() => {
          setRuntime(runtime)
        })
        .catch((e: any) => {
          console.error(e)
          setMasterPassword('')
        })
    }
  }, [masterPassword])

  // const getScreen = (module: string, screen: string): JSX.Element => {
  //   if (runtime === null) {
  //     return <View>Runtime not initialized</View>
  //   }
  //   switch (module) {
  //     case 'keys':
  //       switch (screen) {
  //         // case 'list':
  //         //   return <ListKeys runtime={runtime} />
  //         // case 'import':
  //         //   return <ImportKey runtime={runtime} />
  //         // case 'sign':
  //         //   return <KeysSign runtime={runtime} />
  //         // case 'encrypt':
  //         //   return <KeysEncrypt runtime={runtime} />
  //         // case 'decrypt':
  //         //   return <KeysDecrypt runtime={runtime} />
  //         default:
  //           return <View>Unknown screen</View>
  //       }
  //     case 'dids':
  //       switch (screen) {
  //         // case 'list':
  //         //   return <DidsList runtime={runtime} />
  //         // case 'create':
  //         //   return <DidsCreate runtime={runtime} />
  //         // case 'import':
  //         //   return <DidsImport runtime={runtime} />
  //         // case 'edit':
  //         //   return <DidsEdit runtime={runtime} />
  //         default:
  //           return <View>Unknown screen</View>
  //       }
  //     case 'credentials':
  //       switch (screen) {
  //         case 'list':
  //         // return <CredentialsList runtime={runtime} />
  //         default:
  //           return <View>Unknown screen</View>
  //       }
  //     default:
  //       return <View>Unknown module</View>
  //   }
  // }
  console.log(masterPassword)
  return (
    <View>
      {/* <AppDrawer
        open={drawerOpen}
        variant={'temporary'}
        entries={[
          {
            name: 'dids',
            displayName: 'DIDs',
            screens: [
              {
                name: 'list',
                displayName: 'List',
                icon: () => <MaterialCommunityIcons name="home" color={'green'} />,
              },
              {
                name: 'import',
                displayName: 'Import',
                icon: () => <MaterialCommunityIcons name="account-plus" color={'green'} />,
              },
              {
                name: 'create',
                displayName: 'Create',
                icon: () => <MaterialCommunityIcons name="account-plus" color={'green'} />,
              },
              {
                name: 'edit',
                displayName: 'Edit',
                icon: () => <MaterialCommunityIcons name="file-edit" color={'green'} />,
              },
            ],
          },
          {
            name: 'credentials',
            displayName: 'Credentials',
            screens: [
              {
                name: 'list',
                displayName: 'List',
                icon: () => <MaterialCommunityIcons name="credit-card" color={'green'} />,
              },
            ],
          },
          {
            name: 'keys',
            displayName: 'Keys',
            screens: [
              {
                name: 'list',
                displayName: 'List',
                icon: () => <MaterialCommunityIcons name="vpn" color={'green'} />,
              },
              {
                name: 'import',
                displayName: 'Import',
                icon: () => <MaterialCommunityIcons name="plus-circle-outline" color={'green'} />,
              },
              {
                name: 'sign',
                displayName: 'Sign',
                icon: () => <MaterialCommunityIcons name="mail" color={'green'} />,
              },
              {
                name: 'encrypt',
                displayName: 'Encrypt',
                icon: () => <MaterialCommunityIcons name="account-lock" color={'green'} />,
              },
              {
                name: 'decrypt',
                displayName: 'Decrypt',
                icon: () => <MaterialCommunityIcons name="lock-open" color={'green'} />,
              },
            ],
          },
        ]}
        closeDrawer={() => {
          setDrawerOpen(false)
        }}
        setScreen={(module: string, screen: string) => {
          const component = getScreen(module, screen)
          setCurrentComponent(component)
          setDrawerOpen(false)
        }}
      /> */}
      {/* <Header
        openDrawer={() => {
          setDrawerOpen(true)
        }}
        isFullscreen={fullscreen}
      /> */}
      {loading ? <Text>Loading...</Text> : null}
      {!loading && masterPassword === '' ? (
        <UnlockStorageScreen onUnlock={handler} navigation route />
      ) : null}
      {runtime !== null ? currentComponent : null}

      {masterPassword ? <Text>I am something</Text> : null}
      {/* <Copyright /> */}
    </View>
  )
}
