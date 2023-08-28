import React from 'react'
import { sendError, sendResponse } from '../../utils/response'
import { View, Text } from 'react-native'
import YesNo from '../../utils/YesNo'
import type { DidDocument } from '../../interfaces'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function DidSelectView({ navigation, route }): JSX.Element {
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
  const dids: DidDocument[] = JSON.parse(rawArgs)

  const [selectedDid, setSelectedDid] = React.useState<string | null>(
    dids.length > 0 ? dids[0].id : null
  )

  return (
    <YesNo
      title="Select DID"
      onYes={(cacheSeconds) => {
        sendResponse(selectedDid, { cacheSeconds }).finally(() => {
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
        <Text>Select DID</Text>
        <Text>Please select a DID to proceed.</Text>
        <Text>Origin: {origin}</Text>
        <View>
          <View>
            <MaterialCommunityIcons name="person" color={'green'} />
          </View>
          <View>
            {/* <TouchableOpacity
              value={selectedDid}
              onPress={() => {
                setSelectedDid(selectedDid)
              }}
            >
              {dids.map((did) => {
                return (
                  <MenuItem key={did.id} value={did.id}>
                    {did.alsoKnownAs[0] ?? 'No Name'} ({did.id})
                  </MenuItem>
                )
              })}
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </YesNo>
  )
}
