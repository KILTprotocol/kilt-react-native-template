import React, { useEffect, useState, useContext } from 'react'
import { TouchableOpacity, View, Text, Image } from 'react-native'

import * as DidStore from '../storage/did/store'
import styles from '../styles/styles'
import { DidKeys } from '../utils/interfaces'
import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'
import { ConfigService, DidDocument } from '@kiltprotocol/sdk-js'
import { AuthContext } from '../wrapper/AuthContextProvider'
import getWeb3NameForDid from '../utils/fetchW3n'

export default function SelectDid({ navigation, route }) {
  const [dids, setDids] =
    useState<{ keypairs: DidKeys; document: DidDocument; w3n: string | null }[]>()
  const authContext = useContext(AuthContext)

  const handle = async () => {
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }
    const didsList = await DidStore.list(password)
    const d = await Promise.all(
      didsList.map(async ({ keypairs, document }: { keypairs: DidKeys; document: DidDocument }) => {
        await connect('wss://spiritnet.io')

        const fetchedW3n = await getWeb3NameForDid(document.uri)

        return { keypairs: keypairs, document: document, w3n: fetchedW3n }
      })
    )
    setDids(d)
  }
  useEffect(() => {
    handle()
  }, [])

  return (
    <View style={styles.container}>
      {dids ? (
        dids.map(({ keypairs, document, w3n }, key) => {
          return (
            <View key={key} style={{ paddingTop: '0.5%', paddingBottom: '0.5%' }}>
              <TouchableOpacity
                style={styles.rectangleButtonPurple}
                onPress={() =>
                  navigation.dispatch({
                    ...CommonActions.navigate({
                      name: 'DidManagement',
                      params: { did: { keypairs, document } },
                    }),
                  })
                }
              >
                <Text style={styles.rectangleButtonText}>{w3n ? w3n : document.uri}</Text>
                <View style={{ right: '40%' }}>
                  <Image source={require('../../assets/Manage.png')} />
                </View>
              </TouchableOpacity>
            </View>
          )
        })
      ) : (
        <></>
      )}
    </View>
  )
}
