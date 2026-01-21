import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { api } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)
  const hasInitialized = useRef(false)

  // Проверяем токен при монтировании
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const savedToken = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('email')
    
    if (savedToken && savedEmail) {
      // TODO: добавить валидацию токена на бэкенде
      setAuthToken(savedToken)
      setCurrentUser({ email: savedEmail, token: savedToken })
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Заполните все поля' }
    }

    try {
      const data = await api.login(email, password)
      
      if (! data.token) {
        throw new Error('Токен не получен')
      }

      localStorage.setItem('token', data. token)
      localStorage.setItem('email', email)
      
      setAuthToken(data.token)
      setCurrentUser({ email, token: data.token })
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка входа:', err)
      
      if (err.response?.status === 401) {
        return { success: false, error: 'Неверный email или пароль' }
      } else if (err.response?. status === 429) {
        return { success:  false, error: 'Слишком много попыток.  Попробуйте позже' }
      }
      
      return { 
        success: false, 
        error: err.message || 'Не удалось войти.  Проверьте соединение' 
      }
    }
  }

  const register = async (email, password) => {
    try {
      const result = await api.register(email, password)
      
      if (result.success === false) {
        return result
      }

      // Автовход после регистрации
      return await login(email, password)
    } catch (err) {
      console.error('Ошибка регистрации:', err)
      
      if (err.response?.status === 409) {
        return { success:  false, error: 'Пользователь уже существует' }
      }
      
      return { success:  false, error: err.message || 'Ошибка регистрации' }
    }
  }

  const logout = () => {
    // Чистим все
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setAuthToken(null)
    setCurrentUser(null)
    
    // FIXME: нужно вызывать API для инвалидации токена на сервере
  }

  // Дополнительная проверка для роутов
  const checkAuth = () => {
    return !!authToken && !!currentUser
  }

  return (
    <AuthContext.Provider 
      value={{
        user: currentUser,
        token:  authToken,
        loading: isLoading,
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

export function useAuth() {
  const ctx = useContext(AuthContext)
  
  if (!ctx) {
    throw new Error('useAuth можно использовать только внутри AuthProvider')
  }
  
  return ctx
}