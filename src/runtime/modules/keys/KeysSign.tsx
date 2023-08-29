import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import { signatureVerify } from '@polkadot/util-crypto'

const enc = new TextEncoder()

export default function KeysSign<R extends KeysApiProvider>(props: { runtime: R }): JSX.Element {
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
    })
  }, [])

  const PairSelect = (): JSX.Element => (
    <>
      <Text>Signer</Text>
      <Select id="pair" label="Signer" value={selectedKey} onChangeText={setSelectedKey}>
        {keys.map((key) => (
          <MenuItem key={key.kid} value={key.kid}>
            {key.name + ` (${key.kid.substring(0, 14)}...)`}
          </MenuItem>
        ))}
      </Select>
    </>
  )

  const sign = (): void => {
    if (selectedKey === undefined) return
    keysApi.sign(selectedKey, enc.encode(text)).then((sig) => {
      setSig('0x' + Buffer.from(sig).toString('hex'))
    })
  }

  useEffect(() => {
    if (selectedKey === '' || sig === '' || text === '') return
    const res = signatureVerify(text, sig, selectedKey)
    setSigValid(res.isValid)
  }, [sig, text, selectedKey])

  return (
    <Container>
      <Text>Sign</Text>
      <Grid container spacing={1} direction="column">
        <Grid item>
          <PairSelect />
        </Grid>
        <Grid item>
          <TextInput value={text} onChangeText={setText} label="Text" />
        </Grid>
        <Grid item>
          <TextInput value={sig} onChangeText={setSig} label="Signature" />
        </Grid>
        <Grid item>
          <TouchableOpacity variant="outlined" onClick={sign}>
            Sign
          </TouchableOpacity>
        </Grid>
        <Grid item>Signature is valid: {sigValid ? 'true' : 'false'}</Grid>
      </Grid>
    </Container>
  )
}
