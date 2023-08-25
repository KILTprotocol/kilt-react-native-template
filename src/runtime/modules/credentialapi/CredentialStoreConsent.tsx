import React from 'react'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../utils/YesNo'
import type { KiltCredential, Container } from '../../interfaces'
import { CredentialDetails } from '../credentialstore/CredentialDetails'

function CredentialStoreConsent(): JSX.Element {
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
  const credential: KiltCredential = JSON.parse(rawArgs)

  return (
    <YesNo
      title="Store Credential"
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
        <h3>Store Credential</h3>
        <p>Are you sure you want to store the following credential?</p>
        <p>Origin: {origin}</p>
        <CredentialDetails cred={credential} />
      </Container>
    </YesNo>
  )
}

const credentialStoreConsentView: Container = {
  id: 'credential-store-consent',
  component: CredentialStoreConsent,
}

export { credentialStoreConsentView }
