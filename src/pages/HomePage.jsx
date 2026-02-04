import { useTickets } from '@/hooks/useTickets'
import { useFilters } from '@/hooks/useFilters'
import { TicketCard } from '@/features/tickets/components/TicketCard'
import { FiltersPanel } from '@/features/tickets/components/FiltersPanel'
import { SearchBar } from '@/features/tickets/components/SearchBar'
import { useMemo, useEffect } from 'react'
import { useTicketsRefresh } from '@/context/TicketsRefreshContext'

export default function HomePage() {
  const { filters, updateFilter } = useFilters()
  const { tickets: allTickets, loading, error, refetch } = useTickets()
  const { registerRefresh } = useTicketsRefresh()

  useEffect(() => {
    return registerRefresh(refetch)
  }, [registerRefresh, refetch])

  const { filteredTickets, cities } = useMemo(() => {
    if (!allTickets || allTickets.length === 0) {
      return { filteredTickets: [], cities: [] }
    }

    const citySet = new Set()
    allTickets.forEach(ticket => {
      const venue = ticket.venue || ''
      const city = venue.split(',')[0].trim().toLowerCase()
      if (city) {
        citySet.add(city)
      }
    })
    const uniqueCities = Array.from(citySet).sort()

    let filtered = [...allTickets]

    if (filters.city) {
      filtered = filtered.filter(ticket => {
        const venue = (ticket.venue || '').toLowerCase()
        return venue.includes(filters.city.toLowerCase())
      })
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice)
      filtered = filtered.filter(ticket => {
        const price = parseFloat(ticket.price || 0)
        return price <= maxPrice
      })
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(ticket => {
        const eventName = (ticket.eventName || '').toLowerCase()
        const venue = (ticket.venue || '').toLowerCase()
        return eventName.includes(searchLower) || venue.includes(searchLower)
      })
    }

    if (filters.sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    } else if (filters.sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (filters.sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    return { filteredTickets: filtered, cities: uniqueCities }
  }, [allTickets, filters])

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="text-center text-red-600">
          Ошибка загрузки: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-3">Доска объявлений билетов</h2>
        <SearchBar 
          value={filters.search}
          onChange={(value) => updateFilter('search', value)}
        />
      </div>

      <div className="flex gap-6">
        <FiltersPanel 
          filters={filters}
          onFilterChange={updateFilter}
          availableCities={cities}
        />

        <main className="flex-1">
          <p className="text-base font-medium text-gray-700 mb-5">
            Найдено билетов: {loading ? '...' : (filteredTickets?.length || 0)}
          </p>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Загрузка билетов...
            </div>
          ) : filteredTickets && filteredTickets.length > 0 ? (
            <div className="grid grid-cols-3 gap-5">
              {filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Билеты не найдены
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
