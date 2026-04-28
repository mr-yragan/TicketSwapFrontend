import { createContext, useContext, useCallback, useRef } from 'react'

const TicketsRefreshContext = createContext(null)

export function TicketsRefreshProvider({ children }) {
  const callbacksRef = useRef(new Set())

  const registerRefresh = useCallback((callback) => {
    callbacksRef.current.add(callback)

    return () => {
      callbacksRef.current.delete(callback)
    }
  }, [])

  const triggerRefresh = useCallback(() => {
    callbacksRef.current.forEach(callback => callback())
  }, [])

  const value = {
    registerRefresh,
    triggerRefresh
  }

  return (
    <TicketsRefreshContext.Provider value={value}>
      {children}
    </TicketsRefreshContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTicketsRefresh() {
  const context = useContext(TicketsRefreshContext)
  if (!context) {
    throw new Error('useTicketsRefresh must be used within TicketsRefreshProvider')
  }
  return context
}
