import React, { useState } from 'react'

import { encodeAddress, mnemonicGenerate } from '@polkadot/util-crypto'

import Snackbar from '../../utils/snackbar'
import type { DidApiProvider, KeysApiProvider } from '../../interfaces'
import generateName from '../../utils/generateName'
import { DidDocument } from './DidDocument'

export function DidsImport<R extends DidApiProvider & KeysApiProvider>(props: {
  runtime: R
}): JSX.Element {
  const { runtime } = props
  const didsApi = runtime.getDidApi()
  const keysApi = runtime.getKeysApi()

  const [mnemonic, setMnemonic] = useState(mnemonicGenerate())
  const [name, setName] = useState(generateName())
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('success')
  const [progress, setProgress] = useState<[number, string]>([0, ''])
  const [inProgress, setInProgress] = useState(false)

  console.log('render import page:', {
    mnemonic,
    name,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    progress,
    inProgress,
  })

  const generateDid = async (): Promise<void> => {
    setInProgress(true)
    setProgress([0, 'Generating keys...'])
    const authKey = await keysApi.import(mnemonic, '//did//0', 'sr25519', `${name}-authentication`)
    setProgress([20, 'Authentication key imported'])
    const attestationKey = await keysApi.import(
      mnemonic,
      '//did//attestation//0',
      'sr25519',
      `${name}-attestation`
    )
    setProgress([40, 'Attestation key imported'])
    const delegationKey = await keysApi.import(
      mnemonic,
      '//did//delegation//0',
      'sr25519',
      `${name}-delegation`
    )
    setProgress([60, 'Delegation key imported'])
    const encryptionKey = await keysApi.import(
      mnemonic,
      '//did//keyAgreement//0',
      'x25519',
      `${name}-encryption`
    )
    setProgress([80, 'Encryption key imported'])
    const ss58AuthKey = encodeAddress(authKey.kid, 38)
    const did = `did:kilt:${ss58AuthKey}`
    const didDocument = new DidDocument(undefined)
    didDocument.id = did
    didDocument.alsoKnownAs = [name]
    didDocument.addKey(authKey, 'authentication')
    didDocument.addKey(attestationKey, 'attestation')
    didDocument.addKey(delegationKey, 'delegation')
    didDocument.addKey(encryptionKey, 'keyAgreement')
    await didsApi.import(didDocument)
    setProgress([100, 'DID stored'])
    setSnackbarMessage(`DID ${did} imported`)
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
  }

  return (
    <Container>
      <Box>
        <Text>Import Did</Text>
        <Grid container spacing={1} direction="column">
          <Grid item>
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
                ),
              }}
            />
          </Grid>
          <Grid item>
            <TextInput
              fullWidth
              id="mnemonic"
              label="Mnemonic"
              value={mnemonic}
              onChange={(e) => {
                setMnemonic(e.target.value)
              }}
              InputProps={{
                endAdornment: (
                  <ShuffleIcon
                    onClick={(): void => {
                      keysApi
                        .generateMnemonic(12)
                        .then((mnemonic) => {
                          setMnemonic(mnemonic)
                        })
                        .catch((e: unknown) => {
                          if (e instanceof Error) {
                            setSnackbarMessage(`Error generating mnemonic: ${e.message}`)
                            setSnackbarSeverity('error')
                            setSnackbarOpen(true)
                          }
                        })
                    }}
                  />
                ),
              }}
            />
          </Grid>
          <Grid item>
            <TouchableOpacity
              disabled={inProgress}
              variant="contained"
              onClick={(): void => {
                generateDid()
                  .then(() => {
                    setInProgress(false)
                  })
                  .catch((e: unknown) => {
                    if (e instanceof Error) {
                      setSnackbarMessage(`Error generating DID: ${e.message}`)
                      setSnackbarSeverity('error')
                      setSnackbarOpen(true)
                    }
                  })
              }}
            >
              Import DID
            </TouchableOpacity>
          </Grid>
        </Grid>
      </Box>
      {inProgress && (
        <div>
          <CircularProgressWithLabel value={progress[0]} />
          <Text>{progress[1]}</Text>
        </div>
      )}
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

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }): JSX.Element {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="caption" component="div" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Text>
      </Box>
    </Box>
  )
}
