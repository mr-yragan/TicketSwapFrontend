import { useCallback } from 'react'
import { authApi, profileApi } from '@/api'
import { clearAuthData, saveAuthData } from './storage'

/*
  Сценарии логина/регистрации вынесены в hook, чтобы AuthProvider хранил состояние,
  а детали 2FA и пост-логина не лежали прямо в JSX.
*/
const resolveTwoFactorPayload = (data = {}) => {
  const requiresTwoFactor = Boolean(
    data.requiresTwoFactor ?? data.twoFactorRequired ?? data.twoFactorChallengeId ?? data.challengeId
  )

  return {
    requiresTwoFactor,
    challengeId: (data.twoFactorChallengeId || data.challengeId || '').trim(),
    expiresAt: data.twoFactorExpiresAt || data.expiresAt || null,
    message: data.message || '',
    token: data.token || null,
  }
}

export function useAuthLogic(setCurrentUser) {
  const finishLogin = useCallback(async (token, fallbackEmail = '') => {
    if (!token) {
      return { success: false, error: 'Токен не получен' }
    }

    const safeFallbackEmail = typeof fallbackEmail === 'string' ? fallbackEmail.trim() : ''
    saveAuthData({ email: safeFallbackEmail, token })

    try {
      // После любого способа входа перечитываем профиль, чтобы получить роль, id и emailVerified.
      const profile = await profileApi.getProfile()
      const resolvedEmail = profile?.email || safeFallbackEmail
      const userWithId = {
        email: resolvedEmail,
        token,
        id: profile?.id ?? null,
        role: profile?.role || '',
        emailVerified: profile?.emailVerified,
      }

      saveAuthData({
        email: resolvedEmail,
        token,
        userId: profile?.id ?? null,
        role: profile?.role || '',
      })
      setCurrentUser(userWithId)

      return {
        success: true,
      }
    } catch (profileErr) {
      console.error('Не удалось загрузить профиль:', profileErr)
      if (safeFallbackEmail) {
        saveAuthData({ email: safeFallbackEmail, token })
      }
      setCurrentUser({ email: safeFallbackEmail, token, id: null, role: '', emailVerified: null })
      return { success: true }
    }
  }, [setCurrentUser])

  const login = useCallback(async (identifier, password) => {
    if (!identifier || !password) {
      return { success: false, error: 'Заполните все поля' }
    }

    const result = await authApi.login(identifier, password)
    if (!result.success) {
      return result
    }

    const { token, requiresTwoFactor, challengeId, expiresAt, message } = resolveTwoFactorPayload(result.data)

    if (requiresTwoFactor) {
      if (!challengeId) {
        return {
          success: false,
          error: 'Сервер вернул некорректный ответ 2FA: отсутствует challengeId',
        }
      }

      return {
        success: false,
        requiresTwoFactor: true,
        challengeId,
        expiresAt,
        message,
        identifier,
      }
    }

    return await finishLogin(token, identifier)
  }, [finishLogin])

  const verifyTwoFactor = useCallback(async (challengeId, code, identifier = '') => {
    const normalizedChallengeId = typeof challengeId === 'string' ? challengeId.trim() : ''
    const normalizedCode = typeof code === 'string' ? code.trim() : ''

    if (!normalizedChallengeId || !normalizedCode) {
      return { success: false, error: 'Введите код подтверждения' }
    }

    const result = await authApi.verifyTwoFactor(normalizedChallengeId, normalizedCode)
    if (!result.success) {
      return result
    }

    const token = result.data?.token
    return await finishLogin(token, identifier)
  }, [finishLogin])

  const resendTwoFactor = useCallback(async (challengeId) => {
    const normalizedChallengeId = typeof challengeId === 'string' ? challengeId.trim() : ''

    if (!normalizedChallengeId) {
      return { success: false, error: 'Сессия подтверждения истекла. Войдите снова.' }
    }

    return await authApi.resendTwoFactor(normalizedChallengeId)
  }, [])

  const register = useCallback(async (email, login, password) => {
    const result = await authApi.register(email, login, password)
    if (!result.success) {
      return result
    }

    return {
      success: true,
      data: result.data,
    }
  }, [])

  const logout = useCallback(() => {
    clearAuthData()
    setCurrentUser(null)
  }, [setCurrentUser])

  const authenticateWithToken = useCallback(async (token, fallbackEmail = '') => {
    return await finishLogin(token, fallbackEmail)
  }, [finishLogin])

  return { login, verifyTwoFactor, resendTwoFactor, register, logout, authenticateWithToken }
}
