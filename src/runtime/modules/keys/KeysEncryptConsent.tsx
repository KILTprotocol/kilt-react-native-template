import React from 'react'
import { sendError, sendResponse } from '../../utils/response'
import { Text, View } from 'react-native'

import YesNo from '../../utils/YesNo'

export default function KeysEncryptConsentView({ navigation, route }): JSX.Element {
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
  const args: { senderKid: string; receiverPubkey: string; msg: string } = JSON.parse(rawArgs)
  const { senderKid, receiverPubkey, msg } = args

  return (
    <YesNo
      title="Encrypt Data"
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
        <Text>Encrypt Data</Text>
        <Text>Are you sure you want to encrypt the following data?</Text>

        <Text>Sender KID: {senderKid}</Text>

        <Text>Receiver Pubkey: {receiverPubkey} </Text>

        <Text>Data: {msg}</Text>

        <Text>Origin: {origin}</Text>
      </View>
    </YesNo>
  )
}
