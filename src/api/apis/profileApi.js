import apiClient from '../apiClient'

export const profileApi = {
  async getProfile() {
    const response = await apiClient.get('/me')
    return response.data
  },

  async getMyListings() {
    const response = await apiClient.get('/me/listings')
    return response.data
  },

  async getMyPurchases(scope = 'active') {
    const response = await apiClient.get('/me/purchases', { params: { scope } })
    return response.data
  },

  async getMyHolds() {
    const response = await apiClient.get('/me/holds')
    return response.data
  },
}
