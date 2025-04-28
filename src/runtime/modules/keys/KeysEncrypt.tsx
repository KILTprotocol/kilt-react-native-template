import React, { useEffect, useState } from 'react'
import { type KeyInfo, type KeysApiProvider } from '../../interfaces'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { TextInput } from 'react-native'

const enc = new TextEncoder()

export default function KeysEncrypt<R extends KeysApiProvider>(props: { runtime: R }): JSX.Element {
  const keysApi = props.runtime.getKeysApi()

  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [payload, setPayload] = useState('')
  const [encrypted, setEncrypted] = useState('')

  useEffect(() => {
    keysApi.list().then((keys) => {
      const encryptionKeys = keys.filter((k) => k.type === 'x25519')
      if (encryptionKeys.length > 0) {
        setSender(encryptionKeys[0].kid)
      }
      setKeys(encryptionKeys)
    })
  }, [])

  const SenderSelect = (): JSX.Element => {
    return (
      <View>
        <Text>Sender</Text>
        {/* <Select
          
          id="sender"
          label="Sender"
          value={sender}
          onChangeText={
            setSender()
          }}
        >
          {keys.map((md) => (
            <MenuItem key={md.kid} value={md.kid}>
              {md.name + ` (${md.kid.substring(0, 14)}...)`}
            </MenuItem>
          ))}
        </Select> */}
      </View>
    )
  }

  const encrypt = (): void => {
    const receiverPubkey: Uint8Array = Buffer.from(receiver.slice(2), 'hex')
    keysApi
      .encrypt(sender, receiverPubkey, enc.encode(payload))
      .then((res) => {
        setEncrypted('0x' + Buffer.from(res).toString('hex'))
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <View>
      <Text>Encrypt</Text>

      <SenderSelect />

      <TextInput value={receiver} onChangeText={setReceiver} />

      <TextInput value={payload} onChangeText={setPayload} placeholder="Payload" />

      <TouchableOpacity onPress={encrypt}>Encrypt</TouchableOpacity>

      <TextInput value={encrypted} onChangeText={} />
    </View>
  )
}
