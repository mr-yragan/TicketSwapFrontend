import { Button } from '@/components/ui'

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Ближайшие' },
  { value: 'date-desc', label: 'Поздние' },
  { value: 'price-asc', label: 'Дешевле' },
  { value: 'price-desc', label: 'Дороже' },
]

export function FiltersPanel({
  filters,
  onApply,
  onFilterChange,
  onReset,
  organizers = [],
  availableCities = [],
  mode = 'sidebar',
}) {
  const handleNumberChange = (field) => (event) => {
    const value = typeof event === 'string' ? event : event.target.value
    if (!value || Number(value) >= 0) {
      onFilterChange(field, value)
    }
  }

  const isOverlay = mode === 'overlay'

  const normalizedSelectedCity = String(filters.city || '').trim()
  const cityValues = new Set(availableCities)
  if (normalizedSelectedCity) {
    cityValues.add(normalizedSelectedCity)
  }

  const cityOptions = Array.from(cityValues).sort((left, right) => left.localeCompare(right, 'ru'))

  return (
    <aside className={isOverlay ? 'w-full' : 'w-full flex-shrink-0 lg:w-72'}>
      <div className={`rounded-2xl border border-gray-300 bg-white p-4 shadow-sm sm:p-6 ${isOverlay ? '' : 'lg:sticky lg:top-4'}`}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Фильтры</h2>
          {!isOverlay && (
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-medium text-gray-500 hover:text-black">
              Сбросить
            </button>
          )}
        </div>

        <FilterSelect
          label="Организатор"
          value={filters.organizerId || ''}
          onChange={(value) => onFilterChange('organizerId', value)}>
          <option value="">Все организаторы</option>
          {organizers.map((organizer) => (
            <option key={organizer.id} value={organizer.id}>{organizer.name}</option>
          ))}
        </FilterSelect>

        <FilterInput
          label="Город"
          list="ticket-city-options"
          value={filters.city || ''}
          onChange={(value) => onFilterChange('city', value)}
          placeholder="Все города"
        />
        <datalist id="ticket-city-options">
          {cityOptions.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <FilterInput
          label="Площадка"
          value={filters.venue || ''}
          onChange={(value) => onFilterChange('venue', value)}
          placeholder="Название площадки"
        />

        <FilterInput
          label="Код события"
          value={filters.eventId || ''}
          onChange={(value) => onFilterChange('eventId', value)}
          placeholder="например, concert-2026"
          hint="Это код события у организатора, а не номер билета."
        />

        <div className="mb-6 grid grid-cols-2 gap-3">
          <FilterInput
            label="Цена от"
            type="number"
            value={filters.minPrice || ''}
            onChange={handleNumberChange('minPrice')}
            placeholder="0"
            min="0"
            step="1000"
            compact
          />
          <FilterInput
            label="Цена до"
            type="number"
            value={filters.maxPrice || ''}
            onChange={handleNumberChange('maxPrice')}
            placeholder="без лимита"
            min="0"
            step="1000"
            compact
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <FilterInput
            label="Дата от"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(value) => onFilterChange('dateFrom', value)}
            compact
          />
          <FilterInput
            label="Дата до"
            type="date"
            value={filters.dateTo || ''}
            onChange={(value) => onFilterChange('dateTo', value)}
            compact
          />
        </div>

        <FilterSelect
          label="Сортировка"
          value={filters.sortBy || 'date-asc'}
          onChange={(value) => onFilterChange('sortBy', value)}
          withoutMargin>
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </FilterSelect>

        {isOverlay && onApply && (
          <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-gray-200 bg-white/95 px-4 pb-2 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={onReset}
                className="w-full rounded-xl border border-gray-300 bg-white text-black hover:bg-gray-50">
              Сбросить
              </Button>
              <Button
                type="button"
                onClick={onApply}
                className="w-full rounded-xl bg-black text-white hover:bg-gray-800">
                Показать билеты
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

function FilterInput({ compact = false, hint = '', label, onChange, type = 'text', value, ...props }) {
  return (
    <label className={compact ? 'block' : 'mb-6 block'}>
      <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
        {...props}
      />
      {hint && <span className="mt-2 block text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

function FilterSelect({ children, label, onChange, value, withoutMargin = false }) {
  return (
    <label className={withoutMargin ? 'block' : 'mb-6 block'}>
      <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black">
        {children}
      </select>
    </label>
  )
}
