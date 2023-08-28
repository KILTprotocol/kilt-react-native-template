import React from 'react'
import { sendError, sendResponse } from '../../utils/response'
import { Text, View } from 'react-native'
import YesNo from '../../utils/YesNo'

export default function KeysDecryptConsentView({ navigation, route }): JSX.Element {
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
  const args: { receiverKid: string; senderPubkey: string; msg: string } = JSON.parse(rawArgs)
  const { receiverKid, senderPubkey, msg } = args

  return (
    <YesNo
      title="Decrypt Data"
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
        <Text>Decrypt Data</Text>
        <Text>Are you sure you want to decrypt the following data?</Text>

        <Text>Receiver KID: {receiverKid}</Text>

        <Text>Sender Pubkey: {senderPubkey} </Text>

        <Text>Data: {msg}</Text>

        <Text>Origin: {origin}</Text>
      </View>
    </YesNo>
  )
}
