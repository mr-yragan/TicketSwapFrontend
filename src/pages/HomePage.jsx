import { useTickets } from '@/hooks/useTickets'
import { useFilters } from '@/hooks/useFilters'
import { TicketCard } from '@/features/tickets/components/TicketCard'
import { FiltersPanel } from '@/features/tickets/components/FiltersPanel'
import { SearchBar } from '@/features/tickets/components/SearchBar'
import { useEffect } from 'react'
import { useTicketsRefresh } from '@/context/TicketsRefreshContext'

export default function HomePage() {
  const { filters, updateFilter } = useFilters()
  const { tickets, loading, error, refetch } = useTickets()
  const { registerRefresh } = useTicketsRefresh()

  useEffect(() => {
    return registerRefresh(refetch)
  }, [registerRefresh, refetch])

  if (error) {
    return (
      <div className="max-w-350 mx-auto p-8">
        <div className="text-center text-red-600">
          Ошибка загрузки: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-350 mx-auto p-8">
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
          availableCities={[]}
        />

        <main className="flex-1">
          <p className="text-base font-medium text-gray-700 mb-5">
            Найдено билетов: {loading ? '...' : (tickets?.length || 0)}
          </p>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Загрузка билетов...
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="grid grid-cols-3 gap-5">
              {tickets.map((ticket) => (
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
