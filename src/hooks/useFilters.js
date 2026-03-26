import { useState, useCallback, useMemo } from 'react'

const defaultFilters = {
  city: '',
  maxPrice: '',
  sortBy: 'date-asc',
  search: '',
}

export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialFilters,
  })

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  return useMemo(() => ({
    filters,
    updateFilter,
    resetFilters,
  }), [filters, updateFilter, resetFilters])
}
