import apiClient from '../apiClient'
import { formatErrorMessage } from '../formatters'

export const authApi = {
  async register(email, password) {
    try {
      await apiClient.post('/auth/register', { email, password })
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: formatErrorMessage(error, 'Ошибка регистрации'),
      }
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: formatErrorMessage(error, 'Ошибка входа'),
      }
    }
  },
}
