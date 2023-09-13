import React, { useState, useEffect, useContext } from 'react'
import { TouchableOpacity, Text, View, ScrollView, Image } from 'react-native'

import styles from '../styles/styles'

import { getStorage } from '../storage/storage'
import * as KeyStore from '../storage/keys/store'
import { KeyInfo } from '../utils/interfaces'
import { AuthContext } from '../wrapper/AuthContextProvider'
import getBalance from '../utils/getBalance'

export default function AccountScreen({ navigation, route }) {
  const [account, setAccount] = useState<KeyInfo | null>()
  const [keys, setKeys] = useState<KeyInfo[]>()
  const [balance, setBalance] = useState('')

  const authContext = useContext(AuthContext)

  useEffect(() => {
    const fetchAccounts = async () => {
      const password = await getStorage('session-password')

      if (!password) {
        authContext.logout()
        navigation.navigate('UnlockStorageScreen')
      }
      const keysList = await KeyStore.list(password)

      const keys = keysList.map((val: KeyInfo) => {
        return JSON.parse(JSON.stringify(val))
      })
      setKeys(keys)
    }
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (!account) return
    ;(async () => {
      const accountBalance = await getBalance(account.metadata.address)
      setBalance(accountBalance)
    })()
  }, [account])

  return (
    <ScrollView style={styles.scroll}>
      <View style={{ paddingTop: '16.33%', alignItems: 'center', paddingBottom: '15%' }}>
        <Image source={require('../../assets/Group.png')} />
        <Text
          style={{
            color: 'white',
            fontSize: 16,
          }}
        >
          Nessie
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 12,
          }}
        >
          your Identity wallet
        </Text>
      </View>

      {keys
        ? keys.map((keyInfo: KeyInfo, key) => {
            return (
              <View key={key} style={{ paddingTop: '0.5%', paddingBottom: '0.5%' }}>
                <TouchableOpacity
                  style={styles.rectangleButtonPurple}
                  onPress={() => {
                    if (account) {
                      return setAccount(null)
                    }
                    return setAccount(keyInfo)
                  }}
                >
                  <Text numberOfLines={1} style={styles.rectangleButtonText}>
                    {keyInfo.metadata.name}:{balance} KILT
                  </Text>
                  <View style={{ right: '40%' }}>
                    <Image source={require('../../assets/Manage.png')} />
                  </View>
                </TouchableOpacity>
                {account === keyInfo ? (
                  <View
                    style={{
                      ...styles.buttonContainer,
                      ...styles.rectangleButtonPurple,
                      justifyContent: 'space-evenly',
                    }}
                  >
                    <TouchableOpacity
                      style={styles.orangeButton}
                      onPress={() => navigation.navigate('TokenSender', { selectAccount: account })}
                    >
                      <Text style={styles.orangeButtonText}>SEND</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.orangeButton}
                      onPress={() =>
                        navigation.navigate('TokenReceiver', { selectAccount: account })
                      }
                    >
                      <Text style={styles.orangeButtonText}>RECEIVE</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )
          })
        : null}

      <TouchableOpacity
        style={styles.orangeButton}
        onPress={() => navigation.navigate('Add Account')}
      >
        <Text style={styles.orangeButtonText}>ADD ACCOUNT</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
