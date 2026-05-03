import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '@/api'
import { getAdminApiErrorMessage } from '../utils'

const INITIAL_FILTERS = {
  action: '',
  entityType: '',
  entityId: '',
  actorUserId: '',
}

export function useAdminAuditLog(isAdmin) {
  const [entries, setEntries] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAuditLog = useCallback(async (nextFilters = filters) => {
    if (!isAdmin) return

    setLoading(true)
    setError('')

    try {
      const data = await adminApi.listAuditLog(nextFilters)
      setEntries(Array.isArray(data) ? data : [])
    } catch (fetchError) {
      setError(getAdminApiErrorMessage(fetchError, 'Не удалось загрузить журнал аудита'))
    } finally {
      setLoading(false)
    }
  }, [filters, isAdmin])

  useEffect(() => {
    loadAuditLog()
  }, [loadAuditLog])

  const updateFilter = useCallback((field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }, [])

  const applyFilters = useCallback(() => {
    loadAuditLog(filters)
  }, [filters, loadAuditLog])

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    loadAuditLog(INITIAL_FILTERS)
  }, [loadAuditLog])

  return {
    applyFilters,
    entries,
    error,
    filters,
    loadAuditLog,
    loading,
    resetFilters,
    updateFilter,
  }
}
