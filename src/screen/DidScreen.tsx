import { TouchableOpacity, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

import styles from '../styles/styles'

import CreateDid from '../components/CreateDid'
import SelectDid from '../components/SelectDid'

export default function DidScreen({ navigation, route }) {
  const [dids, setDids] = useState()
  const [toggleDidCreation, setToggleDidCreation] = useState(false)
  useEffect(() => {
    if (!route.params?.selectAccount.metadata) return
    const { address } = route.params?.selectAccount.metadata
    setDids(address)
  }, [route.params?.selectAccount])
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DIDs</Text>
      {toggleDidCreation ? <CreateDid navigation={navigation} route={route} /> : null}
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => setToggleDidCreation(!toggleDidCreation)}
      >
        <Text>Create a DID</Text>
      </TouchableOpacity>
      <SelectDid navigation={navigation} route={route} />
    </View>
  )
}
