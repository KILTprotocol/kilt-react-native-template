
import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import Snackbar from '../../utils/snackbar'

const enc = new TextEncoder()

export default function KeysEncrypt<R extends KeysApiProvider> (props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [payload, setPayload] = useState('')
  const [encrypted, setEncrypted] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
  'success' | 'info' | 'warning' | 'error'
  >('success')

  useEffect(() => {
    keysApi.list().then((keys) => {
      const encryptionKeys = keys.filter((k) => k.type === 'x25519')
      if (encryptionKeys.length > 0) {
        setSender(encryptionKeys[0].kid)
      }
      setKeys(encryptionKeys)
    }).catch((e) => {
      setSnackbarMessage(e.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      console.error(e)
    })
  }, [])

  const SenderSelect = (): JSX.Element => {
    return (
        < fullWidth>
            <InputLabel>Sender</InputLabel>
            <Select
            fullWidth
            id="sender"
            label="Sender"
            value={sender}
            onChange={(e) => {
              setSender(e.target.value)
            }}
            >
            {keys.map((md) => (
                <MenuItem key={md.kid} value={md.kid}>
                {md.name + ` (${(md.kid).substring(0, 14)}...)`}
                </MenuItem>
            ))}
            </Select>
        </>
    )
  }

  const encrypt = (): void => {
    const receiverPubkey: Uint8Array = Buffer.from(receiver.slice(2), 'hex')
    keysApi.encrypt(sender, receiverPubkey, enc.encode(payload)).then((res) => {
      setEncrypted('0x' + Buffer.from(res).toString('hex'))
    }).catch((err) => {
      setSnackbarMessage(err.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      console.error(err)
    })
  }

  return (
      <Container>
        <Box>
          <h1>Encrypt</h1>
          <Grid container spacing={1} direction="column">
            <Grid item>
              <SenderSelect />
            </Grid>
            <Grid item>
              <TextInput
                value={receiver}
                onChange={(e) => { setReceiver(e.target.value) }}
                label="Receiver"
                fullWidth
              />
            </Grid>
            <Grid item>
              <TextInput
                value={payload}
                onChange={(e) => { setPayload(e.target.value) }}
                label="Payload"
                fullWidth
              />
            </Grid>
            <Grid item>
              <TouchableOpacity variant="outlined" onClick={encrypt}>
                Encrypt
              </TouchableOpacity>
            </Grid>
            <Grid item>
              <TextInput
                value={encrypted}
                onChange={(e) => {}}
                label="Encrypted"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
        <Snackbar
            open={snackbarOpen}
            handleClose={() => { setSnackbarOpen(false) }}
            message={snackbarMessage}
            severity={snackbarSeverity}
        />
      </Container>
  )
}
