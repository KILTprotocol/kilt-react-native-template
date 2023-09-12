import { Did } from '@kiltprotocol/sdk-js'

import { TouchableOpacity, Text, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import styles from '../styles/styles'
import SelectDid from '../components/SelectDid'
import { CommonActions } from '@react-navigation/native'

export default function DidScreen({ navigation, route }) {
  const [did, setDid] = useState()

  const fetch = async () => {
    if (!did) return
    const didFetched = await Did.resolve(JSON.parse(JSON.stringify(did)).document.uri)
    console.log('issue', didFetched?.web3Name)
  }

  useEffect(() => {
    if (!route.params) return
    setDid(route.params.did)

    fetch()
  }, [route.params])

  return (
    <ScrollView style={styles.scroll}>
      <View style={{ paddingTop: '16.33%', alignItems: 'center', paddingBottom: '15%' }}>
        <Image source={require('../../assets/Group.png')} />
        <Text
          style={{
            color: 'white',
            fontSize: 16,
          }}
        >
          Nessie
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 12,
          }}
        >
          your Identity wallet
        </Text>
      </View>

      <SelectDid navigation={navigation} route={route} />

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() =>
          navigation.dispatch({
            ...CommonActions.navigate({
              name: 'CreateDid',
              params: { selectAccount: null },
            }),
          })
        }
      >
        <Text>Create a DID</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
