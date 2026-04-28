import { getData, postData } from '../request'

export const adminApi = {
  async listOrganizers() {
    return await getData('/admin/organizers')
  },

  async listPurchaseOrders() {
    return await getData('/admin/purchase-orders')
  },

  async createOrganizer({ name, contactEmail, apiKey, verificationMode }) {
    return await postData('/admin/organizers', {
      name,
      contactEmail,
      apiKey,
      verificationMode,
    })
  },

  async banOrganizer(id) {
    return await postData(`/admin/organizers/${id}/ban`)
  },

  async unbanOrganizer(id) {
    return await postData(`/admin/organizers/${id}/unban`)
  },
}
