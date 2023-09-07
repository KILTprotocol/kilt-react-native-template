import { TextInput, View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'
import RNPickerSelect from 'react-native-picker-select'

import styles from '../styles/styles'
import QrScanner from '../components/QrScanner'
import { getStorage } from '../storage/storage'
import { list } from '../keys/keys'
import { KeyInfo } from '../utils/interfaces'

export default function ImportKeyScreen({ navigation }): JSX.Element {
  const [senderAccount, setSenderAccount] = useState(null)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [scanner, setScanner] = useState(false)
  const [amount, setAmount] = useState('')
  const [keys, setKeys] = useState<KeyInfo[]>()

  useEffect(() => {
    const handle = async () => {
      const keys = keysList.map((val: KeyInfo) => {
        return JSON.parse(JSON.stringify(val))
      })
      setKeys(keys)
    }
    handle()
  }, [])

  const handler = async () => {
    if (!senderAccount || !receiverAddress) {
      throw new Error('get an account ')
    }

    const api = Kilt.ConfigService.get('api')

    const transferTx = api.tx.balances.transfer(receiverAddress, amount)
    await Kilt.Blockchain.signAndSubmitTx(transferTx, senderAccount, {
      resolveOn: Kilt.Blockchain.IS_FINALIZED,
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Send Tokens</Text>
      <Text style={styles.text}>Choose an Account</Text>

      {keys && !senderAccount ? (
        keys.map((keyInfo: KeyInfo, key) => {
          return (
            <View key={key}>
              <TouchableOpacity
                style={styles.loginBtn}
                // I need to fix this metadata stupidity
                onPress={() => setSenderAccount(keyInfo.keypair)}
              >
                <Text>{keyInfo.metadata.metadata.address}</Text>
              </TouchableOpacity>
            </View>
          )
        })
      ) : (
        <></>
      )}
      {scanner ? (
        <QrScanner handleScannerAddress={handleScannerAddress} />
      ) : (
        <View>
          <TouchableOpacity style={styles.loginBtn} onPress={() => setScanner(true)}>
            <Text>Scan Address</Text>
          </TouchableOpacity>
          <Text style={styles.text}>Scan for an Address or Enter an address manually </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter an address"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      )}
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
