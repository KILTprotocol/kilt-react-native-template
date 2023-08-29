import React from 'react'

import { sendError, sendResponse } from '../../utils/response'

import { type KeyInfo, type Container } from '../../interfaces'
import { CacheTimeSelect } from '../../utils/CacheTimeSelect'
import { View, Text, TouchableOpacity } from 'react-native'

// KeysViewConsent gets a View of keys as arguments and asks the user to confirm
// which of the keys they want to share with the requesting origin.
export default function KeysListConsentView({ navigation, route }): JSX.Element {
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
  const args: { keys: KeyInfo[] } = JSON.parse(rawArgs)
  const { keys } = args

  const [selected, setSelected] = React.useState<KeyInfo[]>([])
  const [cacheSeconds, setCacheSeconds] = React.useState<number>(0)

  console.log('selected:', selected)
  const handleSelect = (kid: string): void => {
    const key = keys.find((k) => k.kid === kid)
    if (key === undefined) {
      throw new Error('key not found')
    }
    console.log('handleSelect', key)
    if (selected.find((k) => k.kid === kid) !== undefined) {
      console.log('removing', key)
      setSelected(selected.filter((k) => k.kid !== key.kid))
    } else {
      console.log('adding', key)
      setSelected([...selected, key])
    }
  }

  return (
    <View>
      <Text>Share Keys</Text>
      <Text>Text lease select the keys you want to share.</Text>
      <Text>Origin: {origin}</Text>
      <View>
        {keys.map((key) => {
          return (
            <ViewItem
              key={key.kid}
              secondaryAction={
                <IconButton
                  aria-label="comment"
                  onPress={() => {
                    handleSelect(key.kid)
                  }}
                >
                  {selected.find((k) => k.kid === key.kid) !== undefined ? <YesIcon /> : <NoIcon />}
                </IconButton>
              }
            >
              <ViewItemButton
                onPress={() => {
                  handleSelect(key.kid)
                }}
              >
                <ViewItemIcon>
                  <VpnKeyIcon />
                </ViewItemIcon>
                <ViewItemText
                  secondary={<Text noWrap>{key.kid}</Text>}
                  primary={
                    <React.Fragment>
                      {key.name}
                      <Text sx={{ display: 'inline' }} component="span" variant="body2">
                        {' - ' + key.type}
                      </Text>
                    </React.Fragment>
                  }
                />
              </ViewItemButton>
            </ViewItem>
          )
        })}
      </View>

      <CacheTimeSelect onSelect={setCacheSeconds} />

      <TouchableOpacity
        onPress={() => {
          sendError('user denied').finally(() => {
            window.close()
          })
        }}
      >
        No
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          sendResponse(selected, { cacheSeconds }).finally(() => {
            window.close()
          })
        }}
      >
        Yes
      </TouchableOpacity>
    </View>
  )
}
