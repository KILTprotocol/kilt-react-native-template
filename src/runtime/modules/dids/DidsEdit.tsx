// import React, { useEffect, useState } from 'react'

// import type {
//   DidApiProvider,
//   KeysApiProvider,
//   KeyInfo,
//   DidVerificationMethod
// } from '../../interfaces'
// import generateName from '../../utils/generateName'
// import { DidDocument } from './DidDocument'
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

// export function DidsEdit<R extends DidApiProvider & KeysApiProvider> ({ navigation, route }): JSX.Element {
//   const { runtime } = props
//   const didsApi = runtime.getDidApi()
//   const keysApi = runtime.getKeysApi()
//   const [availableDids, setAvailableDids] = useState<DidDocument[]>([])
//   const [availableKeys, setAvailableKeys] = useState<KeyInfo[]>([])
//   const [selectedDid, setSelectedDid] = useState<DidDocument | null>(null)
//   const [name, setName] = useState('')

//   useEffect(() => {
//     keysApi.list().then((keys) => {
//       console.log('got keys', keys)
//       setAvailableKeys(keys)
//     })
//   }, [])

//   useEffect(() => {
//     didsApi.list().then((dids) => {
//       console.log('got dids', dids)
//       setAvailableDids(dids.map((did) => new DidDocument(did)))
//     })})

//   useEffect(() => {
//     if (selectedDid !== null) {
//       setName(selectedDid.alsoKnownAs[0] ?? '')
//     }
//   }, [selectedDid])

//   const DidSelect = function (props: { possibleDids: DidDocument[] }): JSX.Element {
//     const { possibleDids } = props
//     return (
//       <>
//         <Text>Did</Text>
//         <Select
//           id="did"
//           label="Did"
//           value={selectedDid?.id ?? ''}
//           onChangeText={
//             const did = possibleDids.find((did) => did.id === )
//             setSelectedDid(did ?? null)
//           } }
//         >
//           {possibleDids.map((did) => (
//             <MenuItem key={did.id} value={did.id}>
//               <Grid container spacing={1} direction="row" alignItems="center">
//                 <Grid item>
//                 <MaterialCommunityIcons name="person" color={'green'} />

//                 </Grid>
//                 <Grid item>
//                   <Text >{did.alsoKnownAs[0] ?? 'No Name'}</Text>
//                 </Grid>
//                 <Grid item>
//                   <Text noWrap variant="subtitle1" color="text.secondary">{did.id}</Text>
//                 </Grid>
//               </Grid>
//             </MenuItem>
//           ))}
//         </Select>
//       </>
//     )
//   }

//   const KeyList = function (props: { keys: DidVerificationMethod[], possibleKeys: KeyInfo[] }): JSX.Element {
//     const { keys, possibleKeys } = props
//     const [key, setKey] = useState('')
//     const [usage, setUsage] = useState('')

//     const PairSelect = (): JSX.Element => (
//       < >
//         <Text>Key</Text>
//         <Select
//           
//           id="pair"
//           label="Key"
//           value={key}
//           onChangeText={
//             setKey()
//           } }
//         >
//           {possibleKeys.map((key) => (
//             <MenuItem key={key.kid} value={key.kid}>
//               <Grid container spacing={1} direction="row" alignItems="center">
//                 <Grid item>
//                   <VpnKeyIcon />
//                 </Grid>
//                 <Grid item>
//                   <Text >{key.name + ` (${(key.kid).substring(0, 14)}...)`}</Text>
//                 </Grid>
//                 <Grid item>
//                   <Text variant="subtitle1" color="text.secondary">{key.type}</Text>
//                 </Grid>
//               </Grid>
//             </MenuItem>
//           ))}
//         </Select>
//       </>
//     )

//     return (
//       <Box>
//         <Grid container spacing={1} direction="column">
//           <h2>Keys</h2>
//           <Grid item xs={3}>
//             <List>
//               {keys.map((key, idx) => {
//                 return (
//                   <ListItem
//                     key={`${key.id}-${idx}`}
//                     secondaryAction={
//                       <IconButton
//                         aria-label="comment"
//                         onClick={() => {
//                           if (selectedDid === null) {
//                             return
//                           }
//                           selectedDid.removeKey(key.id)
//                           setSelectedDid(new DidDocument(selectedDid))
//                         }}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     }
//                   >
//                     <ListItemIcon>
//                       <VpnKeyIcon />
//                     </ListItemIcon>
//                     <ListItemText primary={key.id} secondary={key.type} />
//                   </ListItem>
//                 )
//               })}
//             </List>
//           </Grid>
//           <Grid item xs={3}>
//             <Grid container spacing={1} direction="column">
//               <Grid item xs={6}>
//                   <PairSelect/>
//               </Grid>
//               <Grid item xs={6}>
//                 < >
//                   <Text>Usage</Text>
//                   <Select
//                   
//                   id="usage"
//                   label="Usage"
//                   value={usage}
//                   onChangeText={
//                     setUsage()
//                   }}
//                   >
//                   {['authentication', 'attestation', 'delegation', 'encryption'].map((usage) => (
//                       <MenuItem key={usage} value={usage}>{usage}</MenuItem>
//                   ))}
//                   </Select>
//                 </>
//               </Grid>
//             </Grid>
//           </Grid>
//           <Grid item xs={3}>
//             <TouchableOpacity variant="outlined" onClick={() => {
//               const keyInfo = possibleKeys.find((k) => k.kid === key)
//               if (keyInfo !== undefined && selectedDid !== undefined) {
//                 selectedDid?.addKey(keyInfo, usage)
//                 setSelectedDid(new DidDocument(selectedDid ?? undefined /* wont happen */))
//               }
//             }}>Add</TouchableOpacity>
//           </Grid>
//         </Grid>
//       </Box>
//     )
//   }

//   const saveDid = async (): Promise<void> => {
//     if (selectedDid === null) {
//       return
//     }
//     await didsApi.update(selectedDid)

//   }

//   return (
//     <Container>
//       <Box>
//         <Text>Edit Did</Text>
//         <Grid container spacing={1} direction="column">
//           <Grid item xs={3}>
//             <DidSelect possibleDids={availableDids} />
//           </Grid>
//           <Grid item xs={3}>
//           <TextInput
//             
//             id="name"
//             label="Name"
//             value={name}
//             onChangeText={
//               if (selectedDid === null) {
//                 return
//               }
//               selectedDid.alsoKnownAs = []
//               setSelectedDid(new DidDocument(selectedDid))
//             }}
//             InputProps={{
//               endAdornment: (
//                 <ShuffleIcon
//                   onClick={(): void => {
//                     setName(generateName())
//                   }}
//                 />
//               )
//             }}
//           />
//           </Grid>
//           <Grid item xs={3}>
//             <KeyList keys={selectedDid?.verificationMethod ?? []} possibleKeys={availableKeys} />
//           </Grid>
//           <Grid item xs={3}>
//             <TouchableOpacity onClick={() => {
//               saveDid()
//             }}  >Save Updates</TouchableOpacity>
//           </Grid>
//         </Grid>
//       </Box>

//     </Container>
//   )
// }
