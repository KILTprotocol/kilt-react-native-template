import { mnemonicGenerate } from '@polkadot/util-crypto'
import { type KeypairType } from '@polkadot/util-crypto/types'
import { TextInput, View, Text, TouchableOpacity } from 'react-native'
import React, { useContext, useState } from 'react'
import generateName from '../runtime/utils/generateName'

import RNPickerSelect from 'react-native-picker-select'
import { RuntimeContext } from '../wrapper/RuntimeContextProvider'
import { NessieRuntime } from '../runtime'

export default function ImportKeyScreen({ navigation, route }): JSX.Element {
  const runtimeContext = useContext(RuntimeContext)
  const keysApi = (runtimeContext.nessieRuntime as unknown as NessieRuntime).getKeysApi()
  console.log('what do I get', keysApi)

  const [algorithm, setAlgorithm] = useState('sr25519')
  const [mnemonic, setMnemonic] = useState(mnemonicGenerate())
  const [name, setName] = useState(generateName())
  const [derivation, setDerivation] = useState('')

  const addKey = (): void => {
    keysApi.import(mnemonic, derivation, algorithm as KeypairType | 'x25519', name)
  }

  return (
    <View>
      <Text>Import Key</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TouchableOpacity
        onPress={() => keysApi.generateMnemonic(12).then((mnemonic) => setMnemonic(mnemonic))}
      >
        <Text>Generate a Mnemonic</Text>
      </TouchableOpacity>

      <TextInput placeholder="type a mnemonic" value={mnemonic} onChangeText={setMnemonic} />

      <TextInput
        value={derivation}
        onChangeText={(derivation) => {
          setDerivation(derivation)
        }}
      />

      <Text>Algorithm</Text>
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

      <TouchableOpacity onPress={addKey}>
        <Text>Add Key</Text>
      </TouchableOpacity>
    </View>
  )
}
