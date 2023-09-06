import { TextInput, View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'
import RNPickerSelect from 'react-native-picker-select'

import styles from '../styles/styles'
import QrScanner from '../components/QrScanner'

export default function ImportKeyScreen({ navigation }): JSX.Element {
  const [senderAccount, setSenderAccount] = useState<Kilt.KiltKeyringPair | null>(null)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [scanner, setScanner] = useState(false)
  const [amount, setAmount] = useState('')

  const [itemsList, setItemsList] = useState<{ label: string; value: string }[]>([
    {
      label: 'No Key',
      value: 'No Key',
    },
  ])

  const handleScannerAddress = (scannedAddress) => {
    setReceiverAddress(scannedAddress)
  }

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

  // useEffect(() => {
  //   const handle = async () => {
  //     console.log('Fuck you', keysApiList)
  //     const keysList = keysApiList.map((val) => {
  //       console.log('I am a key', val)
  //       return { label: val.name, value: val.kid }
  //     })
  //     setItemsList(keysList)
  //   }
  //   handle()
  // })

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Send Tokens</Text>
      <Text style={styles.text}>Choose an Account</Text>
      <RNPickerSelect
        onValueChange={(address) => {
          setSenderAccount(address)
        }}
        items={itemsList}
      />
      {scanner ? (
        <QrScanner handleScannerAddress={handleScannerAddress} />
      ) : (
        <TouchableOpacity style={styles.loginBtn} onPress={() => setScanner(true)}>
          <Text style={styles.text}>Turn on Scanners</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.textInput}
        placeholder="Set Amount to send"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.loginBtn} onPress={() => handler()}>
        <Text style={styles.text}>Send Tokens</Text>
      </TouchableOpacity>
    </View>
  )
}
