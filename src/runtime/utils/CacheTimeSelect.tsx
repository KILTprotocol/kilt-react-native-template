import React from 'react'
import { Slider } from '@react-native-assets/slider'
import { Text, View } from 'react-native'

const marks = [
  {
    value: 0,
    label: 'No cache',
  },
  {
    value: 1,
    label: '1 min',
  },
  {
    value: 2,
    label: '15 min',
  },
  {
    value: 3,
    label: '1 year',
  },
]

export function CacheTimeSelect(props: { onSelect: (cacheSeconds: number) => void }): JSX.Element {
  const handleChange = (newValue: number | number[]): void => {
    console.log('cache slider change', newValue)
    switch (newValue) {
      case 0:
        props.onSelect(0)
        break
      case 1:
        props.onSelect(60)
        break
      case 2:
        props.onSelect(900)
        break
      case 3:
        props.onSelect(31536000)
        break
      default:
        console.error('unknown cache time', newValue)
    }
  }

  return (
    <View>
      <Text id="discrete-slider">Cache your consent?</Text>
      <Slider onValueChange={handleChange} step={0} />
    </View>
  )
}
