import { type Container } from '../../interfaces'
import { sendResponse } from '../../utils/response'
import React from 'react'

import { UnlockStorageScreen } from './UnlockStorage'

const passwordView: Container = {
  id: 'get-password',
  component: () => {
    return (
      <UnlockStorageScreen
        onUnlock={(password: string) => {
          console.log('sending response to backend')
          sendResponse({ password })
            .then(() => {
              console.log('response send from the popup, closing window')
              window.close()
            })
            .catch(() => {
              console.log('error sending response from the popup, closing window')
              window.close()
            })
        }}
      />
    )
  },
}

export { passwordView }
