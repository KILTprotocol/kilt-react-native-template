import React from 'react'
import { sendError, sendResponse } from '../../utils/response'
import { View, Text } from 'react-native'
import YesNo from '../../../components/YesNo'
import type { KiltCredential, Container } from '../../interfaces'
import { CredentialDetails } from '../credentialstore/CredentialDetails'

export default function CredentialStoreConsentView({ navigation, route }): JSX.Element {
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
  const credential: KiltCredential = JSON.parse(rawArgs)

  return (
    <YesNo
      title="Store Credential"
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
        <Text>Store Credential</Text>
        <Text>Are you sure you want to store the following credential?</Text>
        <Text>Origin: {origin}</Text>
        <CredentialDetails cred={credential} />
      </View>
    </YesNo>
  )
}
