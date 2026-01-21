import { useState, useEffect } from 'react'
import { mockTickets } from '@/data/mockTickets'

export function useTickets(filters = {}) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = mockTickets
        
        setTickets(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [JSON.stringify(filters)])

  return { tickets, loading, error }
}
