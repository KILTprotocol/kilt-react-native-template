import React from 'react'
import { View, Text } from 'react-native'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../../components/YesNo'

function KeysSignConsentView({ navigation, route }): JSX.Element {
  const query = new URLSearchParams(window.location.search)
  const origin = query.get('__origin')
  const rawArgs = query.get('__args')
  if (rawArgs === null || rawArgs === '') {
    sendError('no arguments')
      .then(() => {
        window.close()
      })
      .catch(() => {
        window.close()
      })
    throw new Error('no arguments')
  }
  const args: { kid: string; msg: string } = JSON.parse(rawArgs)
  const { kid, msg } = args

  return (
    <YesNo
      title="Sign Data"
      onYes={(cacheSeconds) => {
        sendResponse(true, { cacheSeconds }).finally(() => {
          window.close()
        })
      }}
      onNo={() => {
        sendError('user denied').finally(() => {
          window.close()
        })
      }}
    >
      <View>
        <Text>Sign Data</Text>
        <Text>Are you sure you want to sign the following data?</Text>
        <Text>KID: {kid}</Text>
        <Text>Data: {msg}</Text>
        <Text>Origin: {origin}</Text>
      </View>
    </YesNo>
  )
}

export default KeysSignConsentView
