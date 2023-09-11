import { type KeypairType } from '@polkadot/util-crypto/types'
import { mnemonicGenerate } from '@polkadot/util-crypto'

import React, { useState, useContext } from 'react'
import { TextInput, View, Text, TouchableOpacity } from 'react-native'

import generateName from '../utils/generateName'
import { generateMnemonic } from '../storage/keys/store'
import RNPickerSelect from 'react-native-picker-select'
import { importKey } from '../storage/keys/store'

import styles from '../styles/styles'
import { getStorage } from '../storage/storage'
import { AuthContext } from '../wrapper/AuthContextProvider'

export default function ImportKey({ navigation }): JSX.Element {
  const [algorithm, setAlgorithm] = useState('sr25519')
  const [mnemonic, setMnemonic] = useState(mnemonicGenerate())
  const [name, setName] = useState(generateName())
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

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Import Key</Text>

      <TextInput style={styles.textInput} placeholder="Name" value={name} onChangeText={setName} />
      <TouchableOpacity style={styles.loginBtn} onPress={() => setMnemonic(generateMnemonic(12))}>
        <Text style={styles.text}>Generate a Mnemonic</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.textInput}
        placeholder="type a mnemonic"
        value={mnemonic}
        onChangeText={setMnemonic}
      />
      <TextInput
        style={styles.textInput}
        value={derivation}
        onChangeText={(derivation) => {
          setDerivation(derivation)
        }}
      />

      <Text style={styles.text}>Algorithm</Text>
      <RNPickerSelect
        onValueChange={(keyAlgorithm) => {
          setAlgorithm(keyAlgorithm)
        }}
        items={[
          { label: 'Sr25519', value: 'sr25519' },
          { label: 'Ed25519', value: 'ed25519' },
          { label: 'Ecdsa', value: 'ecdsa' },
          { label: 'Ethereum', value: 'ethereum' },
          { label: 'x25519', value: 'x25519' },
        ]}
      />

      <TouchableOpacity style={styles.textInput} onPress={addKey}>
        <Text style={styles.text}>Add Key</Text>
      </TouchableOpacity>
    </View>
  )
}
