import React, { useEffect, useState, useContext } from 'react'
import { TouchableOpacity, View, Text, Image } from 'react-native'

import * as DidStore from '../storage/did/store'
import styles from '../styles/styles'
import { DidKeys } from '../utils/interfaces'
import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'
import { DidDocument } from '@kiltprotocol/sdk-js'
import { AuthContext } from '../wrapper/AuthContextProvider'

export default function SelectDid({ navigation, route }) {
  const [dids, setDids] = useState<{ keypairs: DidKeys; document: DidDocument }[]>()
  const authContext = useContext(AuthContext)

  const handle = async () => {
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }
    const didsList = await DidStore.list(password)
    const d = didsList.map(
      ({ keypairs, document }: { keypairs: DidKeys; document: DidDocument }) => {
        return JSON.parse(JSON.stringify({ keypairs, document }))
      }
    )
    setDids(d)
  }
  useEffect(() => {
    handle()
  }, [])

  return (
    <View style={styles.container}>
      {dids ? (
        dids.map(({ keypairs, document }, key) => {
          return (
            <View key={key} style={{ paddingTop: '0.5%', paddingBottom: '0.5%' }}>
              <TouchableOpacity
                style={[key % 2 === 0 ? styles.rectangleButtonPink : styles.rectangleButtonPurple]}
                onPress={() =>
                  navigation.dispatch({
                    ...CommonActions.goBack(),
                    ...CommonActions.setParams({ did: { keypairs, document } }),
                  })
                }
              >
                <View style={styles.rectangleButtonContainer}>
                  <Text style={styles.rectangleButtonText}>{document.uri}</Text>
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
