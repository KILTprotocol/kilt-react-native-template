import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

import RNPickerSelect from 'react-native-picker-select'
import { RuntimeContext } from '../wrapper/RuntimeContextProvider'
import { NessieRuntime } from '../runtime'
import styles from '../styles/styles'
import QRCode from 'react-qr-code'

export default function ReceiverScreen({ navigation }): JSX.Element {
  const [itemsList, setItemsList] = useState<{ label: string; value: string }[]>([
    {
      label: 'No Key',
      value: 'No Key',
    },
  ])
  const [address, setAddress] = useState(itemsList[0].value)
  const [initialised] = useContext(RuntimeContext)

  useEffect(() => {
    const handle = async () => {
      const keysApiList = await initialised.nessieRuntime?.getKeysApi().list()

      const keysList = keysApiList.map((val) => {
        console.log('I am a key', val)
        return { label: val.name, value: val.kid }
      })
      setItemsList(keysList)
    }
    handle()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Receive Tokens</Text>

      <RNPickerSelect
        onValueChange={(address) => {
          setAddress(address)
        }}
        items={itemsList}
      />

      <QRCode value={address} />

      <Text>Address: {address}</Text>
    </View>
  )
}