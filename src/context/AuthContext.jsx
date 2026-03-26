import { createContext, useState, useMemo } from 'react'
import { useAuthLogic } from './useAuthLogic'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedToken = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('email')
    const savedUserId = localStorage.getItem('userId')

    if (savedToken && savedEmail) {
      return {
        email: savedEmail,
        token: savedToken,
        id: savedUserId ? parseInt(savedUserId) : null
      }
    }
    return null
  })

  const { login, register, logout } = useAuthLogic(setCurrentUser)

  // Мемоизируем value для избежания лишних рендеров
  const value = useMemo(() => ({
    user: currentUser,
    token: currentUser?.token,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser?.token,
  }), [currentUser, login, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

