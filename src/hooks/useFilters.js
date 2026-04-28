import { useState, useCallback, useMemo } from 'react'

const defaultFilters = {
  city: '',
  dateFrom: '',
  dateTo: '',
  eventId: '',
  maxPrice: '',
  minPrice: '',
  organizerId: '',
  sortBy: 'date-asc',
  search: '',
  venue: '',
}

export function useFilters(initialFilters = null) {
  const initialState = useMemo(() => ({
    ...defaultFilters,
    ...(initialFilters || {}),
  }), [initialFilters])
  const [filters, setFilters] = useState(initialState)

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialState)
  }, [initialState])

  return useMemo(() => ({
    filters,
    updateFilter,
    resetFilters,
  }), [filters, updateFilter, resetFilters])
}
