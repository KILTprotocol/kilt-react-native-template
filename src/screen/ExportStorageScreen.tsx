import React, { useState, useContext } from 'react'
import { allStorage, getStorage } from '../storage/storage'
import { AuthContext } from '../wrapper/AuthContextProvider'
import { TouchableOpacity, Text } from 'react-native'

export default function ExportStorageScreen({ navigation }) {
  const authContext = useContext(AuthContext)
  const fetchKeys = async () => {
    console.log('get keys')
    const password = await getStorage('session-password')

    if (!password) {
      authContext.logout()
      navigation.navigate('UnlockStorageScreen')
    }

    const getAllStorage = await allStorage(password)
    console.log('ggetAllStoragegetAllStorage', getAllStorage)
  }

  return (
    <>
      <TouchableOpacity onPress={() => fetchKeys()}>
        <Text>get all Storage</Text>
      </TouchableOpacity>
    </>
  )
}
