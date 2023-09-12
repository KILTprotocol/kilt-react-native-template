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
  const [balance, setBalance] = useState()

  useEffect(() => {
    setReceiverAddress(route.params?.scanAddress)
    setSenderAccount(route.params?.selectAccount)
  }, [route.params])

  useEffect(() => {
    if (!senderAccount) return
    const handler = async () => {
      const api = Kilt.ConfigService.get('api')

      const balances = await api.query.system.account(senderAccount.metadata.address)
      const freeBalance = Kilt.BalanceUtils.fromFemtoKilt(balances.data.free)
      setBalance(freeBalance.toString())
    }
    handler()
  }, [senderAccount])

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

    const api = Kilt.ConfigService.get('api')
    const transferTx = api.tx.balances.transfer(
      receiverAddress,
      Kilt.BalanceUtils.toFemtoKilt(amount)
    )
    await Kilt.Blockchain.signAndSubmitTx(transferTx, account, {}).catch((e) => console.log(e))
    console.log('finalised')
  }

  return (
    <View>
      <Text style={styles.text}>Send Tokens</Text>
      <Text style={styles.text}>Choose an Account</Text>

      {!senderAccount ? null : (
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() =>
            navigation.dispatch({
              ...CommonActions.navigate('Account'),
              params: { selectAccount: null },
            })
          }
        >
          <Text style={styles.orangeButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}

      <View>
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => navigation.navigate('QrScanner')}
        >
          <Text style={styles.orangeButtonText}>Scan Address</Text>
        </TouchableOpacity>
        <Text style={styles.text}>Scan for an Address or Enter an address manually </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter an address"
          value={receiverAddress}
          onChangeText={setReceiverAddress}
        />
      </View>
      {balance ? <Text>{balance}</Text> : null}
      <Text style={styles.textInput}>Enter an amount to send</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Set Amount to send"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.orangeButton} onPress={() => handler()}>
        <Text>Send Tokens</Text>
      </TouchableOpacity>
    </View>
  )
}
