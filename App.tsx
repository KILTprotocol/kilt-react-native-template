import './globals';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import nacl from 'tweetnacl';
import { Did, init, KeyringPair, Utils } from '@kiltprotocol/sdk-js';
import Keyring from '@polkadot/keyring';

export default function App() {
  const [did, setDid] = useState('<fetching...>');
  const [pair, setPair] = useState<KeyringPair>();
  const [signature, setSignature] = useState<string>();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const seed = Utils.Crypto.hash('buuuu');
    setPair(new Keyring().addFromSeed(seed));
    (async () => {
      await init({ address: 'wss://spiritnet.kilt.io' });
      const didOrNull = await Did.Web3Names.queryDidForWeb3Name('john_doe');
      if (didOrNull) setDid(didOrNull);
    })();
  }, []);

  useEffect(() => {
    const uuid = Utils.UUID.generate();
    if (pair) {
      setSignature(Utils.Crypto.u8aToHex(pair.sign(uuid)));
      setMessage(
        Utils.Crypto.encryptAsymmetricAsStr(
          'hellooooo',
          pair.publicKey,
          nacl.box.keyPair().secretKey
        ).box
      );
    }
  }, [pair]);
  return (
    <View style={styles.container}>
      <Text>John Doe's did is: {did}</Text>
      {pair && <Text>My Address is: {pair.address}</Text>}
      {signature && <Text>This is my signature: {signature}</Text>}
      {message && <Text>This is my encrypted message: {message}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
