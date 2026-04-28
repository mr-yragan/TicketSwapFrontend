/**
 * Утилиты для форматирования данных билетов
 */

export const formatPrice = (price) => {
  if (!price) return '—'
  return `${price} ₽`
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const getTicketField = (ticket, primaryKey, fallbackKey) => {
  return ticket?.[primaryKey] || ticket?.[fallbackKey] || ''
}

export const getTicketStatusLabel = (status) => {
  switch (status) {
    case 'CREATED':
      return 'Создан'
    case 'PENDING_VALIDATION':
      return 'Проверяется партнёром'
    case 'PENDING_RECIPIENT':
      return 'Доступен к покупке'
    case 'PROCESSING':
      return 'Покупка в процессе'
    case 'COMPLETED':
      return 'Продан'
    case 'FAILED':
      return 'Отклонен'
    default:
      return status || 'Неизвестно'
  }
}

