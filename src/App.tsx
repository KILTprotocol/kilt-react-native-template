import React, { useEffect, useState } from 'react'
import {
  init,
  Did,
  DidUri,
  DidResolvedDetails,
  KeyringPair,
} from '@kiltprotocol/sdk-js'
import { StatusBar } from 'expo-status-bar'
import { Button, StyleSheet, Text, View } from 'react-native'
import QRScanner from './QRscan'
import { Keyring } from '@polkadot/keyring'

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
  const [keypair, setKeypair] = useState<KeyringPair>()
  const [myDid, setMyDid] = useState<Did.LightDidDetails>()

  const [did, setDid] = useState<DidUri>()
  const [details, setDetails] = useState<DidResolvedDetails | null>()
  const [scanEnabled, setScanEnabled] = useState<boolean>(false)
  const [buttonText, setButtonText] = useState<string>('Click to Scan')

  useEffect(() => {
    const pair = new Keyring({ ss58Format: 38 }).addFromUri('//Alice')
    setKeypair(pair)
    setMyDid(Did.LightDidDetails.fromIdentifier(pair.address))
  }, [])

  useEffect(() => {
    if (!did) {
      setDetails(undefined)
      return
    }
    init({ address: 'wss://spiritnet.kilt.io' }).then(async () => {
      try {
        setDetails(await Did.resolveDoc(did))
        return
      } catch {
        alert(`The did ${did} does not seem to be valid!`)
        setDid(undefined)
      }
    })
  }, [did])

  return (
    <View style={styles.container}>
      <Text>Mobile DID Scanner</Text>
      {myDid && <Text>Your Identity = {myDid.uri}</Text>}
      {did && <Text>Their Identity = {did}</Text>}
      {did && (
        <>
          <Text>
            Status ={' '}
            {`${
              typeof details === 'undefined'
                ? 'Fetching...'
                : !details
                ? 'not registered'
                : details.metadata.canonicalId
                ? 'superseded'
                : details.metadata.deactivated
                ? 'deactivated'
                : 'active'
            }`}
          </Text>
        </>
      )}
      {
        //did && <QRCode codeStyle="circle" linearGradient={['green', 'red']} content={did} />
      }
      {scanEnabled ? (
        <QRScanner
          onBarCodeScanned={({ data }) => {
            setScanEnabled(false)
            setButtonText('Click to Scan again')
            try {
              const { did: parsedDid } = Did.Utils.parseDidUri(data as any)
              setDid(parsedDid)
            } catch {
              alert(`What you scanned does not seem to be a KILT DID (${data.substring(0, 100)})`)
            }
          }}
        />
      ) : (
        <Button
          title={buttonText}
          onPress={() => {
            setDid(undefined)
            setScanEnabled(true)
          }}
        />
      )}
      <StatusBar />
    </View>
  )
}
