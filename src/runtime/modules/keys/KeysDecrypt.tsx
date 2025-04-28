import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import { View, TextInput, TouchableOpacity, Text } from 'react-native'

const dec = new TextDecoder()

export default function KeysDecrypt<R extends KeysApiProvider>(props: { runtime: R }) {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [payload, setPayload] = useState('')
  const [decrypted, setDecrypted] = useState('')

  useEffect(() => {
    keysApi.list().then((keys) => {
      const encryptionKeys = keys.filter((k) => k.type === 'x25519')
      if (encryptionKeys.length > 0) {
        setReceiver(encryptionKeys[0].kid)
      }
      setKeys(encryptionKeys)
    })
  }, [])

  const decrypt = (): void => {
    const senderPubkey = Buffer.from(sender.substring(2), 'hex')
    const data = Buffer.from(payload.substring(2), 'hex')
    keysApi
      .decrypt(receiver, senderPubkey, data)
      .then((res) => {
        setDecrypted(dec.decode(res))
      })
      .catch((err) => {
        setDecrypted('')
      })
  }

  const ReceiverSelect = (): JSX.Element => {
    return (
      <>
        <Text>Receiver</Text>
        {/* <Select id="receiver" label="Receiver" value={receiver} onChangeText={setReceiver}>
          {keys.map((md) => (
            <MenuItem key={md.kid} value={md.kid}>
              {md.name + ` (${md.kid.substring(0, 14)}...)`}
            </MenuItem>
          ))}
        </Select> */}
      </>
    )
  }

  return (
    <View>
      <Text>Decrypt</Text>

      <ReceiverSelect />

      <TextInput value={sender} onChangeText={setSender} label="Sender" />

      <TextInput value={payload} onChangeText={setPayload} label="Encrypted" />

      <TouchableOpacity variant="outlined" onClick={decrypt}>
        Decrypt
      </TouchableOpacity>

      <TextInput value={decrypted} onChangeText={setDecrypted} label="Decrypted" />
    </View>
  )
}
