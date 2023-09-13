import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Kilt from '@kiltprotocol/sdk-js'

import styles from '../styles/styles'

import { KeyInfo } from '../utils/interfaces'

import Keyring from '@polkadot/keyring'
import { CommonActions } from '@react-navigation/native'

import getBalance from '../utils/getBalance'

export default function TokenSender({ navigation, route }): JSX.Element {
  const [senderAccount, setSenderAccount] = useState<KeyInfo>()
  const [receiverAddress, setReceiverAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('')

  const isDisabled = !amount || !receiverAddress || !senderAccount || isLoading
  useEffect(() => {
    setReceiverAddress(route.params?.scanAddress)
    setSenderAccount(route.params?.selectAccount)
  }, [route.params])

  useEffect(() => {
    if (!senderAccount) return
    ;(async () => {
      const accountBalance = await getBalance(senderAccount.metadata.address)
      setBalance(accountBalance)
    })()
  }, [senderAccount])

  const sendTokens = async () => {
    setIsLoading(true)
    if (!senderAccount || !receiverAddress) {
      setIsLoading(false)
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
    setIsLoading(false)
  }

  return (
    <KeyboardAvoidingView style={{ ...styles.container }} behavior="position">
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Send Tokens from:{' '}
          <Text style={{ fontStyle: 'italic' }}>{senderAccount?.metadata.name}</Text>
        </Text>
      </View>

      <View style={componentStyles.main}>
        <Text style={{ ...styles.text, marginBottom: 45, alignSelf: 'flex-start' }}>
          Scan for an address
        </Text>
        <TouchableOpacity
          style={{ ...styles.orangeButton, ...componentStyles.qrButton }}
          onPress={() => navigation.navigate('QrScanner')}
        >
          <Image source={require('../../assets/qr-code.png')} height={42} width={42} />
        </TouchableOpacity>
        <Text style={styles.text}>(opens your camera)</Text>

        <Text style={{ ...styles.text, marginTop: 22, marginBottom: 12, alignSelf: 'flex-start' }}>
          or enter it manually
        </Text>
        <TextInput
          style={componentStyles.input}
          placeholder="Enter address"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={receiverAddress}
          onChangeText={setReceiverAddress}
        />

        <Text style={{ ...styles.text, marginVertical: 20, alignSelf: 'flex-start' }}>
          Enter amount of KILTs
        </Text>
        <TextInput
          style={componentStyles.borderlessInput}
          placeholder="0.0000"
          placeholderTextColor="#FFFFFF"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numbers-and-punctuation"
        />
        {balance && <Text style={styles.text}>Balance: {balance}</Text>}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.redButton}
            onPress={() =>
              navigation.dispatch({
                ...CommonActions.navigate('Account'),
                params: { selectAccount: null },
              })
            }
          >
            <Text style={styles.redButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              isDisabled
                ? { ...styles.orangeButton, ...styles.buttonDisabled }
                : styles.orangeButton
            }
            onPress={() => sendTokens()}
            disabled={isDisabled}
            activeOpacity={0.5}
          >
            <Text style={styles.orangeButtonText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const componentStyles = StyleSheet.create({
  main: {
    paddingTop: 32,
    paddingHorizontal: 12,
    display: 'flex',
    alignItems: 'center',
  },
  qrButton: {
    height: 100,
    width: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 30,
    padding: 7,
    backgroundColor: 'rgba(0,169,157,0.15)',
    borderWidth: 1,
    borderColor: '#5B5B5B',
    borderRadius: 3,
    color: '#FFFFFF',
  },
  borderlessInput: {
    fontSize: 36,
    color: '#FFFFFF',
  },
})
