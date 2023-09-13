import React, { useState, useEffect, useContext } from 'react'
import { TouchableOpacity, Text, View, ScrollView, Image } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

import styles from '../styles/styles'

import { getStorage } from '../storage/storage'
import * as KeyStore from '../storage/keys/store'
import { KeyInfo } from '../utils/interfaces'
import { AuthContext } from '../wrapper/AuthContextProvider'
import getBalance from '../utils/getBalance'
import NessieLogo from '../components/NessieLogo'

export default function AccountScreen({ navigation, route }) {
  const [account, setAccount] = useState<KeyInfo | null>()
  const [keys, setKeys] = useState<KeyInfo[]>()
  const [balance, setBalance] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isFocused = useIsFocused()

  const authContext = useContext(AuthContext)
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
  useEffect(() => {
    fetchAccounts()
  }, [isFocused])

  useEffect(() => {
    if (!account) return setIsLoading(false)
    setIsLoading(true)
    ;(async () => {
      const accountBalance = await getBalance(account.metadata.address)
      setBalance(accountBalance)
      setIsLoading(false)
    })()
  }, [account, isFocused])

  return (
    <ScrollView style={styles.scroll}>
      <NessieLogo pink={true} purple={false} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Accounts</Text>
      </View>

      {!!keys && keys.length === 0 && (
        <Text
          style={{
            ...styles.text,
            paddingVertical: 20,
            width: '50%',
            textAlign: 'center',
            alignSelf: 'center',
          }}
        >
          Start by adding one or many accounts first.
        </Text>
      )}
      {keys
        ? keys.map((keyInfo: KeyInfo, key) => {
            return (
              <View key={key} style={{ paddingTop: '0.5%', paddingBottom: '0.5%' }}>
                <TouchableOpacity
                  style={
                    isLoading && account === keyInfo
                      ? { ...styles.rectangleButtonPurple, ...styles.purpleButtonHighlight }
                      : styles.rectangleButtonPurple
                  }
                  disabled={isLoading}
                  onPress={() => {
                    if (account === keyInfo) {
                      return setAccount(null)
                    }
                    setAccount(keyInfo)
                  }}
                >
                  <Text numberOfLines={1} style={styles.rectangleButtonText}>
                    {keyInfo.metadata.name}
                    {account === keyInfo && balance && <Text>:{balance}</Text>}
                  </Text>
                  <View style={{ right: '40%' }}>
                    <Image source={require('../../assets/Manage.png')} />
                  </View>
                </TouchableOpacity>
                {account === keyInfo && (
                  <View
                    style={
                      isLoading && account === keyInfo
                        ? {
                            ...styles.rectangleButtonPurple,
                            ...styles.buttonContainer,
                            justifyContent: 'space-evenly',
                            ...styles.purpleButtonHighlight,
                          }
                        : {
                            ...styles.buttonContainer,
                            ...styles.rectangleButtonPurple,
                            justifyContent: 'space-evenly',
                          }
                    }
                  >
                    <TouchableOpacity
                      style={styles.orangeButton}
                      disabled={isLoading}
                      onPress={() => navigation.navigate('TokenSender', { selectAccount: account })}
                    >
                      <Text style={styles.orangeButtonText}>SEND</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.orangeButton}
                      disabled={isLoading}
                      onPress={() =>
                        navigation.navigate('TokenReceiver', { selectAccount: account })
                      }
                    >
                      <Text style={styles.orangeButtonText}>RECEIVE</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          })
        : null}
      <View style={{ paddingTop: 30 }}>
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => navigation.navigate('Add Account')}
        >
          <Text style={styles.orangeButtonText}>ADD ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
