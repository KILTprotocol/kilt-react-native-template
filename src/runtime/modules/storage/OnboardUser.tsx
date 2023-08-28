import React from 'react'

import { View, Text, TextInput, TouchableOpacity } from 'react-native'

export interface OnboardUserProps {
  setMasterPassword: (password: string) => void
}

export default function OnboardUser(props: OnboardUserProps): JSX.Element {
  const { setMasterPassword } = props
  const [password, setPassword] = React.useState('Your password')

  const createMasterPassword = (): void => {
    if (password === null) {
      return
    }
    setMasterPassword(password)
  }

  return (
    <View>
      <Text>Welcome to Nessie</Text>
      <Text>
        This password will be used to encrypt your data. It will not be stored anywhere. Please make
        sure to remember it.
      </Text>
      <TextInput value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={createMasterPassword}>
        <Text>Create Master Password</Text>
      </TouchableOpacity>
    </View>
  )
}
