import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { NessieRuntime } from '../runtime'
import { Storage } from '../runtime/modules/storage/storage'

interface RuntimeState {
  nessieRuntime: NessieRuntime | null
  storage: Storage<NessieRuntime> | null
}
type RuntimeContextType = [RuntimeState, Dispatch<SetStateAction<RuntimeState>>]

export const RuntimeContext = createContext<RuntimeContextType>([
  {
    nessieRuntime: null,
    storage: null,
  },
  () => {},
])

function RuntimeContextProvider({ children }: { children: ReactNode }) {
  const [initialised, setInitialised] = useState<RuntimeState>({
    nessieRuntime: null,
    storage: null,
  })

  useMemo(
    () => ({
      nessieRuntime: initialised.nessieRuntime,
      storage: initialised.storage,
    }),
    [initialised]
  )

  return (
    <RuntimeContext.Provider value={[initialised, setInitialised]}>
      {children}
    </RuntimeContext.Provider>
  )
}

export default RuntimeContextProvider
