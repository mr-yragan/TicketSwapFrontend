import { createContext, useState } from 'react'
import { authApi, profileApi } from '@/api/apiClient'

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

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'))

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Заполните все поля' }
    }

    const result = await authApi.login(email, password)

    if (!result.success) {
      return result
    }

    const { token } = result.data

    if (!token) {
      return { success: false, error: 'Токен не получен' }
    }

    localStorage.setItem('token', token)
    localStorage.setItem('email', email)

    setAuthToken(token)

    try {
      const profile = await profileApi.getProfile()
      const userWithId = {
        email,
        token,
        id: profile.id
      }
      localStorage.setItem('userId', profile.id)
      setCurrentUser(userWithId)
    } catch (profileErr) {
      console.error('Не удалось загрузить профиль, используем базовые данные:', profileErr)
      setCurrentUser({ email, token })
    }

    return { success: true }
  }

  const register = async (email, password) => {
    const result = await authApi.register(email, password)

    if (!result.success) {
      return result
    }

    return await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('userId')
    setAuthToken(null)
    setCurrentUser(null)
  }

  const checkAuth = () => {
    return !!authToken && !!currentUser
  }

  return (
    <AuthContext.Provider 
      value={{
        user: currentUser,
        token: authToken,
        login,
        register,
        logout,
        isAuthenticated: checkAuth(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

