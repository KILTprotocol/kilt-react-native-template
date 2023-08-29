import React, { ReactNode, createContext, useState } from 'react'
import { randomAsHex } from '@polkadot/util-crypto'

export const AuthContext = createContext({
  token: null,
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
})

function AuthContextProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState()
  function authenticate(token) {
    setAuthToken(randomAsHex())
  }
  function logout() {
    setAuthToken(null)
  }
  const value = {
    token: authToken,
    isAuthenicated: authToken!!,
    authenticate: authenticate,
    logout: logout,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
