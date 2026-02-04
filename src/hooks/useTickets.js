import { useState, useEffect, useCallback } from 'react'
import { ticketsApi } from '@/api/apiClient'

export function useTickets(_filters = {}) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const filtersKey = JSON.stringify(_filters)

  const refetch = useCallback(() => {
    console.log('🔄 Обновляем список билетов...')
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await ticketsApi.getAll()
        setTickets(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Ошибка загрузки билетов:', err)
        setError(err.message || 'Ошибка загрузки билетов')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [filtersKey, refreshKey])

  return { tickets, loading, error, refetch }
}
