import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '@/api'
import { getAdminApiErrorMessage } from '../utils'

export function useAdminAuditLog(isAdmin) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAuditLog = useCallback(async () => {
    if (!isAdmin) return

    setLoading(true)
    setError('')

    try {
      const data = await adminApi.listAuditLog()
      setEntries(Array.isArray(data) ? data : [])
    } catch (fetchError) {
      setError(getAdminApiErrorMessage(fetchError, 'Не удалось загрузить журнал аудита'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadAuditLog()
  }, [loadAuditLog])

  return {
    entries,
    error,
    loadAuditLog,
    loading,
  }
}
