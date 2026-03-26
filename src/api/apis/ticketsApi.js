import apiClient from '../apiClient'

export const ticketsApi = {
  async getAll() {
    const response = await apiClient.get('/tickets')
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/tickets/${id}`)
    return response.data
  },

  async sell(ticketData) {
    const response = await apiClient.post('/tickets/sell', ticketData)
    return response.data
  },

  async buy(id) {
    const response = await apiClient.post(`/tickets/${id}/buy`)
    return response.data
  },
}
