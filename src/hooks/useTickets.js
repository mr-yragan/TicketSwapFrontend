import { useState, useEffect, useCallback } from 'react'
import { ticketsApi } from '@/api'

const DEFAULT_PAGE_SIZE = 24

const defaultPage = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
}

const sortMap = {
  'date-asc': 'eventDateAsc',
  'date-desc': 'eventDateDesc',
  'price-asc': 'priceAsc',
  'price-desc': 'priceDesc',
}

const buildTicketParams = (filters = {}, page = 0, size = DEFAULT_PAGE_SIZE) => {
  const params = {
    paged: true,
    page,
    size,
    sort: sortMap[filters.sortBy] || 'eventDateAsc',
  }

  const search = String(filters.search || '').trim()
  const city = String(filters.city || '').trim()
  const dateFrom = String(filters.dateFrom || '').trim()
  const dateTo = String(filters.dateTo || '').trim()
  const eventId = String(filters.eventId || '').trim()
  const maxPrice = String(filters.maxPrice || '').trim()
  const minPrice = String(filters.minPrice || '').trim()
  const organizerId = String(filters.organizerId || '').trim()
  const venue = String(filters.venue || '').trim()

  if (search) params.query = search
  if (city) params.city = city
  if (dateFrom) params.dateFrom = dateFrom
  if (dateTo) params.dateTo = dateTo
  if (eventId) params.eventId = eventId
  if (maxPrice) params.priceMax = maxPrice
  if (minPrice) params.priceMin = minPrice
  if (organizerId) params.organizerId = organizerId
  if (venue) params.venue = venue

  return params
}

export function useTickets({ filters, page = 0, size = DEFAULT_PAGE_SIZE } = {}) {
  const [tickets, setTickets] = useState([])
  const [pageInfo, setPageInfo] = useState(defaultPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchTickets = async () => {
      try {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }
        const data = await ticketsApi.getAll(buildTicketParams(filters, page, size))
        if (!cancelled) {
          if (Array.isArray(data)) {
            setTickets(data)
            setPageInfo({
              ...defaultPage,
              numberOfElements: data.length,
              totalElements: data.length,
              empty: data.length === 0,
            })
          } else {
            const content = Array.isArray(data?.content) ? data.content : []
            setTickets(content)
            setPageInfo({
              page: data?.page ?? page,
              size: data?.size ?? size,
              totalElements: data?.totalElements ?? content.length,
              totalPages: data?.totalPages ?? 1,
              numberOfElements: data?.numberOfElements ?? content.length,
              first: Boolean(data?.first),
              last: Boolean(data?.last),
              empty: Boolean(data?.empty ?? content.length === 0),
            })
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Ошибка загрузки билетов')
          setTickets([])
          setPageInfo(defaultPage)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTickets()

    return () => {
      cancelled = true
    }
  }, [filters, page, refreshKey, size])

  return { tickets, pageInfo, loading, error, refetch }
}
