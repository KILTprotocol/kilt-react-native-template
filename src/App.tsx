import React, { useEffect, useState } from 'react'
import { init, Did } from '@kiltprotocol/sdk-js'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'

interface Styles {
  container: {
    flex: number
    backgroundColor: string
    alignItems: 'center'
    justifyContent: 'center'
  }
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default function App() {
  const [did, setDid] = useState('Fetching the Did Uri')
  useEffect(() => {
    const fetchDid = async () => {
      await init({ address: 'wss://peregrine.kilt.io' })
      const johnDoeDid = await Did.Web3Names.queryDidForWeb3Name('john_doe')
      setDid(johnDoeDid || 'unknown')
    }

    fetchDid()
  })
  return (
    <View style={styles.container}>
      <Text>KILT Basic template</Text>
      <Text>Here is John Doe`s Did = {did}</Text>
      <StatusBar />
    </View>
  )
}
