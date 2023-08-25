import React, { useEffect } from 'react'

import { sendError, sendResponse } from '../../utils/response'

import { type DidDocument, type Container } from '../../interfaces'
import { CacheTimeSelect } from '../../utils/CacheTimeSelect'

// DidsListConsent gets a list of keys as arguments and asks the user to confirm
// which of the keys they want to share with the requesting origin.
function DidsListConsent(): JSX.Element {
  const query = new URLSearchParams(window.location.search)
  const origin = query.get('__origin')
  const rawArgs = query.get('__args')
  if (rawArgs === null || rawArgs === '') {
    sendError('no arguments')
      .then(() => {
        window.close()
      })
      .catch(() => {
        window.close()
      })
    throw new Error('no arguments')
  }
  const args: { dids: DidDocument[] } = JSON.parse(rawArgs)
  const { dids } = args

  const [selected, setSelected] = React.useState<DidDocument[]>([])
  const [cacheSeconds, setCacheSeconds] = React.useState<number>(0)

  console.log('selected:', selected)
  const handleSelect = (did: string): void => {
    const didDoc = dids.find((d) => d.id === did)
    if (didDoc === undefined) {
      throw new Error('DID not found')
    }
    console.log('handleSelect', didDoc)
    if (selected.find((d) => d.id === didDoc.id) !== undefined) {
      console.log('removing', didDoc)
      setSelected(selected.filter((d) => d.id !== didDoc.id))
    } else {
      console.log('adding', didDoc)
      setSelected([...selected, didDoc])
    }
  }

  useEffect(() => {
    if (dids.length > 0) {
      handleSelect(dids[0].id)
    }
  }, [])

  return (
    <Container sx={{ textAlign: 'center' }}>
      <h3>Share Keys</h3>
      <p>Please select the DIDs you want to share.</p>
      <p>Origin: {origin}</p>
      <List>
        {dids.map((did) => {
          return (
            <ListItem
              key={did.id}
              secondaryAction={
                <IconButton
                  aria-label="comment"
                  onClick={() => {
                    handleSelect(did.id)
                  }}
                >
                  {selected.find((d) => d.id === did.id) !== undefined ? <YesIcon /> : <NoIcon />}
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => {
                  handleSelect(did.id)
                }}
              >
                <ListItemIcon>
                  <VpnKeyIcon />
                </ListItemIcon>
                <ListItemText
                  secondary={<Text noWrap>{did.id}</Text>}
                  primary={did.alsoKnownAs[0] ?? 'No Name'}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={8}>
          <CacheTimeSelect onSelect={setCacheSeconds} />
        </Grid>
        <Grid item xs={6}>
          <TouchableOpacity
            variant="contained"
            color="error"
            onClick={() => {
              sendError('user denied').finally(() => {
                window.close()
              })
            }}
          >
            No
          </TouchableOpacity>
        </Grid>
        <Grid item xs={6}>
          <TouchableOpacity
            variant="contained"
            color="success"
            onClick={() => {
              sendResponse(selected, { cacheSeconds }).finally(() => {
                window.close()
              })
            }}
          >
            Yes
          </TouchableOpacity>
        </Grid>
      </Grid>
    </Container>
  )
}

const didsListConsentViewContainer: Container = {
  id: 'dids-list-consent',
  component: DidsListConsent,
}

export { didsListConsentView }
