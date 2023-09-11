import React, { ReactNode } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { CacheTimeSelect } from '../runtime/utils/CacheTimeSelect'

export default function YesNo({ navigation, route }, props: { children: ReactNode }): JSX.Element {
  const [cacheSeconds, setCacheSeconds] = React.useState(0)
  return (
    <View>
      <Text>{route.params.title}</Text>

      {props.children}

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
