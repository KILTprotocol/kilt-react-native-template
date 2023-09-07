import { View, Text, TouchableOpacity } from 'react-native'
import React, { useMemo, useEffect, useState } from 'react'
import styles from '../styles/styles'
import QRCode from 'react-qr-code'
import { list } from '../keys/keys'
import { getStorage } from '../storage/storage'
import { KeyInfo } from '../utils/interfaces'

export default function ReceiverScreen({ navigation }): JSX.Element {
  const [keys, setKeys] = useState<KeyInfo[]>()
  const [address, setAddress] = useState()
  useEffect(() => {
    const handle = async () => {
      const password = await getStorage('session-password', 'Enter your password')
      if (!password) return console.log('no password')
      const keysList = await list(password)

      const keys = keysList.map((val: KeyInfo) => {
        return JSON.parse(JSON.stringify(val))
      })
      setKeys(keys)
    }
    handle()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Receive Tokens</Text>
      {keys && !address ? (
        keys.map((keyInfo: KeyInfo, key) => {
          return (
            <View key={key}>
              <TouchableOpacity
                style={styles.loginBtn}
                // I need to fix this metadata stupidity
                onPress={() => setAddress(keyInfo.metadata.metadata.address)}
              >
                <Text>{keyInfo.metadata.metadata.address}</Text>
              </TouchableOpacity>
            </View>
          )
        })
      ) : (
        <></>
      )}
      {address ? (
        <View>
          <QRCode value={address} />
          <TouchableOpacity
            style={styles.loginBtn}
            // I need to fix this metadata stupidity
            onPress={() => setAddress(null)}
          >
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </View>
  )
}
