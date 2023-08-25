import React from 'react'

import { sendError, sendResponse } from '../../utils/response'

import { type KeyInfo, type Container } from '../../interfaces'
import { CacheTimeSelect } from '../../utils/CacheTimeSelect'

// KeysListConsent gets a list of keys as arguments and asks the user to confirm
// which of the keys they want to share with the requesting origin.
function KeysListConsent(): JSX.Element {
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
  const args: { keys: KeyInfo[] } = JSON.parse(rawArgs)
  const { keys } = args

  const [selected, setSelected] = React.useState<KeyInfo[]>([])
  const [cacheSeconds, setCacheSeconds] = React.useState<number>(0)

  console.log('selected:', selected)
  const handleSelect = (kid: string): void => {
    const key = keys.find((k) => k.kid === kid)
    if (key === undefined) {
      throw new Error('key not found')
    }
    console.log('handleSelect', key)
    if (selected.find((k) => k.kid === kid) !== undefined) {
      console.log('removing', key)
      setSelected(selected.filter((k) => k.kid !== key.kid))
    } else {
      console.log('adding', key)
      setSelected([...selected, key])
    }
  }

  return (
    <Container sx={{ textAlign: 'center' }}>
      <h3>Share Keys</h3>
      <p>Please select the keys you want to share.</p>
      <p>Origin: {origin}</p>
      <List>
        {keys.map((key) => {
          return (
            <ListItem
              key={key.kid}
              secondaryAction={
                <IconButton
                  aria-label="comment"
                  onClick={() => {
                    handleSelect(key.kid)
                  }}
                >
                  {selected.find((k) => k.kid === key.kid) !== undefined ? <YesIcon /> : <NoIcon />}
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => {
                  handleSelect(key.kid)
                }}
              >
                <ListItemIcon>
                  <VpnKeyIcon />
                </ListItemIcon>
                <ListItemText
                  secondary={<Text noWrap>{key.kid}</Text>}
                  primary={
                    <React.Fragment>
                      {key.name}
                      <Text
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {' - ' + key.type}
                      </Text>
                    </React.Fragment>
                  }
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

const keysListConsentViewContainer: Container = {
  id: 'keys-list-consent',
  component: KeysListConsent,
}

export { keysListConsentView }
