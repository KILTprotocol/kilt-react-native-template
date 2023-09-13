import React from 'react'
import { Image, Text, View } from 'react-native'

export default function NessieLogo() {
  return (
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
  )
}
