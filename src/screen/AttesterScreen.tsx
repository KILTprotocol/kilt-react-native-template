import React, { useState, useEffect, useContext } from 'react'
import { TouchableOpacity, Text, View, ScrollView } from 'react-native'
import { CType, Claim, ConfigService, Credential, Did, ICType, connect } from '@kiltprotocol/sdk-js'
import { useIsFocused } from '@react-navigation/native'

import styles from '../styles/styles'

import { KeyInfo } from '../storage/utils/interfaces'
import getBalance from '../utils/getBalance'

import SelectAccount from '../components/SelectAccount'
import { TextInput } from 'react-native'

export default function AttesterScreen({ navigation, route }) {
  const [account, setAccount] = useState<KeyInfo | null>()
  const [w3n, setW3n] = useState()
  const [balance, setBalance] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const isFocused = useIsFocused()
  useEffect(() => {
    setAccount(route.params.selectAccount)
  }, [route.params])
  useEffect(() => {
    if (!account) return setIsLoading(false)
    setIsLoading(true)
    ;(async () => {
      const accountBalance = await getBalance(account.metadata.address)
      setBalance(accountBalance)
      setIsLoading(false)
    })()
  }, [route.params, isFocused])

  const createAttestation = async function () {
    if (!w3n) return setIsLoading(false)
    const api = await connect('wss://spiritnet.kilt.io/')

    console.log(`Querying the blockchain for the web3name "${w3n}"`)
    const ctype = CType.fromProperties('Proof of Attendance', {
      'event date': {
        format: 'date',
        type: 'string',
      },
      'event name': {
        type: 'string',
      },
    })
    console.log(ctype)

    // Query the owner of the provided web3name.
    const encodedWeb3NameOwner = await api.call.did.queryByWeb3Name(w3n.toLocaleLowerCase())

    if (encodedWeb3NameOwner.isNone) {
      return setIsLoading(false)
    }
    // Extract the DidDocument and other linked information from the encodedWeb3NameOwner.
    const { document } = Did.linkedInfoFromChain(encodedWeb3NameOwner)

    if (!document) {
      return setIsLoading(false)
    }

    const claim = Claim.fromCTypeAndClaimContents(
      ctype,
      {
        'event name': 'Alice',
        'event date': new Date().toDateString(),
      },
      document.uri
    )
    console.log('ia', claim)

    const credential = Credential.fromClaim(claim)
    console.log(credential)
    navigation.dispatch()
  }

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Attester</Text>
      </View>

      <SelectAccount navigation={navigation} route={route} />

      <Text numberOfLines={1} style={styles.rectangleButtonText}>
        {balance && <Text>Balance :{balance}</Text>}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="enter web3name"
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={w3n}
        onChangeText={setW3n}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.redButton}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <Text style={styles.redButtonText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            isLoading || !w3n || !account
              ? { ...styles.orangeButton, ...styles.buttonDisabled }
              : styles.orangeButton
          }
          disabled={isLoading || !w3n}
          onPress={() => {
            createAttestation()
          }}
        >
          <Text style={styles.orangeButtonText}>ATTEST</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
