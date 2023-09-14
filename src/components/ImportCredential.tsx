import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import * as CredentialStore from '../storage/credential/store'

import styles from '../styles/styles'
import { ICredential } from '@kiltprotocol/sdk-js'
import { AuthContext } from '../wrapper/AuthContextProvider'
import { getStorage } from '../storage/storage'

const data = {
  attester: 'BOTLabs GmbH',
  cTypeTitle: 'Haus of Chaos',
  credential: {
    claim: {
      cTypeHash: '0xae5bc64e500eb576b7b137288cec5d532094e103be46872f1ad54641e477d9fe',
      contents: { POA: 'Haus of Chaos' },
      owner: 'did:kilt:4s3B9D4rBQbaCEsFJM3vGPhv3Vf3fUYKWi4fEqndU8UBxbKL',
    },
    claimHashes: [
      '0x9aca5380ff36109f634f9c505e2cb121437b4b971a1312589fcef66a487b129b',
      '0xcb4f608d2778d872f3f7fc5b29a977cc950f4d2409028b214c2f480e249fdbed',
    ],
    claimNonceMap: {
      '0x5b1b59e03d868c81406391583665e41b63d3684df6ee0235eb8bd822289d7dcd':
        '90a03791-fea7-45f5-b86b-78a9a2746aaf',
      '0xf937543efee0291e93a0d63a2275e05263607843c94580d1df74887e40d5bc5d':
        '8867f79b-d537-4205-a6a2-62fd5acbe4f3',
    },
    delegationId: null,
    legitimations: [],
    rootHash: '0x6853629f469413eea27726551db049ecf5f4c94900966daa725adbe9eebd5c6e',
  },
  isDownloaded: true,
  name: 'peregrine email',
  status: 'attested',
}

export default function TokenSender({ navigation, route }): JSX.Element {
  const [credential, setCredential] = useState<ICredential | null>(data.credential)
  const [name, setName] = useState(data.cTypeTitle)
  const authContext = useContext(AuthContext)
  const isDisabled = !name || !credential

  const storeCredential = async () => {
    if (!credential) return
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }
    await CredentialStore.setCredential(name, credential, password)
    navigation.goBack()
  }
  useEffect(() => {
    console.log(route.params)
    // if (!route.params.credential) {
    //   return
    // }
  }, [route.params])
  return (
    <ScrollView style={{ ...styles.container }}>
      <View style={{ ...styles.header, backgroundColor: 'rgba(249,105,67,0.2)' }}>
        <Text style={styles.headerText}>Import Credential</Text>
      </View>

      <View style={{ ...styles.main, paddingTop: 32 }}>
        <Text style={{ ...styles.text, marginBottom: 45, alignSelf: 'flex-start' }}>
          Scan a Credential
        </Text>
        <TouchableOpacity
          style={{ ...styles.orangeButton, ...styles.qrButton }}
          onPress={() => navigation.navigate('QrScanner')}
        >
          <Image source={require('../../assets/qr-code.png')} height={42} width={42} />
        </TouchableOpacity>
        <Text style={styles.text}>(opens your camera)</Text>
        <View
          style={{
            backgroundColor: 'rgba(249,105,67,0.2)',
            flex: 1,
            paddingVertical: 24,
            paddingHorizontal: 12,
            marginTop: 10,
          }}
        >
          {data && (
            <>
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Attester:</Text>
                <Text style={styles.text}>{data.attester}</Text>
              </View>
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Credential Name::</Text>
                <Text style={styles.text}>{data.cTypeTitle}</Text>
              </View>
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Credential Content:</Text>
                <Text style={styles.text}>{data.credential.claim.contents.POA}</Text>
              </View>
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Credential Hash:</Text>
                <Text style={styles.text}>{data.credential.rootHash}</Text>
              </View>
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Credential Owner:</Text>
                <Text style={styles.text}>{data.credential.claim.owner}</Text>
              </View>
              <View style={styles.keyContainer}>
                <Text style={{ ...styles.text, marginBottom: 10 }}>Status:</Text>
                <Text style={styles.text}>{data.status}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.redButton} onPress={() => navigation.goBack()}>
            <Text style={styles.redButtonText}>CLOSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              isDisabled
                ? { ...styles.orangeButton, ...styles.buttonDisabled }
                : styles.orangeButton
            }
            onPress={() => storeCredential()}
            disabled={isDisabled}
          >
            <Text style={styles.orangeButtonText}>STORE CREDENTIAL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}
