import { getData, postData } from '../request'

export const twoFactorApi = {
  /**
   * Получить статус 2FA
   * @returns {Promise<Object>} { enabled?, unsupported?, unavailable? }
   */
  async getTwoFactorStatus() {
    try {
      return await getData('/me/2fa')
    } catch (error) {
      const status = error?.response?.status
      if (status === 404) {
        return { unsupported: true }
      }
      if (status >= 500 && status < 600) {
        return { unavailable: true }
      }
      throw error
    }
  },
  async enableTwoFactor(password) {
    try {
      return await postData('/me/2fa/enable', { password })
    } catch (error) {
      if (error?.response?.status === 404) {
        return { unsupported: true }
      }
      throw error
    }
  },

  async disableTwoFactor(password) {
    try {
      return await postData('/me/2fa/disable', { password })
    } catch (error) {
      if (error?.response?.status === 404) {
        return { unsupported: true }
      }
      throw error
    }
  },
}
