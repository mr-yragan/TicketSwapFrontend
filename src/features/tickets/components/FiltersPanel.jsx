const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Ближайшие' },
  { value: 'date-desc', label: 'Поздние' },
  { value: 'price-asc', label: 'Дешевле' },
  { value: 'price-desc', label: 'Дороже' },
]

const INPUT_BASE_CLASSES = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'

export function FiltersPanel({ filters, onFilterChange, onReset, organizers = [], availableCities = [] }) {
  const handleNumberChange = (field) => (event) => {
    const value = typeof event === 'string' ? event : event.target.value
    if (!value || Number(value) >= 0) {
      onFilterChange(field, value)
    }
  }

  const normalizedSelectedCity = String(filters.city || '').trim()
  const cityValues = new Set(availableCities)
  if (normalizedSelectedCity) {
    cityValues.add(normalizedSelectedCity)
  }

  const cityOptions = Array.from(cityValues).sort((left, right) => left.localeCompare(right, 'ru'))

  return (
    <aside className="w-full flex-shrink-0 lg:w-64">
      <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Фильтры</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-gray-500 hover:text-black">
            Сбросить
          </button>
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
          label="ID события"
          value={filters.eventId || ''}
          onChange={(value) => onFilterChange('eventId', value)}
          placeholder="event-code"
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
      </div>
    </aside>
  )
}

function FilterInput({ compact = false, label, onChange, type = 'text', value, ...props }) {
  return (
    <label className={compact ? 'block' : 'mb-6 block'}>
      <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_BASE_CLASSES}
        {...props}
      />
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
        className={INPUT_BASE_CLASSES}>
        {children}
      </select>
    </label>
  )
}
