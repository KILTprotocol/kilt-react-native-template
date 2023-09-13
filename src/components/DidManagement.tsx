import { TouchableOpacity, Text, View, TextInput, ScrollView } from 'react-native'
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

    if (fetchedW3n) {
      setW3n(fetchedW3n.toString())
    }
  }
  useEffect(() => {
    handler()
  }, [route.params])
  return (
    <ScrollView style={styles.scroll}>
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
      <View style={styles.buttonContainer}>
        <TextInput style={styles.textInput} placeholder="Name" value={w3n} onChangeText={setW3n} />
        <TouchableOpacity
          style={styles.orangeButton}
          disabled={!w3n}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.navigate('ClaimW3n'),
              params: { w3n },
            })
          }
        >
          <Text style={styles.orangeButtonText}>CLAIM</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.redButton}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.navigate('DID'),
              params: { did: null },
            })
          }
        >
          <Text style={styles.redButtonText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
