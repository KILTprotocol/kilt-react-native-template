import React from 'react'
import { sendError, sendResponse } from '../../utils/response'
import { Text, View } from 'react-native'
import YesNo from '../../utils/YesNo'
import type { KiltCredential } from '../../interfaces'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function CredentialSelectView({ navigation, route }): JSX.Element {
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
  const credentials: KiltCredential[] = JSON.parse(rawArgs)

  const [selectedCredential, setSelectedCredential] = React.useState<string | undefined>(
    credentials.length > 0 ? credentials[0].rootHash : undefined
  )

  return (
    <YesNo
      title="Select Credential"
      onYes={(cacheSeconds) => {
        sendResponse(selectedCredential, { cacheSeconds }).finally(() => {
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
        <Text>Select Credential</Text>
        <Text>Please select a Credential to proceed.</Text>
        <Text>Origin: {origin}</Text>
        <View>
          <View>
            <MaterialCommunityIcons name="person" color={'green'} />
          </View>
          {/* <View item>
            <Select
              value={selectedCredential}
              onChange={(event: SelectChangeEvent) => {
                console.log('selected credential: ', event.target.value)
                setSelectedCredential(event.target.value)
              }}
            >
              {credentials.map((cred) => {
                return (
                  <MenuItem key={cred.rootHash} value={cred.rootHash}>
                    {cred.cType.title} ({cred.claim.owner})
                  </MenuItem>
                )
              })}
            </Select>
          </View> */}
        </View>
      </View>
    </YesNo>
  )
}
