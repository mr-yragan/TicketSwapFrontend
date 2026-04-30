import { deleteData, getData, postData, putData } from '../request'

const normalizeOrganizerProfile = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  if (payload.organizer && payload.user) {
    return {
      id: payload.organizer.id,
      name: payload.organizer.name,
      organizerCode: payload.organizer.apiKey || '',
      contactEmail: payload.organizer.contactEmail,
      verificationMode: payload.organizer.verificationMode,
      banned: Boolean(payload.organizer.banned),
      legacyUser: payload.user,
    }
  }

  return payload
}

const normalizeOrganizerDashboard = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  if ('organizerName' in payload || 'organizerCode' in payload) {
    return payload
  }

  return {
    organizerId: payload.organizerId,
    organizerName: payload.name,
    organizerCode: payload.apiKey || '',
    pendingValidationCount: payload.pendingValidationCount ?? 0,
    pendingReissueCount: payload.pendingReissueCount ?? 0,
    eventsCount: payload.eventsCount ?? 0,
  }
}

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
    const data = await getData('/organizer/me')
    return normalizeOrganizerProfile(data)
  },

  async getOrganizerDashboard() {
    const data = await getData('/organizer/dashboard')
    return normalizeOrganizerDashboard(data)
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
