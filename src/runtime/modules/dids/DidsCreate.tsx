ƒ
import React, { useEffect, useState } from 'react'


import Snackbar from '../../utils/snackbar'
import type {
  DidApiProvider,
  KeysApiProvider,
  KeyInfo
} from '../../interfaces'
import generateName from '../../utils/generateName'
import { DidDocument } from './DidDocument'

export function DidsCreate<R extends DidApiProvider & KeysApiProvider> (props: {
  runtime: R
}): JSX.Element {
  const { runtime } = props
  const didsApi = runtime.getDidApi()
  const keysApi = runtime.getKeysApi()

  const [didDocument, setDidDocument] = useState<DidDocument>(new DidDocument(undefined))
  const [availableKeys, setAvailableKeys] = useState<KeyInfo[]>([])
  const [did, setDid] = useState('')
  const [name, setName] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
  'success' | 'info' | 'warning' | 'error'
  >('success')

  console.log('render import page, calling useEffect')
  useEffect(() => {
    keysApi.list().then((keys) => {
      console.log('got keys', keys)
      setAvailableKeys(keys)
    }).catch((e) => {
      setSnackbarMessage(e.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    })
  }, [])

  const importDid = function (): void {
    didsApi
      .import(didDocument)
      .then(() => {
        setSnackbarMessage('Did imported')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      })
      .catch((e) => {
        setSnackbarMessage(e.message)
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      })
  }

  const KeyList = function (props: { didDocument: DidDocument, possibleKeys: KeyInfo[] }): JSX.Element {
    const { didDocument, possibleKeys } = props
    const [key, setKey] = useState('')
    const [usage, setUsage] = useState('')

    const PairSelect = (): JSX.Element => (
      < fullWidth>
        <InputLabel>Key</InputLabel>
        <Select
          fullWidth
          id="pair"
          label="Key"
          value={key}
          onChange={(e) => {
            setKey(e.target.value)
          } }
        >
          {possibleKeys.map((key) => (
            <MenuItem key={key.kid} value={key.kid}>
              <Grid container spacing={1} direction="row" alignItems="center">
                <Grid item>
                  <VpnKeyIcon />
                </Grid>
                <Grid item>
                  <Text >{key.name + ` (${(key.kid).substring(0, 14)}...)`}</Text>
                </Grid>
                <Grid item>
                  <Text variant="subtitle1" color="text.secondary">{key.type}</Text>
                </Grid>
              </Grid>
            </MenuItem>
          ))}
        </Select>
      </>
    )

    return (
      <Box>
        <Grid container spacing={1} direction="column">
          <h2>Keys</h2>
          <Grid item xs={3}>
            <List>
              {didDocument.verificationMethod.map((key) => {
                return (
                  <ListItem key={key.publicKeyBase58}>
                    <ListItemIcon>
                      <VpnKeyIcon />
                    </ListItemIcon>
                    <ListItemText primary={key.publicKeyBase58} secondary={key.type} />
                  </ListItem>
                )
              })}
            </List>
          </Grid>
          <Grid item xs={3}>
            <PairSelect/>
          </Grid>
          <Grid item xs={3}>
          < fullWidth>
            <InputLabel>Usage</InputLabel>
            <Select
              fullWidth
              id="usage"
              label="Usage"
              value={usage}
              onChange={(e) => {
                setUsage(e.target.value)
              }}
            >
              {['authentication', 'attestation', 'delegation', 'encryption'].map((usage) => (
                <MenuItem key={usage} value={usage}>{usage}</MenuItem>
              ))}
            </Select>
          </>
          </Grid>
          <Grid item xs={3}>
            <TouchableOpacity variant="outlined" onClick={() => {
              const keyInfo = possibleKeys.find((k) => k.kid === key)
              if (keyInfo !== undefined) {
                didDocument.addKey(keyInfo, usage)
                setDidDocument(new DidDocument(didDocument))
              }
            }}>Add</TouchableOpacity>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Container>
      <Box>
        <Text>Create Did</Text>
        <Grid container spacing={1} direction="column">
          <Grid item xs={3}>
            <TextInput
              fullWidth
              label="Did"
              value={did}
              onChange={(e) => {
                setDid(e.target.value)
              }}
            />
          </Grid>
          <Grid item xs={3}>
          <TextInput
                fullWidth
                id="name"
                label="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                InputProps={{
                  endAdornment: (
                    <ShuffleIcon
                      onClick={(): void => {
                        setName(generateName())
                      }}
                    />
                  )
                }}
              />
          </Grid>
          <Grid item xs={3}>
            <KeyList didDocument={didDocument} possibleKeys={availableKeys} />
          </Grid>
          <Grid item xs={3}>
            <TouchableOpacity onClick={importDid} variant="contained" fullWidth>Import DID</TouchableOpacity>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        handleClose={() => {
          setSnackbarOpen(false)
        }}
      />
    </Container>
  )
}