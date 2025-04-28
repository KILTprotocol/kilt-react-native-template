import React from 'react'
import { View, Text } from 'react-native'
import { sendError, sendResponse } from './response'
import YesNo from '../../components/YesNo'

export default function GenericConsentView({ navigation, route }): JSX.Element {
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
  const args: { msg: string } = JSON.parse(rawArgs)
  const { msg } = args

  return (
    <YesNo
      title="Are you ok with that?"
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
        <Text>{msg}</Text>
        <Text>Origin: {origin}</Text>
      </View>
    </YesNo>
  )
}
