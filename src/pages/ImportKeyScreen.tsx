import { mnemonicGenerate } from '@polkadot/util-crypto'
import { type KeypairType } from '@polkadot/util-crypto/types'
import { TextInput, View, Text, TouchableOpacity } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import generateName from '../runtime/utils/generateName'

import RNPickerSelect from 'react-native-picker-select'
import { RuntimeContext } from '../wrapper/RuntimeContextProvider'
import { NessieRuntime } from '../runtime'
import styles from '../styles/styles'
import { KeysApi } from '../runtime/interfaces'

export default function ImportKeyScreen({ navigation }): JSX.Element {
  const [initialised] = useContext(RuntimeContext)
  const [keys, setKeys] = useState<KeysApi | undefined>()

  useEffect(() => {
    if (!initialised.nessieRuntime || !initialised.nessieRuntime.getKeysApi())
      throw new Error('nope')

    setKeys(initialised.nessieRuntime?.getKeysApi())
  }, [])

  const [algorithm, setAlgorithm] = useState('sr25519')
  const [mnemonic, setMnemonic] = useState(mnemonicGenerate())
  const [name, setName] = useState(generateName())
  const [derivation, setDerivation] = useState('')

  const addKey = async (): Promise<void> => {
    if (!keys) return console.log('hello')
    console.log('it works')
    await keys.import(mnemonic, derivation, algorithm as KeypairType | 'x25519', name)
    const handleList = await keys.list()
    console.log('What is the handle list', handleList[0].kid)
    const getKey = await initialised.storage?.get(name)
    console.log('get the key of this new key', getKey)
  }

  useEffect(() => {
    const handler = async () => {
      if (!keys) return
      const handleList = await keys.list()
      console.log('What is the handle list', handleList)
    }
    handler()
  }, [keys])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Import Key</Text>

      <TextInput style={styles.textInput} placeholder="Name" value={name} onChangeText={setName} />
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => {
          if (!keys) return console.log('silly')
          return keys.generateMnemonic(12).then((mnemonic) => setMnemonic(mnemonic))
        }}
      >
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
