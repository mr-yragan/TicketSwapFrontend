import { getData, postData } from '../request'

const pickOrganizerCode = (payload) => payload.organizerCode || payload.apiKey || ''

const normalizeOrganizer = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  return {
    ...payload,
    organizerCode: pickOrganizerCode(payload),
    apiKeyLast4: payload.apiKeyLast4 || null,
    apiKeyCreatedAt: payload.apiKeyCreatedAt || null,
    generatedIntegrationSecret: payload.generatedIntegrationSecret || null,
  }
}

const normalizeOrganizers = (payload) => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeOrganizer)
}

const buildAuditLogParams = (filters = {}) => {
  const params = {}

  if (filters.action?.trim()) {
    params.action = filters.action.trim()
  }

  if (filters.entityType?.trim()) {
    params.entityType = filters.entityType.trim()
  }

  if (filters.entityId !== '' && filters.entityId !== null && filters.entityId !== undefined) {
    params.entityId = filters.entityId
  }

  if (filters.actorUserId !== '' && filters.actorUserId !== null && filters.actorUserId !== undefined) {
    params.actorUserId = filters.actorUserId
  }

  if (filters.limit) {
    params.limit = filters.limit
  }

  return params
}

const buildCreateOrganizerPayload = ({
  contactEmail,
  integrationSecret,
  name,
  organizerCode,
  verificationMode,
}) => {
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

  return payload
}

export const adminApi = {
  async listOrganizers() {
    const data = await getData('/admin/organizers')
    return normalizeOrganizers(data)
  },

  async listPurchaseOrders() {
    return await getData('/admin/purchase-orders')
  },

  async completePurchaseRefund(id) {
    return await postData(`/admin/purchase-orders/${id}/refund/complete`)
  },

  async listAuditLog(filters) {
    return await getData('/admin/audit-log', { params: buildAuditLogParams(filters) })
  },

  async createOrganizer({ name, contactEmail, organizerCode, integrationSecret, verificationMode }) {
    const payload = buildCreateOrganizerPayload({
      name,
      contactEmail,
      organizerCode,
      integrationSecret,
      verificationMode,
    })
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
