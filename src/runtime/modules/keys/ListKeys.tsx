import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'

export default function ListKeys<R extends KeysApiProvider>(props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])

  const updateKeyList = function (): void {
    keysApi.list().then((keys) => {
      setKeys(keys)
    })
  }

  useEffect(() => {
    updateKeyList()
  }, [])

  return (
    <Container>
      <Box>
        <Text>Keys</Text>
        <List>
          {keys.map((key) => {
            return (
              <ListItem
                key={key.kid}
                secondaryAction={
                  <IconButton
                    aria-label="comment"
                    onClick={() => {
                      keysApi.remove(key.kid).then(() => {
                        updateKeyList()
                      })
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => {
                    navigator.clipboard.writeText(key.kid)
                  }}
                >
                  <ListItemIcon>
                    <VpnKeyIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Text noWrap>
                        {key.name} - {key.type}
                      </Text>
                    }
                    secondary={
                      <Text noWrap variant="body2" color="text.secondary">
                        {key.kid}
                      </Text>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Container>
  )
}
