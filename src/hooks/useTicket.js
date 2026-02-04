import { useState, useEffect } from 'react'
import { ticketsApi } from '@/api/apiClient'

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
        if (!data) {
          setError('Билет не найден')
          setTicket(null)
          return
        }

        setTicket(data)
      } catch (err) {
        setError(err.message)
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
