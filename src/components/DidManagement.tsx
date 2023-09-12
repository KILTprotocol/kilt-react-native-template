import { TouchableOpacity, Text, View, TextInput } from 'react-native'
import styles from '../styles/styles'
import React, { useEffect, useState } from 'react'
import ClaimW3n from './ClaimW3n'
import { CommonActions } from '@react-navigation/native'
import { ConfigService, DidDocument } from '@kiltprotocol/sdk-js'

export default function DidManagement({ navigation, route }) {
  const [did, setDid] = useState<DidDocument | null>()
  const [w3n, setW3n] = useState<string | null>()

  const handler = async () => {
    const api = ConfigService.get('api')
    setDid(route.params.did.document)
    const fetchedW3n = await api.query.web3Names.owner(route.params.did.document.uri)
    console.log(fetchedW3n.toString())
    if (fetchedW3n) {
      setW3n(fetchedW3n.toString())
    }
  }
  useEffect(() => {
    handler()
  }, [route.params])
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DID Manage</Text>
      {did ? (
        <>
          <Text style={styles.text}>{did.uri}</Text>
          <Text style={styles.text}>authentication: {did.authentication[0].id.substring(1)}</Text>
          <Text style={styles.text}>
            key agreement: {did.keyAgreement ? did.keyAgreement[0].id.substring(1) : null}
          </Text>
          <Text style={styles.text}>
            assetion method:
            {did.assertionMethod ? did.assertionMethod[0].id.substring(1) : null}
          </Text>
          <Text style={styles.text}>
            delegation:
            {did.capabilityDelegation ? did.capabilityDelegation[0].id.substring(1) : null}
          </Text>
        </>
      ) : null}

      <>
        <TextInput style={styles.textInput} placeholder="Name" value={w3n} onChangeText={setW3n} />

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.navigate('ClaimW3n'),
              params: { w3n },
            })
          }
        >
          <Text>Claim w3n name</Text>
        </TouchableOpacity>
      </>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() =>
          navigation.dispatch({
            ...CommonActions.navigate('Identity'),
            params: { did: null },
          })
        }
      >
        <Text>Go Back</Text>
      </TouchableOpacity>
    </View>
  )
}
