import {
  TouchableOpacity,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native'
import styles from '../styles/styles'
import React, { useEffect, useState } from 'react'

import { CommonActions } from '@react-navigation/native'
import { DidDocument, connect } from '@kiltprotocol/sdk-js'
import SelectCredential from './SelectCredential'

export default function DidManagement({ navigation, route }) {
  const did = route.params.did.document as DidDocument
  const [w3n, setW3n] = useState<string | null>()
  const [w3nInput, setW3nInput] = useState<string>()

  useEffect(() => {
    ;(async () => {
      const api = await connect('wss://peregrine.kilt.io/parachain-public-ws/')
      const fetchedW3n = await api.query.web3Names.owner(did.uri)

      if (fetchedW3n) {
        setW3n(fetchedW3n.toString())
      }
    })()
  }, [did])

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={{ ...styles.header, backgroundColor: 'rgba(249,105,67,0.2)', marginBottom: 6 }}>
        <Text style={styles.headerText}>Inspect Identity</Text>
      </View>
      {/* <SelectCredential navigation={navigation} route={route} /> */}

      <ScrollView>
        <View
          style={{
            backgroundColor: 'rgba(249,105,67,0.2)',
            flex: 1,
            paddingVertical: 24,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ ...styles.text, marginBottom: 12 }}>DID</Text>
          <Text style={{ ...styles.text, marginBottom: 20 }}>{did.uri}</Text>

          <Text style={{ ...styles.text, marginBottom: 12 }}>web3name</Text>
          {w3n ? (
            <Text>{w3n}</Text>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                gap: 8,
                alignSelf: 'center',
                marginBottom: 26,
              }}
            >
              <TextInput
                style={{ ...styles.input, flex: 1 }}
                placeholder="Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                onChangeText={setW3nInput}
              />
              <TouchableOpacity
                style={{ ...styles.orangeButton, height: 30, width: 100, marginVertical: 0 }}
                disabled={!w3nInput}
                onPress={() =>
                  navigation.dispatch({
                    ...CommonActions.navigate('ClaimW3n'),
                    params: { w3n: w3nInput },
                  })
                }
              >
                <Text style={styles.orangeButtonText}>CLAIM</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ borderTopWidth: 1, borderTopColor: '#979797' }}>
            <View style={styles.keyContainer}>
              <Text style={{ ...styles.text, marginBottom: 10 }}>Authentication Key</Text>
              <Text style={styles.text}>{did.authentication[0].id.substring(1)}</Text>
            </View>

            {did.keyAgreement && (
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Key Agreement Key</Text>
                <Text style={styles.text}>{did.keyAgreement[0].id.substring(1)}</Text>
              </View>
            )}

            {did.assertionMethod && (
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Assertion Method Key</Text>
                <Text style={styles.text}>{did.assertionMethod[0].id.substring(1)}</Text>
              </View>
            )}

            {did.capabilityDelegation && (
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Delegation Key</Text>
                <Text style={styles.text}>{did.capabilityDelegation[0].id.substring(1)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.redButton}
            onPress={() =>
              navigation.dispatch({
                ...CommonActions.navigate('Identity'),
                params: { did: null },
              })
            }
          >
            <Text style={styles.redButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
