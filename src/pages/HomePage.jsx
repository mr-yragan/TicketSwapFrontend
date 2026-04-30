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
import { SlidersHorizontal, X } from 'lucide-react'

const PAGE_SIZE = 24

export default function HomePage() {
  const { filters, resetFilters, updateFilter } = useFilters()
  const [page, setPage] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  useEffect(() => {
    if (!filtersOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [filtersOpen])

  const handleFilterChange = (key, value) => {
    setPage(0)
    updateFilter(key, value)
  }

  const handleResetFilters = () => {
    setPage(0)
    resetFilters()
  }

  const activeFiltersCount = useMemo(() => {
    const values = [
      filters.organizerId,
      filters.city,
      filters.venue,
      filters.eventId,
      filters.minPrice,
      filters.maxPrice,
      filters.dateFrom,
      filters.dateTo,
    ]

    const sortActive = filters.sortBy && filters.sortBy !== 'date-asc'

    return values.filter((value) => String(value || '').trim() !== '').length + (sortActive ? 1 : 0)
  }, [filters])

  if (error) {
    return (
      <div className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8">
        <div className="text-center text-red-600">
          Ошибка загрузки: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h2 className="mb-3 text-base font-medium text-gray-700 sm:text-lg">Доска объявлений билетов</h2>
        <SearchBar
          value={filters.search}
          onChange={(value) => handleFilterChange('search', value)}
        />
        <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50">
            <SlidersHorizontal size={18} />
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-black">
              Сбросить всё
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="hidden lg:block">
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            organizers={organizers}
            availableCities={availableCities}
          />
        </div>

        <main className="flex-1">
          <p className="text-base font-medium text-gray-700 mb-5">
            Найдено билетов: {loading ? '...' : totalElements}
          </p>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Загрузка билетов...
            </div>
          ) : visibleTickets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
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

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Закрыть фильтры"
            className="absolute inset-0 bg-black/45"
            onClick={() => setFiltersOpen(false)}
            style={{ animation: 'fadeIn 200ms ease-out' }}
          />
          <div
            className="absolute inset-x-0 bottom-0 top-16 overflow-y-auto rounded-t-3xl bg-gray-50 p-4 shadow-2xl"
            style={{ animation: 'sheetIn 220ms ease-out' }}>
            <div className="mx-auto max-w-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Подбор билетов</div>
                  <div className="mt-1 text-sm text-gray-500">Настрой фильтры и вернись к списку</div>
                </div>
                <button
                  type="button"
                  aria-label="Закрыть фильтры"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-black"
                  onClick={() => setFiltersOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <FiltersPanel
                mode="overlay"
                filters={filters}
                onApply={() => setFiltersOpen(false)}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                organizers={organizers}
                availableCities={availableCities}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
