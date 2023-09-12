import { Did } from '@kiltprotocol/sdk-js'

import { TouchableOpacity, Text, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import styles from '../styles/styles'
import SelectDid from '../components/SelectDid'
import { CommonActions } from '@react-navigation/native'

export default function DidScreen({ navigation, route }) {
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

      <SelectDid navigation={navigation} route={route} />

      <TouchableOpacity
        style={styles.orangeButton}
        onPress={() =>
          navigation.dispatch({
            ...CommonActions.navigate({
              name: 'CreateDid',
              params: { selectAccount: null },
            }),
          })
        }
      >
        <Text style={styles.orangeButtonText}>ADD IDENTITY</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
