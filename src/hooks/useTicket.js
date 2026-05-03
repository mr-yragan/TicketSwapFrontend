import { useState, useEffect } from 'react'
import { ticketsApi } from '@/api'

export function useTicket(id) {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchTicket = async () => {
      try {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }
        const view = await ticketsApi.getById(id)

        if (!cancelled) {
          setTicket(view)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Ошибка загрузки билета')
          setTicket(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchTicket()
    }

    return () => {
      cancelled = true
    }
  }, [id])

  return { ticket, loading, error }
}
