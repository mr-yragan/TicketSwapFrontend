import { useState, useEffect } from 'react'
import { ticketsApi } from '@/api'

export function useTicket(id) {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ticketsApi.getById(id)
        setTicket(data)
      } catch (err) {
        setError(err.message || 'Ошибка загрузки билета')
        setTicket(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTicket()
    }
  }, [id])

  return { ticket, loading, error }
}
