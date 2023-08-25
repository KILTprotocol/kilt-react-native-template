// import {
//   Container,
//   Box,
//   List,
//   ListItem,
//   IconButton,
//   ListItemIcon,
//   ListItemText,
//   Text,
//   ListItemButton,
//   TouchableOpacity,
// } from '@mui/material'
import React, { useEffect, useState } from 'react'
// import DeleteIcon from '@mui/icons-material/Delete'
import type { CredentialStoreApiProvider, KiltCredential } from '../../interfaces'
// import Snackbar from '../../utils/snackbar'
// import { CreditCard } from '@mui/icons-material'
import { CredentialDetails } from './CredentialDetails'

export default function CredentialsList<R extends CredentialStoreApiProvider>(props: {
  runtime: R
}): JSX.Element {
  const credentialStoreApi = props.runtime.getCredentialStoreApi()

  const [creds, setCreds] = useState<KiltCredential[]>([])
  const [selectedCred, setSelectedCred] = useState<KiltCredential | null>(null)
  // const [snackbarOpen, setSnackbarOpen] = useState(false)
  // const [snackbarMessage, setSnackbarMessage] = useState('')
  // const [snackbarSeverity, setSnackbarSeverity] = useState<
  // 'success' | 'info' | 'warning' | 'error'
  // >('success')

  function updateCredentialList(): void {
    credentialStoreApi
      .list()
      .then((creds) => {
        setCreds(creds)
      })
      .catch((e) => {
        console.error(e)
        // setSnackbarMessage(e.message)
        // setSnackbarSeverity('error')
        // setSnackbarOpen(true)
      })
  }

  useEffect(() => {
    updateCredentialList()
  }, [])

  if (selectedCred !== null) {
    return (
      <Container>
        <CredentialDetails cred={selectedCred} />
        <TouchableOpacity
          variant="contained"
          onClick={() => {
            setSelectedCred(null)
          }}
        >
          Back
        </TouchableOpacity>
      </Container>
    )
  }

  return (
    <Container>
      <Box>
        <Text>Credentials</Text>
        <List>
          {creds.map((cred) => {
            return (
              <ListItem
                key={cred.rootHash}
                secondaryAction={
                  <IconButton
                    aria-label="comment"
                    onClick={() => {
                      credentialStoreApi
                        .remove(cred.rootHash)
                        .then(() => {
                          updateCredentialList()
                          // setSnackbarMessage('Did deleted')
                          // setSnackbarSeverity('success')
                          // setSnackbarOpen(true)
                        })
                        .catch((e) => {
                          console.error(e)
                          // setSnackbarMessage(e.message)
                          // setSnackbarSeverity('error')
                          // setSnackbarOpen(true)
                        })
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => {
                    setSelectedCred(cred)
                    navigator.clipboard
                      .writeText(cred.rootHash)
                      .then(() => {
                        // setSnackbarMessage('Credential hash copied to clipboard')
                        // setSnackbarSeverity('success')
                        // setSnackbarOpen(true)
                      })
                      .catch((e) => {
                        // setSnackbarMessage(e.message)
                        // setSnackbarSeverity('error')
                        // setSnackbarOpen(true)
                      })
                  }}
                >
                  <ListItemIcon>
                    <CreditCard />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Text noWrap>{cred.cType.title}</Text>}
                    secondary={
                      <Text noWrap variant="body2" color="text.secondary">
                        {cred.rootHash}
                      </Text>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
      {/* <Snackbar
        open={snackbarOpen}
        handleClose={() => {
          setSnackbarOpen(false)
        }}
        message={snackbarMessage}
        severity={snackbarSeverity}
      /> */}
    </Container>
  )
}
