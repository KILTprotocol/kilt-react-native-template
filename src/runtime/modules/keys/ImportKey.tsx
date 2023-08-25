
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { type KeypairType } from '@polkadot/util-crypto/types'

import Snackbar from '../../utils/snackbar'

import React, { useState } from 'react'
import generateName from '../../utils/generateName'
import { type KeysApiProvider } from '../../interfaces'

export default function ImportKey<R extends KeysApiProvider> (props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [algorithm, setAlgorithm] = useState('sr25519')
  const [mnemonic, setMnemonic] = useState(mnemonicGenerate())
  const [name, setName] = useState(generateName())
  const [derivation, setDerivation] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
  'success' | 'info' | 'warning' | 'error'
  >('success')

  const addKey = (): void => {
    keysApi.import(
      mnemonic,
      derivation,
      algorithm as KeypairType | 'x25519',
      name
    )
      .then(() => {
        setSnackbarMessage('Key imported successfully')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setSnackbarMessage(`Error importing key: ${e.message}`)
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
        }
      })
  }

  return (
      <Container>
        <Box>
          <Text>Import Key</Text>
          <Grid container direction="column" spacing={1}>
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
                  )
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
                        keysApi.generateMnemonic(12).then((mnemonic) => {
                          setMnemonic(mnemonic)
                        }).catch((e: unknown) => {
                          if (e instanceof Error) {
                            setSnackbarMessage(
                              `Error generating mnemonic: ${e.message}`
                            )
                            setSnackbarSeverity('error')
                            setSnackbarOpen(true)
                          }
                        })
                      }}
                    />
                  )
                }}
              />
            </Grid>
            <Grid item>
              <TextInput
                fullWidth
                id="derivation"
                label="Derivation Path"
                value={derivation}
                onChange={(e) => {
                  setDerivation(e.target.value)
                }}
              />
            </Grid>
            <Grid item>
              < fullWidth>
                <InputLabel id="algorithm">Algorithm</InputLabel>
                <Select
                    fullWidth
                    id="algorithm"
                    label="Algorithm"
                    value={algorithm}
                    onChange={(e) => {
                      setAlgorithm(e.target.value)
                    }}
                >
                    <MenuItem value={'sr25519'}>Sr25519</MenuItem>
                    <MenuItem value={'ed25519'}>Ed25519</MenuItem>
                    <MenuItem value={'ecdsa'}>Ecdsa</MenuItem>
                    <MenuItem value={'ethereum'}>Ethereum</MenuItem>
                    <MenuItem value={'x25519'}>x25519</MenuItem>
                </Select>
            </>
            </Grid>
            <Grid item>
              <TouchableOpacity variant="outlined" onClick={addKey}>
                Add Key
              </TouchableOpacity>
            </Grid>
          </Grid>
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
