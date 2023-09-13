import { type KeypairType } from '@polkadot/util-crypto/types'

import React, { useState, useContext } from 'react'
import { TextInput, View, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native'

import { generateMnemonic } from '../storage/keys/store'
import { importKey } from '../storage/keys/store'

import styles from '../styles/styles'
import { getStorage } from '../storage/storage'
import { AuthContext } from '../wrapper/AuthContextProvider'
import RadioButton from './RadioButton'
import { CommonActions } from '@react-navigation/native'

const alogrithmList = [
  { label: 'Sr25519', value: 'sr25519' },
  { label: 'Ed25519', value: 'ed25519' },
  // { label: 'Ecdsa', value: 'ecdsa' },
  // { label: 'Ethereum', value: 'ethereum' },
  // { label: 'x25519', value: 'x25519' },
]

export default function AddAccount({ navigation }): JSX.Element {
  const [algorithm, setAlgorithm] = useState('sr25519')
  const [mnemonic, setMnemonic] = useState()
  const [name, setName] = useState()
  const [derivation, setDerivation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const authContext = useContext(AuthContext)

  const isDisabled = !algorithm || !mnemonic || !name || isLoading
  const addKey = async (): Promise<void> => {
    setIsLoading(true)
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }

    await importKey(mnemonic, derivation, algorithm as KeypairType | 'x25519', name, password)
    setIsLoading(false)
  }

  const handleSelectAlgorithm = (selectAlgorithm) => {
    setAlgorithm(selectAlgorithm)
  }

  return (
    <KeyboardAvoidingView style={{ ...styles.container }} behavior="position">
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Account</Text>
      </View>
      <View style={styles.main}>
        <Text style={{ ...styles.text, marginVertical: 12, alignSelf: 'flex-start' }}>
          Account name
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <TextInput
            style={{
              width: '70%',
              height: 30,
              padding: 7,
              backgroundColor: 'rgba(0,169,157,0.15)',
              borderWidth: 1,
              borderColor: '#5B5B5B',
              borderRadius: 3,
              color: '#FFFFFF',
              marginRight: '3%',
            }}
            value={name}
            placeholder="Type name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            onChangeText={setName}
          />
          <TouchableOpacity
            style={{ ...styles.orangeButton, width: '27%' }}
            onPress={() => setMnemonic(generateMnemonic(12))}
          >
            <Text style={styles.orangeButtonText}>Mnemonic</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ ...styles.text, marginVertical: 12, alignSelf: 'flex-start' }}>
          Mnemonic
        </Text>
        <TextInput
          style={styles.input}
          placeholder="will be shown here - you can edit it if you want"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={mnemonic}
          onChangeText={setMnemonic}
        />

        <Text style={{ ...styles.text, marginVertical: 12, alignSelf: 'flex-start' }}>
          Derivation
        </Text>
        <TextInput
          style={styles.input}
          value={derivation}
          placeholder="Add text"
          placeholderTextColor="rgba(255,255,255,0.5)"
          onChangeText={(derivation) => {
            setDerivation(derivation)
          }}
        />

        <Text style={{ ...styles.text, marginVertical: 12, alignSelf: 'flex-start' }}>
          Key algorithm
        </Text>
        <View style={styles.selectAccountRadioContainer}>
          {alogrithmList.map(({ value, label }, key) => {
            return (
              <RadioButton
                key={key}
                label={label}
                selected={algorithm === value}
                onPress={() => handleSelectAlgorithm(value)}
                first={key === 0}
                last={alogrithmList.length - 1 === key}
                backgroundColor={'rgba(0, 169, 157, 0.15)'}
              />
            )
          })}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.redButton}
            onPress={() => navigation.dispatch(CommonActions.goBack())}
          >
            <Text style={styles.redButtonText}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              isDisabled
                ? { ...styles.orangeButton, ...styles.buttonDisabled }
                : styles.orangeButton
            }
            onPress={addKey}
            disabled={isDisabled}
          >
            <Text style={styles.orangeButtonText}>ADD ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
