import React, { ReactNode, createContext, useMemo, useState } from 'react'

export const AuthContext = createContext({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
})

function AuthContextProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<boolean | null>()

  function authenticate() {
    setAuthToken(true)
  }

  function logout() {
    setAuthToken(null)
  }

  const contextValue = useMemo(
    () => ({
      isAuthenticated: authToken,
      authenticate,
      logout,
    }),
    [authToken, authenticate, logout]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
