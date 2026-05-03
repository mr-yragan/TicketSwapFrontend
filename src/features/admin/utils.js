export const getAdminApiErrorMessage = (error, fallback = 'Не удалось выполнить действие') => {
  const status = error?.response?.status
  const data = error?.response?.data
  const path = data?.path
  const apiMessage = data?.message || data?.error || (typeof data === 'string' ? data : '')

  if (path === '/api/admin/purchase-orders' && status >= 500 && status < 600) {
    return 'Журнал заказов недоступен'
  }
  if (path === '/api/admin/audit-log' && status >= 500 && status < 600) {
    return 'Журнал аудита временно недоступен.'
  }
  if (apiMessage) return apiMessage
  if (status === 401) return 'Сессия истекла. Выйдите и войдите заново.'
  if (status === 403) return 'Нет доступа. Нужна роль ADMIN в текущем токене.'
  if (status === 404) return 'Пользователь или endpoint не найден.'
  if (status === 409) return 'Конфликт данных: такое название, почта или код организатора уже используются.'

  return status ? `${fallback} (${status})` : fallback
}

export const formatOrganizerMode = (mode) => {
  if (mode === 'MANUAL') return 'Ручная'
  if (mode === 'EXTERNAL_API') return 'Автоматическая'
  return mode || '-'
}

export const sortOrganizers = (organizers) => {
  return [...organizers].sort((left, right) => {
    if (left.banned !== right.banned) return Number(left.banned) - Number(right.banned)
    return (left.name || '').localeCompare(right.name || '', 'ru')
  })
}

export const buildOrganizerPayload = (form) => ({
  name: form.name.trim(),
  contactEmail: form.contactEmail.trim(),
  organizerCode: form.organizerCode.trim(),
  integrationSecret: form.verificationMode === 'EXTERNAL_API'
    ? form.integrationSecret.trim() || undefined
    : undefined,
  verificationMode: form.verificationMode,
})

export const validateOrganizerPayload = (payload) => {
  if (!payload.name) {
    return 'Введите название организатора.'
  }

  if (!payload.contactEmail) {
    return 'Введите почту пользователя.'
  }

  if (!payload.organizerCode) {
    return 'Укажите код организатора.'
  }

  return ''
}

export const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatMaskedSecret = (last4) => last4 ? `••••${last4}` : '-'

export const formatAuditAction = (action) => {
  const labels = {
    ORGANIZER_CREATED: 'Организатор создан',
    ORGANIZER_BANNED: 'Организатор заблокирован',
    ORGANIZER_UNBANNED: 'Организатор разблокирован',
    REFUND_COMPLETED: 'Возврат подтверждён',
  }

  return labels[action] || action || '-'
}
