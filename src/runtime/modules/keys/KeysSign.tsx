
import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import { signatureVerify } from '@polkadot/util-crypto'

const enc = new TextEncoder()

export default function KeysSign<R extends KeysApiProvider> (props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [text, setText] = useState('')
  const [sig, setSig] = useState('')
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [sigValid, setSigValid] = useState<boolean>(false)

  useEffect(() => {
    keysApi.list().then((keys) => {
      const signingKeys = keys.filter((k) => k.type !== 'x25519')
      if (signingKeys.length > 0) {
        setSelectedKey(signingKeys[0].kid)
      }
      setKeys(signingKeys)
    }).catch((e) => {
      console.error(e)
    })
  }, [])

  const PairSelect = (): JSX.Element => (
      < fullWidth>
        <InputLabel>Signer</InputLabel>
        <Select
          fullWidth
          id="pair"
          label="Signer"
          value={selectedKey}
          onChange={(e) => {
            setSelectedKey(e.target.value)
          } }
        >
          {keys.map((key) => (
            <MenuItem key={key.kid} value={key.kid}>
              {key.name + ` (${(key.kid).substring(0, 14)}...)`}
            </MenuItem>
          ))}
        </Select>
      </>
  )

  const sign = (): void => {
    if (selectedKey === undefined) return
    keysApi.sign(selectedKey, enc.encode(text)).then((sig) => {
      setSig('0x' + Buffer.from(sig).toString('hex'))
    }).catch((e) => {
      console.error(e)
    })
  }

  useEffect(() => {
    if (selectedKey === '' || sig === '' || text === '') return
    const res = signatureVerify(text, sig, selectedKey)
    setSigValid(res.isValid)
  }, [sig, text, selectedKey])

  return (
      <Container>
        <Box>
          <h1>Sign</h1>
          <Grid container spacing={1} direction="column">
            <Grid item>
              <PairSelect />
            </Grid>
            <Grid item>
              <TextInput
                value={text}
                onChange={(e) => { setText(e.target.value) }}
                label="Text"
                fullWidth
              />
            </Grid>
            <Grid item>
              <TextInput
                value={sig}
                onChange={(e) => {}}
                label="Signature"
                fullWidth
              />
            </Grid>
            <Grid item>
              <TouchableOpacity variant="outlined" onClick={sign}>
                Sign
              </TouchableOpacity>
            </Grid>
            <Grid item>
              Signature is valid: {sigValid ? 'true' : 'false'}
            </Grid>
          </Grid>
        </Box>
      </Container>
  )
}
