export const getAdminApiErrorMessage = (error, fallback = 'Не удалось выполнить действие') => {
  const status = error?.response?.status
  const data = error?.response?.data
  const path = data?.path
  const apiMessage = data?.message || data?.error || (typeof data === 'string' ? data : '')

  if (path === '/api/admin/purchase-orders' && status >= 500 && status < 600) {
    return 'Журнал заказов недоступен: backend работает на старой версии или endpoint сейчас сломан.'
  }
  if (apiMessage) return apiMessage
  if (status === 401) return 'Сессия истекла. Выйдите и войдите заново.'
  if (status === 403) return 'Нет доступа. Нужна роль ADMIN в текущем токене.'
  if (status === 404) return 'Пользователь или endpoint не найден.'
  if (status === 409) return 'Конфликт данных: такое название, почта или API-ключ уже используются.'

  return status ? `${fallback} (${status})` : fallback
}

export const formatOrganizerMode = (mode) => {
  if (mode === 'MANUAL') return 'Ручная'
  if (mode === 'EXTERNAL_API') return 'External API'
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
  apiKey: form.apiKey.trim(),
  verificationMode: form.verificationMode,
})

export const validateOrganizerPayload = (payload) => {
  if (payload.verificationMode === 'EXTERNAL_API' && !payload.apiKey) {
    return 'Для External API организатора нужен API-ключ.'
  }

  return ''
}
