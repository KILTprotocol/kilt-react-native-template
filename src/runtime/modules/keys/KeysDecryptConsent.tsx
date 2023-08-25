import React from 'react'
import { sendError, sendResponse } from '../../utils/response'

import YesNo from '../../utils/YesNo'
import { type Container } from '../../interfaces'

function KeysDecryptConsent(): JSX.Element {
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
  const args: { receiverKid: string; senderPubkey: string; msg: string } = JSON.parse(rawArgs)
  const { receiverKid, senderPubkey, msg } = args

  return (
    <YesNo
      title="Decrypt Data"
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
        <h3>Decrypt Data</h3>
        <p>Are you sure you want to decrypt the following data?</p>
        <p>
          <strong>Receiver KID:</strong> {receiverKid}
        </p>
        <p>
          <strong>Sender Pubkey:</strong> {senderPubkey}
        </p>
        <p>
          <strong>Data:</strong> {msg}
        </p>
        <p>Origin: {origin}</p>
      </Container>
    </YesNo>
  )
}

const keysDecryptConsentViewContainer: Container = {
  id: 'keys-decrypt-consent',
  component: KeysDecryptConsent,
}

export { keysDecryptConsentView }
