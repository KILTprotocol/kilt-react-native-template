import React from 'react'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../utils/YesNo'
import { type Container } from '../../interfaces'

function KeysSignConsent(): JSX.Element {
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
  const args: { kid: string; msg: string } = JSON.parse(rawArgs)
  const { kid, msg } = args

  return (
    <YesNo
      title="Sign Data"
      onYes={(cacheSeconds) => {
        sendResponse(true, { cacheSeconds }).finally(() => {
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
        <h3>Sign Data</h3>
        <p>Are you sure you want to sign the following data?</p>
        <p>
          <strong>KID:</strong> {kid}
        </p>
        <p>
          <strong>Data:</strong> {msg}
        </p>
        <p>Origin: {origin}</p>
      </Container>
    </YesNo>
  )
}

const keysSignConsentViewContainer: Container = {
  id: 'keys-sign-consent',
  component: KeysSignConsent,
}

export { keysSignConsentView }
