import * as Kilt from '@kiltprotocol/sdk-js'

import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import Keyring from '@polkadot/keyring'

import styles from '../styles/styles'
import * as DidStore from '../storage/did/store'
import * as keyStore from '../storage/keys/store'
import { KeyInfo } from '../utils/interfaces'
import { getStorage } from '../storage/storage'

export default function ClaimW3nScreen() {
  const claimW3n = () => {
    console.log('Nice name')
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Claim your W3N</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => claimW3n()}>
        <Text>Confirm your w3n name</Text>
      </TouchableOpacity>
    </View>
  )
}
