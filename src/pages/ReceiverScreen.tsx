import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

import RNPickerSelect from 'react-native-picker-select'
import { RuntimeContext } from '../wrapper/RuntimeContextProvider'
import { NessieRuntime } from '../runtime'
import styles from '../styles/styles'
import QRCode from 'react-qr-code'
import { KeysApi, KeyInfo } from '../runtime/interfaces'

export default function ReceiverScreen({ navigation }): JSX.Element {
  const [itemsList, setItemsList] = useState<{ label: string; value: string }[]>([
    {
      label: 'No Key',
      value: 'No Key',
    },
  ])
  const [address, setAddress] = useState(null)
  const [initialised] = useContext(RuntimeContext)

  const handle = async () => {
    await initialised.nessieRuntime?.getKeysApi().list()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Receive Tokens</Text>

      <RNPickerSelect
        onValueChange={(address) => {
          setAddress(address)
        }}
        items={itemsList}
      />
      <TouchableOpacity onPress={handle}>
        <Text style={styles.text}>Refresh</Text>
      </TouchableOpacity>
      {address ? <QRCode value={address} /> : null}

      <Text>Address: {address}</Text>
    </View>
  )
}
