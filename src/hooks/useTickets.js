import { useState, useEffect, useCallback } from 'react'
import { ticketsApi } from '@/api'
import { Logger } from '@/utils/logger'

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ticketsApi.getAll()
        setTickets(Array.isArray(data) ? data : [])
        Logger.debug('Билеты загружены', { count: data?.length })
      } catch (err) {
        Logger.error('Ошибка загрузки билетов', err)
        setError(err.message || 'Ошибка загрузки билетов')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [refreshKey])

  return { tickets, loading, error, refetch }
}
