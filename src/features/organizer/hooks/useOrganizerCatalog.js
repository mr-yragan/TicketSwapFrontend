import { useCallback, useEffect, useState } from 'react'
import { organizerApi } from '@/api'

export function useOrganizerCatalog() {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadOrganizers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await organizerApi.listPublicOrganizers()
      setOrganizers(Array.isArray(data) ? data : [])
    } catch {
      setError('Не удалось загрузить список организаторов')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrganizers()
  }, [loadOrganizers])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    clearError,
    error,
    loading,
    organizers,
    refetch: loadOrganizers,
  }
}
