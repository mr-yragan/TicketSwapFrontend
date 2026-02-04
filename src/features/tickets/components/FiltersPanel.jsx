const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Сначала новые' },
  { value:  'price-asc', label: 'Дешевле' },
  { value: 'price-desc', label: 'Дороже' },
]

export function FiltersPanel({ filters, onFilterChange, availableCities = [] }) {
  const inputBaseClasses = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
  
  const handlePriceChange = (e) => {
    const val = e.target.value
    if (val && parseInt(val) < 0) {
      return
    }
    
    onFilterChange('maxPrice', val)
  }

  const cityOptions = [
    { value: '', label: 'Все города' },
    ...availableCities.map(city => ({
      value: city,
      label: city.charAt(0).toUpperCase() + city.slice(1)
    }))
  ]

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Фильтры</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Город
          </label>
          <select 
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value)}
            className={inputBaseClasses}>
            {cityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))} 
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Макс. цена
          </label>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={handlePriceChange}
            placeholder="не ограничено"
            min="0"
            step="1000"
            className={`${inputBaseClasses} focus:border-transparent`}/>
          {filters.maxPrice && (
            <span className="text-xs text-gray-500 mt-1 block">
              до {parseInt(filters.maxPrice).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сортировка
          </label>
          <select 
            value={filters.sortBy || 'date-asc'}
            onChange={(e) => onFilterChange('sortBy', e.target. value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none">
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  )
}