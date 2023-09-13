import { type KeypairType } from '@polkadot/util-crypto/types'

import React, { useState, useContext } from 'react'
import { TextInput, View, Text, TouchableOpacity } from 'react-native'

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
  const [name, setName] = useState('My business account')
  const [derivation, setDerivation] = useState('')
  const authContext = useContext(AuthContext)

  const addKey = async (): Promise<void> => {
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }

    await importKey(mnemonic, derivation, algorithm as KeypairType | 'x25519', name, password)
  }

  const handleSelectAlgorithm = (selectAlgorithm) => {
    setAlgorithm(selectAlgorithm)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Import Account</Text>

      <Text style={styles.text}>Account name (optional)</Text>
      <TextInput style={styles.textInput} value={name} onChangeText={setName} />
      <TouchableOpacity
        style={styles.orangeButton}
        onPress={() => setMnemonic(generateMnemonic(12))}
      >
        <Text style={styles.orangeButtonText}>Mnemonic</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Mnemonic</Text>
      <TextInput
        style={styles.textInput}
        placeholder="type a mnemonic"
        value={mnemonic}
        onChangeText={setMnemonic}
      />

      <Text style={styles.text}>Derivation</Text>
      <TextInput
        style={styles.textInput}
        value={derivation}
        onChangeText={(derivation) => {
          setDerivation(derivation)
        }}
      />

      <Text style={styles.text}>Key algorithm</Text>
      <View style={styles.selectAccountRadioContainer}>
        {alogrithmList.map(({ value, label }, key) => {
          return (
            <RadioButton
              key={key}
              label={label}
              selected={algorithm === value}
              onPress={() => handleSelectAlgorithm(value)}
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
          style={styles.orangeButton}
          onPress={addKey}
          disabled={!mnemonic || !name}
        >
          <Text style={styles.orangeButtonText}>ADD ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
