import { TouchableOpacity, Text, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from '../styles/styles'

import CreateDid from '../components/CreateDid'
import SelectDid from '../components/SelectDid'
import ClaimW3n from '../components/ClaimW3n'
import { Did } from '@kiltprotocol/sdk-js'

export default function DidScreen({ navigation, route }) {
  const [toggleDidCreation, setToggleDidCreation] = useState(false)
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
      <View >
        <View style={{ paddingTop: '16.33$' }}>
          <Image source={require('../../assets/Group.png')} />
          <Text style={styles.text}>Nessie</Text>
          <Text>your Identity wallet</Text>
        </View>

        {did ? (
          <ClaimW3n navigation={navigation} route={route} />
        ) : (
          <SelectDid navigation={navigation} route={route} />
        )}

        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('CreateDid')}>
          <Text>Create a DID</Text>
        </TouchableOpacity>

        {/* 
      {did ? (
        <TouchableOpacity style={styles.loginBtn} onPress={fetch}>
          <Text>Get Web3Name</Text>
        </TouchableOpacity>
      ) : null} */}
      </View>
    </ScrollView>
  )
}
