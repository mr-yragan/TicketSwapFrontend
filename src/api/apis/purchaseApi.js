import { deleteData } from '../request'

export const purchaseApi = {
  async releaseHold(listingId) {
    await deleteData(`/tickets/${listingId}/hold`)
  },
}
