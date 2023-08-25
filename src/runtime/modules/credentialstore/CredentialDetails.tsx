import { View, Text, FlatList, StyleSheet } from 'react-native'
import React from 'react'
import { type KiltCredential } from '../../interfaces'

export function CredentialDetails({ cred }: { cred: KiltCredential }): JSX.Element {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 22,
    },
    item: {
      padding: 10,
      fontSize: 18,
      height: 44,
    },
  })
  return (
    <View>
      <Text>Credential Details</Text>
      <Text>{cred.cType.title}</Text>
      <FlatList
        data={[cred]}
        renderItem={({ item }) => <Text style={styles.item}>{item.attester}</Text>}
      >
        {/* <ListItem key={'owner'}>
          <ListItemText primary={'Owner'} secondary={cred.claim.owner} />
        </ListItem>
        <ListItem key={'ctype'}>
          <ListItemText primary={'CType'} secondary={cred.claim.cTypeHash} />
        </ListItem>
        <ListItem key={'rootHash'}>
          <ListItemText primary={'Root Hash'} secondary={cred.rootHash} />
        </ListItem>
        <ListItem key={'attester'}>
          <ListItemText primary={'Attester'} secondary={cred.attester} />
        </ListItem>
        <ListSubheader>Contents</ListSubheader>
        {Object.entries(cred.claim.contents).map(([key, value]) => {
          return (
            <ListItem key={key}>
              <ListItemText primary={key} secondary={JSON.stringify(value)} />
            </ListItem>
          )
        })} */}
      </FlatList>
    </View>
  )
}
