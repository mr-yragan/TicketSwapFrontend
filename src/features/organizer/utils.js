import { DEFAULT_TIMEZONE } from './constants'

export const getOrganizerApiErrorMessage = (error, fallback = 'Не удалось выполнить действие') => {
  const status = error?.response?.status
  const data = error?.response?.data
  const apiMessage = data?.message || data?.error || (typeof data === 'string' ? data : '')

  if (apiMessage) return apiMessage
  if (status === 401) return 'Сессия истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для этого действия.'
  if (status === 409) return 'Конфликт данных. Возможно, событие уже используется или ID занят.'

  return status ? `${fallback} (${status})` : fallback
}

export const toDateTimeInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export const toIsoInstant = (value) => {
  if (!value) return ''
  return new Date(value).toISOString()
}

export const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatMoney = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(number)
}

export const formatVerificationMode = (mode) => {
  if (mode === 'MANUAL') return 'Ручная проверка'
  if (mode === 'EXTERNAL_API') return 'Внешний API'
  return mode || '-'
}

export const buildEventPayload = (form) => ({
  eventId: form.eventId.trim(),
  name: form.name.trim(),
  startsAt: toIsoInstant(form.startsAt),
  venue: {
    name: form.venueName.trim(),
    address: form.venueAddress.trim(),
    timezone: form.timezone.trim() || DEFAULT_TIMEZONE,
  },
})

export const mapEventToForm = (eventItem) => ({
  eventId: eventItem.eventId || '',
  name: eventItem.name || '',
  startsAt: toDateTimeInput(eventItem.startsAt),
  venueName: eventItem.venue?.name || '',
  venueAddress: eventItem.venue?.address || '',
  timezone: eventItem.venue?.timezone || DEFAULT_TIMEZONE,
})

export const buildOrganizerMetrics = ({ dashboard, events, pendingValidation, pendingReissue }) => ([
  { label: 'События', value: events.length },
  { label: 'На проверке', value: dashboard?.pendingValidationCount ?? pendingValidation.length },
  { label: 'Перевыпуск', value: dashboard?.pendingReissueCount ?? pendingReissue.length },
])
