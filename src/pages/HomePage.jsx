import { useTickets } from '@/hooks/useTickets'
import { useFilters } from '@/hooks/useFilters'
import { TicketCard } from '@/features/tickets/components/TicketCard'
import { FiltersPanel } from '@/features/tickets/components/FiltersPanel'
import { SearchBar } from '@/features/tickets/components/SearchBar'
import { TicketsPagination } from '@/features/tickets/components/TicketsPagination'
import { useEffect, useMemo, useState } from 'react'
import { useTicketsRefresh } from '@/context'
import { useAvailableTicketCities } from '@/hooks/useAvailableTicketCities'
import { useOrganizerCatalog } from '@/features/organizer/hooks/useOrganizerCatalog'

const PAGE_SIZE = 24

export default function HomePage() {
  const { filters, resetFilters, updateFilter } = useFilters()
  const [page, setPage] = useState(0)
  const { tickets, pageInfo, loading, error, refetch } = useTickets({ filters, page, size: PAGE_SIZE })
  const { organizers } = useOrganizerCatalog()
  const { registerRefresh } = useTicketsRefresh()
  const availableCities = useAvailableTicketCities(tickets)
  const visibleTickets = tickets
  const totalPages = pageInfo?.totalPages || 0
  const totalElements = pageInfo?.totalElements ?? visibleTickets.length
  const currentPage = pageInfo?.page ?? page

  const pageButtons = useMemo(() => {
    if (totalPages <= 1) return []

    const pages = new Set([0, totalPages - 1, currentPage])
    for (let offset = -2; offset <= 2; offset += 1) {
      const nextPage = currentPage + offset
      if (nextPage >= 0 && nextPage < totalPages) {
        pages.add(nextPage)
      }
    }

    return Array.from(pages).sort((left, right) => left - right)
  }, [currentPage, totalPages])

  useEffect(() => {
    const unregister = registerRefresh(refetch)
    return unregister
  }, [refetch, registerRefresh])

  const handleFilterChange = (key, value) => {
    setPage(0)
    updateFilter(key, value)
  }

  const handleResetFilters = () => {
    setPage(0)
    resetFilters()
  }

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
          onChange={(value) => handleFilterChange('search', value)}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FiltersPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          organizers={organizers}
          availableCities={availableCities}
        />

        <main className="flex-1">
          <p className="text-base font-medium text-gray-700 mb-5">
            Найдено билетов: {loading ? '...' : totalElements}
          </p>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Загрузка билетов...
            </div>
          ) : visibleTickets.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Билеты не найдены
            </div>
          )}

          {!loading && (
            <TicketsPagination
              currentPage={currentPage}
              onPageChange={setPage}
              pageButtons={pageButtons}
              totalPages={totalPages}
            />
          )}
        </main>
      </div>
    </div>
  )
}
