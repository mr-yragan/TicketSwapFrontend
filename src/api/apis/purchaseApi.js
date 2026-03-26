import apiClient from '../apiClient'

export const purchaseApi = {
  async createHold(listingId) {
    try {
      const response = await apiClient.post('/holds', { listingId })
      console.log('Ответ от сервера:', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка при создании hold:', error.response?.data || error.message)
      throw error
    }
  },

  async completeHold(holdId) {
    const response = await apiClient.post(`/holds/${holdId}/complete`)
    return response.data
  },

  async releaseHold(holdId) {
    const response = await apiClient.delete(`/holds/${holdId}`)
    return response.data
  },
}
