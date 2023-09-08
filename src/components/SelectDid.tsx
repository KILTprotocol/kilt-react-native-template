import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import * as DidStore from '../storage/did/store'
import styles from '../styles/styles'
import { DidKeys } from '../utils/interfaces'
import { getStorage } from '../storage/storage'
import { CommonActions } from '@react-navigation/native'
import { DidDocument } from '@kiltprotocol/sdk-js'

export default function SelectDid({ navigation, route }) {
  const [dids, setDids] = useState<{ keypairs: DidKeys; document: DidDocument }[]>()

  const handle = async () => {
    const password = await getStorage('session-password', 'Enter your password')
    if (!password) return alert('No Password')
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
    <View>
      {dids ? (
        dids.map(({ keypairs, document }, key) => {
          return (
            <View key={key}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() =>
                  navigation.dispatch({
                    ...CommonActions.goBack(),
                    ...CommonActions.setParams({ did: { keypairs, document } }),
                  })
                }
              >
                <Text>{document.uri}</Text>
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
