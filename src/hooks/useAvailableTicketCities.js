import { useMemo } from 'react'

const extractCity = (ticket) => {
  if (ticket?.city) {
    return String(ticket.city).trim()
  }

  const venue = String(ticket?.venue || '').trim()
  if (!venue.includes(',')) {
    return ''
  }

  const parts = venue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export function useAvailableTicketCities(tickets) {
  return useMemo(() => {
    const citySet = new Set()

    for (const ticket of Array.isArray(tickets) ? tickets : []) {
      const city = extractCity(ticket)
      if (city) {
        citySet.add(city)
      }
    }

    return Array.from(citySet).sort((left, right) => left.localeCompare(right, 'ru'))
  }, [tickets])
}
