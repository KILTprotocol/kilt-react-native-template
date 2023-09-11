import { TextInput, View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'

import styles from '../styles/styles'

import { KeyInfo } from '../utils/interfaces'

import Keyring from '@polkadot/keyring'
import { CommonActions } from '@react-navigation/native'

export default function TokenSender({ navigation, route }): JSX.Element {
  const [senderAccount, setSenderAccount] = useState(null)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    console.log(route.params, 'route.params?')
    setSenderAccount(route.params?.selectAccount)
  }, [route.params?.selectAccount])

  useEffect(() => {
    setReceiverAddress(route.params?.scanAddress)
  }, [route.params?.scanAddress])

  const handler = async () => {
    if (!senderAccount || !receiverAddress || (!senderAccount && !receiverAddress)) {
      throw new Error('get an account ')
    }
    console.log('senderAccount.metadata.type,', senderAccount.metadata.type)
    const keyring = new Keyring({
      type: senderAccount.metadata.type,
      ss58Format: 38,
    })

    const account = keyring.addFromMnemonic(senderAccount.mnemonic)

    console.log('i am the account', amount)
    const api = Kilt.ConfigService.get('api')
    const transferTx = api.tx.balances.transfer(
      receiverAddress,
      Kilt.BalanceUtils.toFemtoKilt(amount)
    )
    await Kilt.Blockchain.signAndSubmitTx(transferTx, account, {}).catch((e) => console.log(e))
    console.log('finalised')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Send Tokens</Text>
      <Text style={styles.text}>Choose an Account</Text>

      {!senderAccount ? null : (
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.navigate('Account'),
              params: { selectAccount: null },
            })
          }
        >
          <Text>Go Back</Text>
        </TouchableOpacity>
      )}

      <View>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('QrScanner')}>
          <Text>Scan Address</Text>
        </TouchableOpacity>
        <Text style={styles.text}>Scan for an Address or Enter an address manually </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter an address"
          value={receiverAddress}
          onChangeText={setReceiverAddress}
        />
      </View>

      <Text style={styles.textInput}>Enter an amount to send</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Set Amount to send"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.loginBtn} onPress={() => handler()}>
        <Text>Send Tokens</Text>
      </TouchableOpacity>
    </View>
  )
}
