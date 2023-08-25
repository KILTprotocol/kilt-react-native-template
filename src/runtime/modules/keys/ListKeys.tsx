import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import Snackbar from '../../utils/snackbar'

export default function ListKeys<R extends KeysApiProvider>(props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('success')

  const updateKeyList = function (): void {
    keysApi
      .list()
      .then((keys) => {
        setKeys(keys)
      })
      .catch((e) => {
        setSnackbarMessage(e.message)
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      })
  }

  useEffect(() => {
    updateKeyList()
  }, [])

  return (
    <Container>
      <Box>
        <h1>Keys</h1>
        <List>
          {keys.map((key) => {
            return (
              <ListItem
                key={key.kid}
                secondaryAction={
                  <IconButton
                    aria-label="comment"
                    onClick={() => {
                      keysApi
                        .remove(key.kid)
                        .then(() => {
                          updateKeyList()
                          setSnackbarMessage('Key deleted')
                          setSnackbarSeverity('success')
                          setSnackbarOpen(true)
                        })
                        .catch((e) => {
                          setSnackbarMessage(e.message)
                          setSnackbarSeverity('error')
                          setSnackbarOpen(true)
                        })
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => {
                    navigator.clipboard
                      .writeText(key.kid)
                      .then(() => {
                        setSnackbarMessage('Copied to clipboard')
                        setSnackbarSeverity('success')
                        setSnackbarOpen(true)
                      })
                      .catch(() => {
                        setSnackbarMessage('Failed to copy to clipboard')
                        setSnackbarSeverity('error')
                        setSnackbarOpen(true)
                      })
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
      <Snackbar
        open={snackbarOpen}
        handleClose={() => {
          setSnackbarOpen(false)
        }}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Container>
  )
}
