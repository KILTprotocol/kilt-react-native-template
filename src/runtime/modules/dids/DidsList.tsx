import React, { useEffect, useState } from 'react'

import { type DidApiProvider, type DidDocument } from '../../interfaces'
import Snackbar from '../../utils/snackbar'

export default function DidsList<R extends DidApiProvider>(props: { runtime: R }): JSX.Element {
  const didsApi = props.runtime.getDidApi()

  const [dids, setDids] = useState<DidDocument[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('success')

  function updateDidList(): void {
    didsApi
      .list()
      .then((dids) => {
        setDids(dids)
      })
      .catch((e) => {
        setSnackbarMessage(e.message)
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      })
  }

  useEffect(() => {
    updateDidList()
  }, [])

  return (
    <Container>
      <Box>
        <h1>DIDs</h1>
        <List>
          {dids.map((did) => {
            return (
              <ListItem
                key={did.id}
                secondaryAction={
                  <IconButton
                    aria-label="comment"
                    onClick={() => {
                      didsApi
                        .remove(did.id)
                        .then(() => {
                          updateDidList()
                          setSnackbarMessage('Did deleted')
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
                    // copy DID to clipboard
                    navigator.clipboard
                      .writeText(did.id)
                      .then(() => {
                        setSnackbarMessage('DID copied to clipboard')
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
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Text noWrap>{did.alsoKnownAs[0] ?? 'No Name'}</Text>}
                    secondary={
                      <Text noWrap variant="body2" color="text.secondary">
                        {did.id}
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
