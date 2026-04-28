import { deleteData, getData, postData, putData } from '../request'

export const organizerApi = {
  async listPublicOrganizers() {
    return await getData('/organizers')
  },

  async searchEvents({ query = '', organizerId, limit = 10 } = {}) {
    const params = {
      query,
      limit,
    }

    if (organizerId) {
      params.organizerId = organizerId
    }

    return await getData('/events/search', { params })
  },

  async getOrganizerMe() {
    return await getData('/organizer/me')
  },

  async getOrganizerDashboard() {
    return await getData('/organizer/dashboard')
  },

  async listEvents() {
    return await getData('/organizer/events')
  },

  async createEvent(payload) {
    return await postData('/organizer/events', payload)
  },

  async updateEvent(id, payload) {
    return await putData(`/organizer/events/${id}`, payload)
  },

  async deleteEvent(id) {
    return await deleteData(`/organizer/events/${id}`)
  },

  async listPendingValidation() {
    return await getData('/organizer/listings/pending-validation')
  },

  async listPendingReissue() {
    return await getData('/organizer/listings/pending-reissue')
  },

  async verifyListing(id, { approved, reason }) {
    return await postData(`/organizer/listings/${id}/verify`, { approved, reason })
  },

  async completeReissue(id, { newTicketUid, ticketFile }) {
    const formData = new FormData()
    formData.append('newTicketUid', newTicketUid)
    formData.append('ticketFile', ticketFile)

    return await postData(`/organizer/listings/${id}/reissue`, formData)
  },

  async rejectReissue(id, { reason }) {
    return await postData(`/organizer/listings/${id}/reissue/reject`, { reason })
  },
}
