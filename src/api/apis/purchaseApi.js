import { deleteData, postData } from '../request'

export const purchaseApi = {
  async createHold(listingId) {
    return await postData(`/tickets/${listingId}/hold`)
  },

  async releaseHold(listingId) {
    await deleteData(`/tickets/${listingId}/hold`)
  },

  async completePurchase(listingId) {
    return await postData(`/tickets/${listingId}/buy`)
  },
}
