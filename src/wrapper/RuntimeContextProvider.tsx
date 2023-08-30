import React, { ReactNode, createContext, useMemo, useState } from 'react'
import { NessieRuntime } from '../runtime'

export const RuntimeContext = createContext({
  nessieRuntime: null,
  getRuntime: (password: string) => {},
})

function RuntimeContextProvider({ children }: { children: ReactNode }) {
  const [initialisedRuntime, setInitialisedRuntime] = useState<NessieRuntime | null>()

  function getRuntime(password: string) {
    const nessieRuntime = new NessieRuntime(password)
    setInitialisedRuntime(nessieRuntime)
  }

  const contextValue = useMemo(
    () => ({
      nessieRuntime: initialisedRuntime,
      getRuntime,
    }),
    []
  )

  return <RuntimeContext.Provider value={contextValue}>{children}</RuntimeContext.Provider>
}

export default RuntimeContextProvider
