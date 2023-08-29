import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { CacheTimeSelect } from './CacheTimeSelect'

export default function YesNo({ navigation, route }): JSX.Element {
  const [cacheSeconds, setCacheSeconds] = React.useState(0)
  return (
    <View>
      <Text>{route.params.title}</Text>

      <Text>{route.params.children}</Text>

      <CacheTimeSelect onSelect={setCacheSeconds} />

      <TouchableOpacity
        onPress={() => {
          navigation.navigate(route.params.origin, { ...route.params.no })
        }}
      >
        <Text>NO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate(route.params.origin, { ...route.params.yes, time: cacheSeconds })
        }}
      >
        <Text>Yes</Text>
      </TouchableOpacity>
    </View>
  )
}
