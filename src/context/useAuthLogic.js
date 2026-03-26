import { useCallback } from 'react'
import { authApi, profileApi } from '@/api'

const saveAuthData = (email, token, userId) => {
  localStorage.setItem('token', token)
  localStorage.setItem('email', email)
  if (userId) localStorage.setItem('userId', userId)
}

const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
  localStorage.removeItem('userId')
}


export function useAuthLogic(setCurrentUser) {
  const login = useCallback(async (email, password) => {
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

    try {
      const profile = await profileApi.getProfile()
      const userWithId = { email, token, id: profile.id }
      saveAuthData(email, token, profile.id)
      setCurrentUser(userWithId)
    } catch (profileErr) {
      console.error('Не удалось загрузить профиль:', profileErr)
      saveAuthData(email, token, null)
      setCurrentUser({ email, token, id: null })
    }

    return { success: true }
  }, [setCurrentUser])

  const register = useCallback(async (email, password) => {
    const result = await authApi.register(email, password)
    if (!result.success) {
      return result
    }
    return await login(email, password)
  }, [login])

  const logout = useCallback(() => {
    clearAuthData()
    setCurrentUser(null)
  }, [setCurrentUser])

  return { login, register, logout }
}
