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
