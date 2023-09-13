import React, { useContext } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import styles from '../styles/styles'
import { AuthContext } from '../wrapper/AuthContextProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'

export default function Warning({ navigation }) {
  const authContext = useContext(AuthContext)

  return (
    <View style={styles.container}>
      <View style={styles.centerContainer}>
        <Image source={require('../../assets/Warning.png')} />
        <Text style={{ ...styles.text, paddingTop: 30, width: '50%', textAlign: 'center' }}>
          Do you really want to clear your storage?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.redButton}
            onPress={() =>
              navigation.dispatch({
                ...CommonActions.navigate('Identity'),
                params: { did: null },
              })
            }
          >
            <Text style={styles.redButtonText}>CLOSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orangeButton}
            onPress={async () => {
              await AsyncStorage.clear()
              authContext.logout()
            }}
          >
            <Text style={styles.orangeButtonText}>CLEAR STORAGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
