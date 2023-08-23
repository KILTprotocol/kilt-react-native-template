import React, { useEffect, useState } from 'react'
import { connect, Did, ConfigService } from '@kiltprotocol/sdk-js'
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
      await connect('wss://peregrine.kilt.io')
      const web3Name = 'john_doe'
      const api = ConfigService.get('api')

      console.log(`Querying the blockchain for the web3name "${web3Name}"`)
      // Query the owner of the provided web3name.
      const encodedWeb3NameOwner = await api.call.did.queryByWeb3Name(web3Name)

      const { document } = Did.linkedInfoFromChain(encodedWeb3NameOwner)

      setDid(document.uri || 'unknown')
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
