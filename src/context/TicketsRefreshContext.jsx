import { createContext, useContext, useCallback, useState } from 'react'

const TicketsRefreshContext = createContext(null)

export function TicketsRefreshProvider({ children }) {
  const [refreshCallbacks, setRefreshCallbacks] = useState([])

  const registerRefresh = useCallback((callback) => {
    setRefreshCallbacks(prev => [...prev, callback])
    return () => {
      setRefreshCallbacks(prev => prev.filter(cb => cb !== callback))
    }
  }, [])

  const triggerRefresh = useCallback(() => {
    refreshCallbacks.forEach(callback => callback())
  }, [refreshCallbacks])

  return (
    <TicketsRefreshContext.Provider value={{ registerRefresh, triggerRefresh }}>
      {children}
    </TicketsRefreshContext.Provider>
  )
}

export function useTicketsRefresh() {
  const context = useContext(TicketsRefreshContext)
  if (!context) {
    throw new Error('useTicketsRefresh must be used within TicketsRefreshProvider')
  }
  return context
}
