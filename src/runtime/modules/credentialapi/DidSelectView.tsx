import React from 'react'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../utils/YesNo'
import type { DidDocument, Container } from '../../interfaces'

function DidSelectView(): JSX.Element {
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
  const dids: DidDocument[] = JSON.parse(rawArgs)

  const [selectedDid, setSelectedDid] = React.useState<string | null>(
    dids.length > 0 ? dids[0].id : null
  )

  return (
    <YesNo
      title="Select DID"
      onYes={(cacheSeconds) => {
        sendResponse(selectedDid, { cacheSeconds }).finally(() => {
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
        <h3>Select DID</h3>
        <p>Please select a DID to proceed.</p>
        <p>Origin: {origin}</p>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <Person />
          </Grid>
          <Grid item>
            <Select
              value={selectedDid}
              onChange={(_, value) => {
                setSelectedDid(value as string)
              }}
            >
              {dids.map((did) => {
                return (
                  <MenuItem key={did.id} value={did.id}>
                    {did.alsoKnownAs[0] ?? 'No Name'} ({did.id})
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

const didSelectViewContainer: Container = {
  id: 'did-select-view',
  component: DidSelectView,
}

export { didSelectViewContainer }
