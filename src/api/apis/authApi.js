import { createApiResultHandler } from '../errorHandler'
import { postData } from '../request'

const registerRequest = (email, login, password) =>
  postData('/auth/register', { email, login, password })

const loginRequest = (identifier, password) =>
  postData('/auth/login', { identifier, password })

const verifyEmailRequest = (token) =>
  postData('/auth/email/verify', { token })

const resendVerificationRequest = (email) =>
  postData('/auth/email/resend-verification', { email })

const verifyTwoFactorRequest = (challengeId, code) =>
  postData('/auth/2fa/verify', { challengeId, code })

const resendTwoFactorRequest = (challengeId) =>
  postData('/auth/2fa/resend', { challengeId })

const forgotPasswordRequest = (email) =>
  postData('/auth/password/forgot', { email })

const resetPasswordRequest = (token, newPassword) =>
  postData('/auth/password/reset', { token, newPassword })

/**
 * Auth API модуль
 *
 * Методы возвращают единый контракт { success, data, error }.
 * Ошибки форматируются общим error handler, а HTTP-логирование остается в apiClient.
 */
export const authApi = {
  /**
   * Регистрация новогопользователя
   * @param {string} email
   * @param {string} login
   * @param {string} password
   * @returns {Promise<Object>} { success, data, error }
   */
  register: createApiResultHandler(registerRequest, 'Не удалось зарегистрироваться'),

  /**
   * Вход в аккаунт
   * @param {string} identifier - Почта или логин
   * @param {string} password
   * @returns {Promise<Object>} { success, data, error }
   */
  login: createApiResultHandler(loginRequest, 'Не удалось войти в аккаунт'),

  /**
   * Подтверждение email
   * @param {string} token
   * @returns {Promise<Object>} { success, data, error }
   */
  verifyEmail: createApiResultHandler(verifyEmailRequest, 'Не удалось подтвердить email'),

  /**
   * Повторная отправка письма подтверждения
   * @param {string} email
   * @returns {Promise<Object>} { success, data, error }
   */
  resendVerification: createApiResultHandler(
    resendVerificationRequest,
    'Не удалось отправить письмо подтверждения'
  ),

  /**
   * Подтверждение 2FA кода
   * @param {string} challengeId
   * @param {string} code
   * @returns {Promise<Object>} { success, data, error }
   */
  verifyTwoFactor: createApiResultHandler(
    verifyTwoFactorRequest,
    'Не удалось подтвердить код двухфакторной аутентификации'
  ),

  /**
   * Повторная отправка 2FA кода
   * @param {string} challengeId
   * @returns {Promise<Object>} { success, data, error }
   */
  resendTwoFactor: createApiResultHandler(
    resendTwoFactorRequest,
    'Не удалось отправить код подтверждения повторно'
  ),

  /**
   * Запрос на сброс пароля
   * @param {string} email
   * @returns {Promise<Object>} { success, data, error }
   */
  forgotPassword: createApiResultHandler(
    forgotPasswordRequest,
    'Не удалось отправить письмо для сброса пароля'
  ),

  /**
   * Сброс пароля по токену
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<Object>} { success, data, error }
   */
  resetPassword: createApiResultHandler(
    resetPasswordRequest,
    'Не удалось сбросить пароль'
  ),
}
