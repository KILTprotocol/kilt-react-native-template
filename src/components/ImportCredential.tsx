import { TextInput, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'

import { CommonActions } from '@react-navigation/native'
import styles from '../styles/styles'

export default function TokenSender({ navigation, route }): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)

  const isDisabled = isLoading

  return (
    <ScrollView style={{ ...styles.container }}>
      <View style={styles.header}>
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.redButton}
            onPress={() =>
              navigation.dispatch({
                ...CommonActions.navigate('DidManagment'),
              })
            }
          >
            <Text style={styles.redButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}
