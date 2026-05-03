import { useEffect, useState } from 'react'
import { ticketsApi } from '@/api'

export function useTicketStatusHistory(ticketId, enabled = false) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      if (!ticketId || !enabled) {
        setHistory([])
        setError('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await ticketsApi.getStatusHistory(ticketId)
        if (!cancelled) {
          setHistory(Array.isArray(response) ? response : [])
        }
      } catch (fetchError) {
        if (!cancelled) {
          setHistory([])
          setError(fetchError?.response?.data?.message || 'Не удалось загрузить историю статусов')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [enabled, ticketId])

  return {
    error,
    history,
    loading,
  }
}
