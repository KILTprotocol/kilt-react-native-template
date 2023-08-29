import React, { useState } from 'react'

import { encodeAddress, mnemonicGenerate } from '@polkadot/util-crypto'

import type { DidApiProvider, KeysApiProvider } from '../../interfaces'
import generateName from '../../utils/generateName'
import { DidDocument } from './DidDocument'
import { View, TextInput, TouchableOpacity } from 'react-native'

export function DidsImport<R extends DidApiProvider & KeysApiProvider>(props: {
  runtime: R
}): JSX.Element {
  const { runtime } = props
  const didsApi = runtime.getDidApi()
  const keysApi = runtime.getKeysApi()

  const [mnemonic, setMnemonic] = useState(mnemonicGenerate())
  const [name, setName] = useState(generateName())

  const [progress, setProgress] = useState<[number, string]>([0, ''])
  const [inProgress, setInProgress] = useState(false)

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
  }

  return (
    <View>
      <Text>Import Did</Text>

      <TextInput
        id="name"
        label="Name"
        value={name}
        onChangeText={setName}
        // InputProps={{
        //   endAdornment: (
        //     <ShuffleIcon
        //       onClick={(): void => {
        //         setName(generateName())
        //       }}
        //     />
        //   ),
        // }}
      />

      <TextInput
        id="mnemonic"
        label="Mnemonic"
        value={mnemonic}
        onChangeText={setMnemonic}
        // InputProps={{
        //   endAdornment: (
        //     <ShuffleIcon
        //       onClick={(): void => {
        //         keysApi
        //           .generateMnemonic(12)
        //           .then((mnemonic) => {
        //             setMnemonic(mnemonic)
        //           })

        //       }}
        //     />
        //   ),
        // }}
      />

      <TouchableOpacity
        disabled={inProgress}
        variant="contained"
        onClick={(): void => {
          generateDid().then(() => {
            setInProgress(false)
          })
        }}
      >
        Import DID
      </TouchableOpacity>

      {inProgress && (
        <div>
          <CircularProgressWithLabel value={progress[0]} />
          <Text>{progress[1]}</Text>
        </div>
      )}
    </View>
  )
}

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }): JSX.Element {
  return (
    <>
      <CircularProgress variant="determinate" {...props} />

      <Text variant="caption" component="div" color="text.secondary">{`${Math.round(
        props.value
      )}%`}</Text>
    </>
  )
}
