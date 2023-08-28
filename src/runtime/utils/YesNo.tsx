import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { CacheTimeSelect } from './CacheTimeSelect'

interface YesNoProps {
  title: string
  children: React.ReactNode
  onYes: (cacheSeconds: number) => void
  onNo: () => void
}

export default function YesNo({ navigation, route }): JSX.Element {
  const [cacheSeconds, setCacheSeconds] = React.useState(0)
  return (
    <View>
      <Text>{props.title}</Text>

      <Text>{props.children}</Text>

      <CacheTimeSelect onSelect={setCacheSeconds} />

      <TouchableOpacity
        onPress={() => {
          props.onNo()
        }}
      >
        No
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          props.onYes(cacheSeconds)
        }}
      >
        Yes
      </TouchableOpacity>
    </View>
  )
}
