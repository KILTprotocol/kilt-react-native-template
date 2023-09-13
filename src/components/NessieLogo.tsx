import React from 'react'
import { Image, Text, View } from 'react-native'

export default function NessieLogo({ pink, purple }: { pink: boolean; purple: boolean }) {
  return (
    <View style={{ paddingTop: '5%', alignItems: 'center', paddingBottom: '5%' }}>
      {pink && <Image source={require('../../assets/nessie_logo_pink.png')} />}
      {purple && <Image source={require('../../assets/Group.png')} />}

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
