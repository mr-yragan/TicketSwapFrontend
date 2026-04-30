import { formatAuditAction, formatDateTime } from '../utils'

export function AdminAuditLogTable({ entries, error, loading }) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Журнал аудита</h2>
          <p className="text-sm text-gray-500">Последние 200 админских действий</p>
        </div>
        <p className="text-sm text-gray-500">Всего: {entries.length}</p>
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

function TableMessage({ children, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-gray-500">
        {children}
      </td>
    </tr>
  )
}
