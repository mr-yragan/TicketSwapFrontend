import { useState } from 'react'


export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    city: '',
    maxPrice: '',
    sortBy: 'date-asc',
    search: '',
    ...initialFilters,
  })

  const updateFilter = (key, value) => {
    setFilters(prev => (
      { ...prev, [key]: value }

    ))
  }

  const resetFilters = () => {
    setFilters({
      city: '',
      maxPrice: '',
      sortBy: 'date-asc',
      search: '',
    })
  }

  return { filters, updateFilter, resetFilters }
}
