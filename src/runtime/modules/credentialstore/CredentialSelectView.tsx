import React from 'react'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../utils/YesNo'
import type { KiltCredential, Container } from '../../interfaces'

function CredentialSelectView(): JSX.Element {
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
  const credentials: KiltCredential[] = JSON.parse(rawArgs)

  const [selectedCredential, setSelectedCredential] = React.useState<string | undefined>(
    credentials.length > 0 ? credentials[0].rootHash : undefined
  )

  return (
    <YesNo
      title="Select Credential"
      onYes={(cacheSeconds) => {
        sendResponse(selectedCredential, { cacheSeconds }).finally(() => {
          window.close()
        })
      }}
      onNo={() => {
        sendError('user denied').finally(() => {
          window.close()
        })
      }}
    >
      <Container sx={{ textAlign: 'center' }}>
        <h3>Select Credential</h3>
        <p>Please select a Credential to proceed.</p>
        <p>Origin: {origin}</p>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <Person />
          </Grid>
          <Grid item>
            <Select
              value={selectedCredential}
              onChange={(event: SelectChangeEvent) => {
                console.log('selected credential: ', event.target.value)
                setSelectedCredential(event.target.value)
              }}
            >
              {credentials.map((cred) => {
                return (
                  <MenuItem key={cred.rootHash} value={cred.rootHash}>
                    {cred.cType.title} ({cred.claim.owner})
                  </MenuItem>
                )
              })}
            </Select>
          </Grid>
        </Grid>
      </Container>
    </YesNo>
  )
}

const credentialSelectView: Container = {
  id: 'credential-select-view',
  component: CredentialSelectView,
}

export { credentialSelectView }
