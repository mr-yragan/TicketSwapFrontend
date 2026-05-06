import { createContext, useEffect, useMemo, useState } from 'react'
import { profileApi } from '@/api'
import { useAuthLogic } from './useAuthLogic'
import { clearAuthData, getStoredAuthData, saveAuthData } from './storage'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

/*
  Глобальный auth-state приложения.
  При старте пытается восстановить сессию из localStorage, затем подтягивает свежий профиль
  и синхронизирует email / id / role, чтобы остальные экраны не гадали, кто сейчас в системе.
*/
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredAuthData())

  useEffect(() => {
    let isCancelled = false

    const bootstrapAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        return
      }

      try {
        // Профиль — главный источник роли и user id. localStorage здесь только стартовая опора.
        const profile = await profileApi.getProfile()
        if (isCancelled) return

        const storedAuth = getStoredAuthData()
        const resolvedEmail = profile?.email || storedAuth?.email || ''
        const resolvedUserId = profile?.id ?? null
        const resolvedRole = profile?.role || storedAuth?.role || ''

        saveAuthData({
          token: savedToken,
          email: resolvedEmail,
          userId: resolvedUserId,
          role: resolvedRole,
        })

        setCurrentUser({
          email: resolvedEmail,
          token: savedToken,
          id: resolvedUserId,
          role: resolvedRole,
          emailVerified: profile?.emailVerified,
        })
      } catch (error) {
        if (isCancelled) return

        const status = error?.response?.status
        if (status === 401 || status === 403) {
          clearAuthData()
          setCurrentUser(null)
        }
      }
    }

    bootstrapAuth()

    return () => {
      isCancelled = true
    }
  }, [])

  const { login, verifyTwoFactor, resendTwoFactor, register, logout, authenticateWithToken } = useAuthLogic(setCurrentUser)

  const value = useMemo(() => ({
    user: currentUser,
    token: currentUser?.token,
    login,
    verifyTwoFactor,
    resendTwoFactor,
    authenticateWithToken,
    register,
    logout,
    isAuthenticated: !!currentUser?.token,
  }), [currentUser, login, verifyTwoFactor, resendTwoFactor, authenticateWithToken, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
