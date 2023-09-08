import { TouchableOpacity, Text, View } from 'react-native'
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
    console.log(didFetched?.web3Name)
  }

  useEffect(() => {
    if (!route.params) return
    setDid(route.params.did)

    console.log(fetch())
  }, [route.params])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>DIDs</Text>

      {did ? (
        <ClaimW3n navigation={navigation} route={route} />
      ) : (
        <SelectDid navigation={navigation} route={route} />
      )}

      {!!toggleDidCreation ? (
        <CreateDid navigation={navigation} route={route} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => setToggleDidCreation(!toggleDidCreation)}
          >
            <Text>Create a DID</Text>
          </TouchableOpacity>
        </>
      )}

      {did ? (
        <TouchableOpacity style={styles.loginBtn} onPress={fetch}>
          <Text>Get Web3Name</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}
