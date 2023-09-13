import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import styles from '../styles/styles'

export default function RadioButton({ label, selected, onPress, first, last, backgroundColor }) {
  const firstElementStyle = { borderTopEndRadius: 10, borderTopStartRadius: 10 }
  const lastElementStyle = {
    borderBottomWidth: 0,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  }
  let styleGuide = { ...styles.radioButton, backgroundColor }
  if (first) {
    styleGuide = { ...styleGuide, ...firstElementStyle }
  }
  if (last) {
    styleGuide = { ...styleGuide, ...lastElementStyle }
  }
  return (
    <TouchableOpacity onPress={onPress} style={{ ...styleGuide }}>
      <Text numberOfLines={1} style={{ ...styles.text, width: '80%' }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: '4.27%' }}>
        {selected && <Image source={require('../../assets/checkmark.png')} />}
      </View>
    </TouchableOpacity>
  )
}
