import { Ban, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatOrganizerMode } from '../utils'

export function OrganizersTable({ actionId, loading, organizers, onToggleBan }) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Организаторы</h2>
          <p className="text-sm text-gray-500">Всего: {organizers.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Организатор</th>
              <th className="px-5 py-3">Почта</th>
              <th className="px-5 py-3">Тип</th>
              <th className="px-5 py-3">API-ключ</th>
              <th className="px-5 py-3">Статус</th>
              <th className="px-5 py-3 text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && organizers.length === 0 && <TableMessage>Загрузка...</TableMessage>}
            {!loading && organizers.length === 0 && <TableMessage>Организаторов пока нет</TableMessage>}

            {organizers.map((organizer) => (
              <tr key={organizer.id} className={organizer.banned ? 'bg-gray-50 text-gray-500' : ''}>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-950">{organizer.name}</div>
                  <div className="text-xs text-gray-500">ID {organizer.id}</div>
                </td>
                <td className="px-5 py-4">{organizer.contactEmail || '-'}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
                    {formatOrganizerMode(organizer.verificationMode)}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-xs">{organizer.apiKey || '-'}</td>
                <td className="px-5 py-4">
                  <OrganizerStatus banned={organizer.banned} />
                </td>
                <td className="px-5 py-4 text-right">
                  <BanToggleButton
                    actionId={actionId}
                    organizer={organizer}
                    onToggleBan={onToggleBan}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TableMessage({ children }) {
  return (
    <tr>
      <td colSpan="6" className="px-5 py-10 text-center text-gray-500">{children}</td>
    </tr>
  )
}

function OrganizerStatus({ banned }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      banned
        ? 'bg-red-50 text-red-700 border border-red-200'
        : 'bg-green-50 text-green-700 border border-green-200'
    }`}>
      {banned ? 'Заблокирован' : 'Активен'}
    </span>
  )
}

function BanToggleButton({ actionId, organizer, onToggleBan }) {
  const isPending = actionId === organizer.id

  return (
    <Button
      type="button"
      title={organizer.banned ? 'Разбанить организатора' : 'Забанить организатора'}
      onClick={() => onToggleBan(organizer)}
      disabled={isPending}
      className="h-10 bg-white text-black border border-gray-300 px-3 gap-2">
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : organizer.banned ? (
        <ShieldCheck size={16} />
      ) : (
        <Ban size={16} />
      )}
      {organizer.banned ? 'Разбанить' : 'Забанить'}
    </Button>
  )
}
