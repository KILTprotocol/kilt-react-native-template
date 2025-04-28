// ƒ
// import React, { useEffect, useState } from 'react'

// import type {
//   DidApiProvider,
//   KeysApiProvider,
//   KeyInfo
// } from '../../interfaces'
// import generateName from '../../utils/generateName'
// import { DidDocument } from './DidDocument'

// export function DidsCreate<R extends DidApiProvider & KeysApiProvider> (props: {
//   runtime: R
// }): JSX.Element {
//   const { runtime } = props
//   const didsApi = runtime.getDidApi()
//   const keysApi = runtime.getKeysApi()

//   const [didDocument, setDidDocument] = useState<DidDocument>(new DidDocument(undefined))
//   const [availableKeys, setAvailableKeys] = useState<KeyInfo[]>([])
//   const [did, setDid] = useState('')
//   const [name, setName] = useState('')

//   console.log('render import page, calling useEffect')
//   useEffect(() => {
//     keysApi.list().then((keys) => {
//       console.log('got keys', keys)
//       setAvailableKeys(keys)
//     })
//   }, [])

//   const importDid = function (): void {
//     didsApi
//       .import(didDocument)

//   }

//   const KeyList = function (props: { didDocument: DidDocument, possibleKeys: KeyInfo[] }): JSX.Element {
//     const { didDocument, possibleKeys } = props
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
//             {/* <List>
//               {didDocument.verificationMethod.map((key) => {
//                 return (
//                   <ListItem key={key.publicKeyBase58}>
//                     <ListItemIcon>
//                       <VpnKeyIcon />
//                     </ListItemIcon>
//                     <ListItemText primary={key.publicKeyBase58} secondary={key.type} />
//                   </ListItem>
//                 )
//               })}
//             </List>
//           </Grid> */}
//           <Grid item xs={3}>
//             <PairSelect/>
//           </Grid>
//           <Grid item xs={3}>
//           < >
//             <Text>Usage</Text>
//             <Select
//               
//               id="usage"
//               label="Usage"
//               value={usage}
//               onChangeText={
//                 setUsage()
//               }}
//             >
//               {['authentication', 'attestation', 'delegation', 'encryption'].map((usage) => (
//                 <MenuItem key={usage} value={usage}>{usage}</MenuItem>
//               ))}
//             </Select>
//           </>
//           </Grid>
//           <Grid item xs={3}>
//             <TouchableOpacity variant="outlined" onClick={() => {
//               const keyInfo = possibleKeys.find((k) => k.kid === key)
//               if (keyInfo !== undefined) {
//                 didDocument.addKey(keyInfo, usage)
//                 setDidDocument(new DidDocument(didDocument))
//               }
//             }}>Add</TouchableOpacity>
//           </Grid>
//         </Grid>
//       </Box>
//     )
//   }

//   return (
//     <Container>
//       <Box>
//         <Text>Create Did</Text>
//         <Grid container spacing={1} direction="column">
//           <Grid item xs={3}>
//             <TextInput
//               
//               label="Did"
//               value={did}
//               onChangeText={
//                 setDid()
//               }}
//             />
//           </Grid>
//           <Grid item xs={3}>
//           <TextInput
//                 
//                 id="name"
//                 label="Name"
//                 value={name}
//                 onChangeText={
//                   setName()
//                 }}
//                 InputProps={{
//                   endAdornment: (
//                     <ShuffleIcon
//                       onClick={(): void => {
//                         setName(generateName())
//                       }}
//                     />
//                   )
//                 }}
//               />
//           </Grid>
//           <Grid item xs={3}>
//             <KeyList didDocument={didDocument} possibleKeys={availableKeys} />
//           </Grid>
//           <Grid item xs={3}>
//             <TouchableOpacity onClick={importDid}  >Import DID</TouchableOpacity>
//           </Grid>
//         </Grid>
//       </Box>

//     </Container>
//   )
// }
