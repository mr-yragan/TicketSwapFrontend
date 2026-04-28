import { getData } from '../request'

const normalizeOrganizerCode = (organizerCode) => (organizerCode || '').trim().toLowerCase()

export const partnerApi = {
  async getUpcomingEvents(organizerCode) {
    const normalized = normalizeOrganizerCode(organizerCode)
    if (!normalized) {
      return []
    }

    return await getData(`/mock/partners/${encodeURIComponent(normalized)}/events`)
  },

  async isOrganizerSupported(organizerCode) {
    const normalized = normalizeOrganizerCode(organizerCode)
    if (!normalized) {
      return false
    }

    try {
      await this.getUpcomingEvents(normalized)
      return true
    } catch (error) {
      const status = error?.response?.status
      if (status === 404 || status === 400) {
        return false
      }
      throw error
    }
  },
}
