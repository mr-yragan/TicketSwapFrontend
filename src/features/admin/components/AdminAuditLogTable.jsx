import { formatAuditAction, formatDateTime } from '../utils'

export function AdminAuditLogTable({
  entries,
  error,
  filters,
  loading,
  onApplyFilters,
  onFilterChange,
  onResetFilters,
}) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Журнал аудита</h2>
          <p className="text-sm text-gray-500">Последние 200 админских действий</p>
        </div>
        <p className="text-sm text-gray-500">Всего: {entries.length}</p>
      </div>

      <div className="border-b border-gray-200 px-5 py-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterField
            label="Действие"
            value={filters.action}
            onChange={(value) => onFilterChange('action', value)}
            placeholder="Например, ORGANIZER_CREATED"
          />
          <FilterField
            label="Сущность"
            value={filters.entityType}
            onChange={(value) => onFilterChange('entityType', value)}
            placeholder="Например, ORGANIZER"
          />
          <FilterField
            label="ID сущности"
            type="number"
            value={filters.entityId}
            onChange={(value) => onFilterChange('entityId', value)}
            placeholder="Например, 42"
          />
          <FilterField
            label="ID пользователя"
            type="number"
            value={filters.actorUserId}
            onChange={(value) => onFilterChange('actorUserId', value)}
            placeholder="Например, 7"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onApplyFilters}
            disabled={loading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Загружаем...' : 'Применить фильтры'}
          </button>
          <button
            type="button"
            onClick={onResetFilters}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Сбросить
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Когда</th>
              <th className="px-5 py-3">Действие</th>
              <th className="px-5 py-3">Сущность</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Детали</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && entries.length === 0 && <TableMessage colSpan={5}>Загрузка аудита...</TableMessage>}
            {!loading && error && <TableMessage colSpan={5}>{error}</TableMessage>}
            {!loading && !error && entries.length === 0 && <TableMessage colSpan={5}>Записей пока нет</TableMessage>}

            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-5 py-4 text-xs text-gray-500">{formatDateTime(entry.createdAt)}</td>
                <td className="px-5 py-4 font-medium text-gray-950">{formatAuditAction(entry.action)}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-950">{entry.entityType || '-'}</div>
                  <div className="text-xs text-gray-500">ID {entry.entityId || '-'}</div>
                </td>
                <td className="px-5 py-4 text-gray-700">{entry.actorUserId || 'system'}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{entry.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FilterField({ label, onChange, type = 'text', value, placeholder }) {
  return (
    <label className="grid gap-1.5 text-sm text-gray-700">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-black"
      />
    </label>
  )
}

function TableMessage({ children, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-gray-500">
        {children}
      </td>
    </tr>
  )
}
