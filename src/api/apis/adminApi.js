import { getData, postData } from '../request'

const normalizeOrganizer = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  return {
    ...payload,
    organizerCode: payload.organizerCode || payload.apiKey || '',
    apiKeyLast4: payload.apiKeyLast4 || null,
    apiKeyCreatedAt: payload.apiKeyCreatedAt || null,
    generatedIntegrationSecret: payload.generatedIntegrationSecret || null,
  }
}

export const adminApi = {
  async listOrganizers() {
    const data = await getData('/admin/organizers')
    return Array.isArray(data) ? data.map(normalizeOrganizer) : []
  },

  async listPurchaseOrders() {
    return await getData('/admin/purchase-orders')
  },

  async completePurchaseRefund(id) {
    return await postData(`/admin/purchase-orders/${id}/refund/complete`)
  },

  async listAuditLog() {
    return await getData('/admin/audit-log')
  },

  async createOrganizer({ name, contactEmail, organizerCode, integrationSecret, verificationMode }) {
    const payload = {
      name,
      contactEmail,
      organizerCode,
      apiKey: organizerCode,
      verificationMode,
    }

    if (integrationSecret) {
      payload.integrationSecret = integrationSecret
    }

    const data = await postData('/admin/organizers', payload)
    return normalizeOrganizer(data)
  },

  async banOrganizer(id) {
    const data = await postData(`/admin/organizers/${id}/ban`)
    return normalizeOrganizer(data)
  },

  async unbanOrganizer(id) {
    const data = await postData(`/admin/organizers/${id}/unban`)
    return normalizeOrganizer(data)
  },
}
