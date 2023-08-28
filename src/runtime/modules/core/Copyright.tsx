import React from 'react'
import { Linking, TouchableOpacity } from 'react-native'

export function Copyright(): JSX.Element {
  return (
    <TouchableOpacity onPress={() => Linking.openURL('https://botlabs.org/')}>
      https://botlabs.org/
      <br />
      Copyright Botlabs GmbH
      <br />
      {new Date().getFullYear()}.
    </TouchableOpacity>
  )
}
