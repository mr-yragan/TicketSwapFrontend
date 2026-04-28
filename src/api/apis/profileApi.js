import { getData, patchData } from '../request'

export const profileApi = {
  /**
   * Получить профиль текущего пользователя
   * @returns {Promise<Object>} { id, email, login, emailVerified, role }
   */
  async getProfile() {
    return await getData('/me')
  },

  /**
   * Обновить профиль
   * @param {Object} payload
   * @param {string} [payload.login]
   * @returns {Promise<Object>} обновленные данные профиля
   */
  async updateProfile(payload) {
    const body = {}
    if (payload?.login) body.login = payload.login

    return await patchData('/me', body)
  },
}
