import React from 'react'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../utils/YesNo'
import { type Container } from '../../interfaces'

function KeysEncryptConsent(): JSX.Element {
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
  const args: { senderKid: string; receiverPubkey: string; msg: string } = JSON.parse(rawArgs)
  const { senderKid, receiverPubkey, msg } = args

  return (
    <YesNo
      title="Encrypt Data"
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
        <h3>Encrypt Data</h3>
        <p>Are you sure you want to encrypt the following data?</p>
        <p>
          <strong>Sender KID:</strong> {senderKid}
        </p>
        <p>
          <strong>Receiver Pubkey:</strong> {receiverPubkey}
        </p>
        <p>
          <strong>Data:</strong> {msg}
        </p>
        <p>Origin: {origin}</p>
      </Container>
    </YesNo>
  )
}

const keysEncryptConsentViewContainer: Container = {
  id: 'keys-encrypt-consent',
  component: KeysEncryptConsent,
}

export { keysEncryptConsentView }
