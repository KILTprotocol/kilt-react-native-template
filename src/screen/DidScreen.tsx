import { Did } from '@kiltprotocol/sdk-js'

import { TouchableOpacity, Text, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import styles from '../styles/styles'
import SelectDid from '../components/SelectDid'
import { CommonActions } from '@react-navigation/native'
import NessieLogo from '../components/NessieLogo'

export default function DidScreen({ navigation, route }) {
  return (
    <ScrollView style={styles.scroll}>
      <NessieLogo />

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
