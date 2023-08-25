
import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import Snackbar from '../../utils/snackbar'

const dec = new TextDecoder()

export default function KeysDecrypt<R extends KeysApiProvider> (props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [payload, setPayload] = useState('')
  const [decrypted, setDecrypted] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
  'success' | 'info' | 'warning' | 'error'
  >('success')

  useEffect(() => {
    keysApi.list().then((keys) => {
      const encryptionKeys = keys.filter((k) => k.type === 'x25519')
      if (encryptionKeys.length > 0) {
        setReceiver(encryptionKeys[0].kid)
      }
      setKeys(encryptionKeys)
    }).catch((e) => {
      setSnackbarMessage(e.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      console.error(e)
    })
  }, [])

  const decrypt = (): void => {
    const senderPubkey = Buffer.from(sender.substring(2), 'hex')
    const data = Buffer.from(payload.substring(2), 'hex')
    keysApi.decrypt(receiver, senderPubkey, data).then((res) => {
      setDecrypted(dec.decode(res))
    }).catch((err) => {
      setDecrypted('')
      setSnackbarMessage(err.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      console.error(err)
    })
  }

  const ReceiverSelect = (): JSX.Element => {
    return (
      < fullWidth>
        <InputLabel>Receiver</InputLabel>
        <Select
          fullWidth
          id="receiver"
          label="Receiver"
          value={receiver}
          onChange={(e) => {
            setReceiver(e.target.value)
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

  return (
    <Container>
      <Box>
        <Text>Decrypt</Text>
        <Grid container spacing={1} direction="column">
          <Grid item>
            <ReceiverSelect />
          </Grid>
          <Grid item>
            <TextInput
              value={sender}
              onChange={(e) => { setSender(e.target.value) }}
              label="Sender"
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextInput
              value={payload}
              onChange={(e) => { setPayload(e.target.value) }}
              label="Encrypted"
              fullWidth
            />
          </Grid>
          <Grid item>
            <TouchableOpacity variant="outlined" onClick={decrypt}>
              Decrypt
            </TouchableOpacity>
          </Grid>
          <Grid item>
            <TextInput
              value={decrypted}
              onChange={(e) => { }}
              label="Decrypted"
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
